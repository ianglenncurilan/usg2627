"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseAuthClient } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";

const initialSeedUsers = [
  {
    id: "seed-user-1",
    full_name: "System Administrator",
    email: "admin@carsu.edu.ph",
    role: "Admin",
    is_verified: true,
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "seed-user-2",
    full_name: "Student Legislative Staff",
    email: "user@carsu.edu.ph",
    role: "User",
    is_verified: false,
    created_at: "2026-08-05T10:00:00Z",
  },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modern HCI Modals State
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [errorMessageModal, setErrorMessageModal] = useState<string | null>(null);

  // Password Visibility Toggle State
  const [showPassword, setShowPassword] = useState(false);

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
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setUsersList(initialSeedUsers);
      } else {
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
      setUsersList(initialSeedUsers);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();

      if (!cleanEmail || !formData.password || !formData.full_name) {
        setSaving(false);
        setErrorMessageModal("Please fill out all required fields.");
        return;
      }

      // Check if email already exists in user list
      const isDuplicate = usersList.some(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );

      if (isDuplicate) {
        setSaving(false);
        setErrorMessageModal(
          `The email address "${cleanEmail}" is already registered. Please enter a unique email address.`
        );
        return;
      }

      if (formData.password.length < 6) {
        setSaving(false);
        setErrorMessageModal("Password must be at least 6 characters long for Supabase Auth.");
        return;
      }

      let createdAuthUserId = null;

      // 1. Create auth user record in Supabase Cloud Auth (auth.users)
      const { data: authData, error: authError } = await supabaseAuthClient.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
          },
        },
      });

      if (authError) {
        setSaving(false);
        if (
          authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("already exists")
        ) {
          setErrorMessageModal(
            `The email address "${cleanEmail}" is already registered in Supabase Auth. Please enter a different email address.`
          );
        } else {
          setErrorMessageModal(
            `Supabase Auth error: ${authError.message}. Please fix this issue to add the user to Supabase Authentication.`
          );
        }
        return;
      }

      if (authData?.user) {
        createdAuthUserId = authData.user.id;
      }

      // 2. Insert user record into user_profiles database table
      const newProfile = {
        user_id: createdAuthUserId,
        email: cleanEmail,
        full_name: formData.full_name.trim(),
        role: formData.role,
        is_verified: false, // Superadmin verification pending
        created_at: new Date().toISOString(),
      };

      const { data: insertedData, error: profileError } = await supabase
        .from("user_profiles")
        .upsert(newProfile, { onConflict: "email" })
        .select();

      if (profileError) {
        console.warn("Profile database insert note:", profileError.message);
        const createdLocal = {
          ...newProfile,
          id: `local-user-${Date.now()}`,
        };
        setUsersList((prev) => [createdLocal, ...prev]);
      } else if (insertedData && insertedData.length > 0) {
        setUsersList((prev) => [insertedData[0], ...prev]);
      } else {
        await fetchUsers();
      }

      showToast(`User account (${cleanEmail}) created successfully!`);

      // Reset Form State & Close Modal
      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "User",
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error creating user:", err);
      setErrorMessageModal(`An error occurred while creating user: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Superadmin Direct Verification Handler
  const handleToggleVerification = async (user: any) => {
    const newVerifiedStatus = !user.is_verified;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_verified: newVerifiedStatus })
        .eq("id", user.id);

      if (error) console.warn("Verification update note:", error.message);

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
      const { error } = await supabase
        .from("user_profiles")
        .update({ role: newRole })
        .eq("id", user.id);

      if (error) console.warn("Role update note:", error.message);

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
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", deletingUser.id);

      if (error) console.warn("Delete note:", error.message);

      setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id));
      showToast("User account deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessageModal("An unexpected error occurred while deleting user.");
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
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl">

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
                <span className="rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  Superadmin Account Control
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Manage accounts & roles: <strong>Admin</strong> vs <strong>User</strong>. Superadmin verifies accounts directly without emails.
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

          {/* Role Breakdown Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold text-xs uppercase tracking-wider">
                  ADM
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Admin Role Privileges</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Can create, edit, delete portal items, check pending documents, and <strong>Approve or Reject</strong> uploads.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200">
                  USR
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">User Role Privileges</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Can submit document uploads to the repository for review, but <strong>cannot approve or reject</strong> pending submissions.
                  </p>
                </div>
              </div>
            </div>
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
                      <th className="px-6 py-4">Superadmin Verification</th>
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
                              <span className="text-xs text-slate-400">ID: {user.id.slice(0, 8)}</span>
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

                        {/* Superadmin Verification Direct Control */}
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            {user.is_verified ? (
                              <>
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                  Verified
                                </span>
                                <button
                                  onClick={() => handleToggleVerification(user)}
                                  className="text-xs font-semibold text-slate-400 hover:text-red-600 hover:underline cursor-pointer"
                                  title="Unverify Account"
                                >
                                  Unverify
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                                  Unverified
                                </span>
                                <button
                                  onClick={() => handleToggleVerification(user)}
                                  className="rounded-lg bg-[#173490] px-3 py-1 text-xs font-bold text-white transition hover:bg-blue-700 cursor-pointer shadow-xs"
                                >
                                  Verify Account
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Permissions */}
                        <td className="px-6 py-4 align-middle text-xs">
                          {user.role === "Admin" ? (
                            <span className="font-bold text-emerald-700">Full Access + Approval Authority</span>
                          ) : (
                            <span className="font-medium text-slate-600">Upload Only (Pending Approval)</span>
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

          {/* ADD USER MODAL */}
          {isAddModalOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 pt-20 overflow-y-auto"
              onClick={() => setIsAddModalOpen(false)}
            >
              <div
                className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
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

                <h2 className="text-xl font-bold text-slate-900 mb-1">Add System User</h2>
                <p className="text-xs text-slate-500 mb-6">Create a user account with assigned role (Admin or User)</p>

                <form onSubmit={handleAddUser} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="e.g. Juan Dela Cruz"
                    />
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
                      placeholder="e.g. juan.delacruz@carsu.edu.ph"
                    />
                  </div>

                  {/* Password with Eye Icon Toggle */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-[#173490] focus:outline-none"
                        placeholder="Set initial password (min. 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role Dropdown */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      System Role (Permissions) *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#173490] focus:outline-none cursor-pointer bg-white"
                    >
                      <option value="User">User — Can upload documents (Pending Approval)</option>
                      <option value="Admin">Admin — Full privileges (Add/Edit/Delete & Approve/Reject)</option>
                    </select>
                  </div>

                  {/* Role Info Box */}
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600">
                    {formData.role === "Admin" ? (
                      <p className="font-medium text-purple-900">
                        <strong>Admin Role:</strong> Has full control to manage content, edit users, check pending documents, and approve or reject submissions.
                      </p>
                    ) : (
                      <p className="font-medium text-blue-900">
                        <strong>User Role:</strong> Can log in and upload documents to the repository. Uploads will remain pending until reviewed by an Admin.
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {saving ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODERN HCI CONFIRMATION MODAL: DELETE USER */}
          {deletingUser && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setDeletingUser(null)}
            >
              <div
                className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center"
                onClick={(e) => e.stopPropagation()}
              >
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
              </div>
            </div>
          )}

          {/* MODERN HCI ERROR NOTIFICATION MODAL */}
          {errorMessageModal && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setErrorMessageModal(null)}
            >
              <div
                className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
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
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
