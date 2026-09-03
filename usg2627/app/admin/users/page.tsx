"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";
import Modal from "../../components/Modal";

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // HCI Modals State
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [errorMessageModal, setErrorMessageModal] = useState<string | null>(null);

  // Password Visibility Toggle State
  const [showPassword, setShowPassword] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State using Email
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "User",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchUsers();
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();

      if (json.success && json.users && Array.isArray(json.users)) {
        setUsersList(json.users);
      } else {
        // Fallback to direct Supabase fetch from user_profiles table
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .order("created_at", { ascending: false });

        setUsersList(data || []);
      }
    } catch (err) {
      console.error("fetchUsers error:", err);
      setUsersList([]);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const cleanName = formData.full_name.trim();

      if (!cleanEmail || !formData.password) {
        setSaving(false);
        setModalError("Please fill out required fields (Email Address and Password).");
        return;
      }

      if (formData.password.length < 6) {
        setSaving(false);
        setModalError("Password must be at least 6 characters long.");
        return;
      }

      // Send creation request to Next.js API route (/api/admin/users) with auto-confirmation flag
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: formData.password,
          full_name: cleanName,
          role: formData.role,
          email_confirm: autoConfirm,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setSaving(false);
        setModalError(result.error || "Failed to create user in Supabase Authentication.");
        return;
      }

      // Successfully created user in Supabase Auth & user_profiles
      if (result.user) {
        setUsersList((prev) => [result.user, ...prev.filter((u) => u.email !== result.user.email)]);
      } else {
        await fetchUsers();
      }

      showToast(`User account (${cleanEmail}) created in Supabase Auth successfully!`);

      // Reset Form & Close Modal
      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "User",
      });
      setAutoConfirm(true);
      setModalError(null);
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error creating user:", err);
      setModalError(`An error occurred while creating user: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Verification Handler
  const handleToggleVerification = async (user: any) => {
    const newVerifiedStatus = !user.is_verified;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          user_id: user.user_id,
          email: user.email,
          is_verified: newVerifiedStatus,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        // Fallback update
        await supabase
          .from("user_profiles")
          .update({ is_verified: newVerifiedStatus })
          .eq("id", user.id);
      }

      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_verified: newVerifiedStatus } : u))
      );

      showToast(
        newVerifiedStatus
          ? `Account (${user.email}) verified by Superadmin!`
          : `Account (${user.email}) set to unverified status.`
      );
    } catch (err: any) {
      console.error("Verification update error:", err);
    }
  };

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === "Admin" ? "User" : "Admin";

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          role: newRole,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        await supabase
          .from("user_profiles")
          .update({ role: newRole })
          .eq("id", user.id);
      }

      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      showToast(`User role updated to ${newRole}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      // 1. Call API route to delete from Supabase Auth (auth.users) & user_profiles
      const res = await fetch(
        `/api/admin/users?id=${deletingUser.id}&email=${encodeURIComponent(deletingUser.email || "")}`,
        { method: "DELETE" }
      );

      // 2. Direct RPC fallback call to permanently delete from auth.users database
      try {
        await supabase.rpc("delete_supabase_user", {
          target_email: deletingUser.email || "",
          target_user_id: deletingUser.user_id || deletingUser.id || null,
        });
      } catch (rpcErr) {
        console.warn("delete_supabase_user client fallback note:", rpcErr);
      }

      // 3. Delete from public.user_profiles table
      await supabase
        .from("user_profiles")
        .delete()
        .or(`id.eq.${deletingUser.id},email.eq.${deletingUser.email}`);

      setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id && u.email !== deletingUser.email));
      showToast(`User account (${deletingUser.email || deletingUser.full_name}) deleted from Supabase Auth & system!`);
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessageModal(`An error occurred while deleting user: ${err.message || "Unknown error"}`);
    } finally {
      setDeletingUser(null);
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading User Management Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl">

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-[100] flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-in fade-in duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E7C609"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>

              </div>
              <p className="text-slate-600 mt-1">
                Create & manage accounts with assigned roles (<strong>Admin</strong> or <strong>User</strong>).
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#173490] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e4bb8] cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="16" x2="22" y1="11" y2="11" />
              </svg>
              Add New User
            </button>
          </div>



          {/* Search & Filter Toolbar */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by name or email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-[#173490] focus:outline-none"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full md:w-48 rounded-lg border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-800 focus:border-[#173490] focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles ({usersList.length})</option>
                <option value="Admin">Admins Only</option>
                <option value="User">Users Only</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Registered Accounts ({filteredUsers.length})
            </h2>

            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="font-semibold">No user accounts found matching your filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">System Role</th>
                      <th className="px-6 py-4">Permissions</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition">

                        {/* User Details */}
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#173490] to-[#1e4bb8] text-white font-bold text-sm shadow-xs">
                              {user.full_name
                                ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                                : "US"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{user.full_name || "USG User"}</p>
                              <span className="text-xs text-slate-400">ID: {String(user.id).slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email Address */}
                        <td className="px-6 py-4 align-middle">
                          <span className="text-xs font-semibold text-slate-800 font-mono">
                            {user.email}
                          </span>
                        </td>

                        {/* System Role */}
                        <td className="px-6 py-4 align-middle">
                          {user.role === "Admin" ? (
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-800 border border-purple-200">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
                              User
                            </span>
                          )}
                        </td>

                        {/* Permissions */}
                        <td className="px-6 py-4 align-middle text-xs">
                          {user.role === "Admin" ? (
                            <span className="font-bold text-emerald-700">Full Access + Approval Authority</span>
                          ) : (
                            <span className="font-medium text-slate-600">Upload Only</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleRole(user)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              title="Toggle Admin / User Role"
                            >
                              Switch to {user.role === "Admin" ? "User" : "Admin"}
                            </button>

                            <button
                              onClick={() => setDeletingUser(user)}
                              className="rounded-lg bg-red-50 hover:bg-red-100 p-2 text-red-600 transition cursor-pointer"
                              title="Delete Account"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SUPABASE DASHBOARD STYLE: CREATE A NEW USER MODAL */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setModalError(null);
            }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative"
          >
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setModalError(null);
              }}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create a new user</h2>
              <p className="text-xs text-slate-500 mt-1">
                Create a user account in <strong>Supabase Authentication</strong>
              </p>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium flex items-start gap-2.5">
                <svg className="h-4 w-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>

              {/* System Role */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  System Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#173490] focus:outline-none cursor-pointer bg-white"
                >
                  <option value="User">User — Can upload documents (Pending Approval)</option>
                  <option value="Admin">Admin — Full privileges (Add/Edit/Delete & Approve/Reject)</option>
                </select>
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>

              {/* User Password */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  User Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-[#173490] focus:outline-none"
                    placeholder="Set user password (min. 6 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox: Auto confirm user? */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoConfirm}
                    onChange={(e) => setAutoConfirm(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#173490] focus:ring-[#173490]/20 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#173490] transition">
                      Auto confirm user?
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      A confirmation email will not be sent when creating a user via this form.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setModalError(null);
                  }}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {saving && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {saving ? "Creating user..." : "Create user"}
                </button>
              </div>
            </form>
          </Modal>

          {/* CONFIRMATION MODAL: DELETE USER */}
          <Modal
            isOpen={!!deletingUser}
            onClose={() => setDeletingUser(null)}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-center"
          >
            {deletingUser && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Delete User Account?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900">{deletingUser.full_name || deletingUser.email}</strong>? This user will no longer be able to log in.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setDeletingUser(null)}
                    className="w-1/2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="w-1/2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 cursor-pointer shadow-md"
                  >
                    Yes, Delete
                  </button>
                </div>
              </>
            )}
          </Modal>

          {/* ERROR NOTIFICATION MODAL */}
          <Modal
            isOpen={!!errorMessageModal}
            onClose={() => setErrorMessageModal(null)}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
          >
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">User Management Notice</h3>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {errorMessageModal}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setErrorMessageModal(null)}
                className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-md"
              >
                Understood
              </button>
            </div>
          </Modal>

        </div>
      </main>
    </div>
  );
}
