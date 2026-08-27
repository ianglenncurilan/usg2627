"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";

export const departmentOptions = [
  "Department of Students' Welfare and Development",
  "Department of Public Information and Creative Communications",
  "Department of Interior, Local Governance and Subordinate Units",
  "Department of Finance and Treasury",
  "Department of Environment and Natural Resources",
  "Department of Budget and Management",
  "Department of Academics, Sports, Culture, Arts and Technology",
  "Office of the President",
  "Office of the Vice President",
  "Department of the Secretariat",
  "Office of the Student Regent",
];

export const roleOptions = [
  "USG President",
  "USG Vice President",
  "USG Executive Secretary",
  "USG Treasurer",
  "USG Auditor",
  "USG Senator",
  "CAALSG Governor",
  "CCISLSG Governor",
  "CEdLSG Governor",
  "CEGSLSG Governor",
  "CFESLSG Governor",
  "CHaSSLSG Governor",
  "CMNSLSG Governor",
  "USG Cabinet Secretary",
  "USG Chief of Staff",
  "USG Secretary for Records and Archives",
  "USG DBM Secretary",
  "USG DFT Secretary",
  "USG DSWD Secretary",
  "USG DILGSU Secretary",
  "USG DASCAT Secretary",
  "USG DENR Secretary",
  "USG DHWS Secretary",
  "USG DPICC Secretary",
  "USG Undersecretary",
  "USG Executive Assistant",
  "USG Senate Secretary",
  "USG House Secretary",
  "USG Administrative Staff",
  "USG COA Chief Commissioner",
  "USG COMELEC Chairperson",
];

const initialSeedMembers = [
  {
    id: "seed-1",
    name: "Cresencio U. Ablan",
    role: "USG Senator",
    department: "Department of Public Information and Creative Communications",
    profile_url: "/usg.jpg",
    phone_number: "(632) 552-6601 loc. 5301",
    email: "cresencio.ablan@carsu.edu.ph",
    facebook_url: "https://facebook.com",
    filed_bills: [
      {
        number: "Senate Bill No. 2627-021",
        title: "AN ACT ESTABLISHING COLLEGE-BASED MEDICAL RESPONSE TEAMS IN EACH COLLEGE OF CARAGA STATE UNIVERSITY – MAIN CAMPUS",
        description: "Mandates certified student emergency first-responder teams equipped with basic medical kits in each college to provide immediate response.",
      },
      {
        number: "Senate Bill No. 2627-022",
        title: "AN ACT INSTITUTIONALIZING A SEMESTRAL MENTAL HEALTH AND WELLNESS TRIVIA CHALLENGE FOR STUDENTS OF CARAGA STATE UNIVERSITY – MAIN CAMPUS",
        description: "Establishes semestral mental health trivia events promoting psychological well-being and campus support services.",
      },
    ],
    created_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "seed-2",
    name: "Win Gatchalian",
    role: "Legislative President",
    department: "Department of Students' Welfare and Development",
    profile_url: "/usg.jpg",
    phone_number: "(632) 552-6601 loc. 5301",
    email: "win.gatchalian@carsu.edu.ph",
    facebook_url: "https://facebook.com",
    filed_bills: [
      {
        number: "Senate Bill No. 2627-015",
        title: "AN ACT MODERNIZING THE UNIVERSITY STUDENT GOVERNMENT POLICY ENACTMENT PROCEDURE AND DIGITAL RESOLUTION REGISTRY",
        description: "Upgrades policy registration and digital resolution archiving for student access.",
      },
    ],
    created_at: "2026-08-19T10:00:00Z",
  },
];

export default function AdminMembersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Custom HCI Modals State
  const [deletingMember, setDeletingMember] = useState<any | null>(null);
  const [errorMessageModal, setErrorMessageModal] = useState<string | null>(null);

  const [dbError, setDbError] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "USG Senator",
    department: departmentOptions[0],
    profile_url: "",
    phone_number: "",
    email: "",
    facebook_url: "",
    filed_bills: [
      {
        number: "Senate Bill No. 2627-021",
        title: "",
        description: "",
      },
    ],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [membersList, setMembersList] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchMembers();
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

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching members:", error);
        if (error.message && (error.message.includes("relation") || error.message.includes("cache"))) {
          setDbError(true);
        }
        setMembersList(initialSeedMembers);
      } else {
        if (data && data.length > 0) {
          const mappedData = data.map((m: any) => ({
            ...m,
            name: m.name || m.full_name || "USG Member",
          }));
          setMembersList(mappedData);
        } else {
          setMembersList(initialSeedMembers);
        }
        setDbError(false);
      }
    } catch (err) {
      console.error(err);
      setMembersList(initialSeedMembers);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (fileToUpload: File) => {
    try {
      setUploadingImage(true);
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `member-${Date.now()}.${fileExt}`;
      const filePath = `members/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, fileToUpload);

      if (uploadError) {
        console.warn("Storage upload note:", uploadError.message);
        return URL.createObjectURL(fileToUpload);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Dynamic Filed Bills Handlers
  const handleAddBillField = () => {
    const nextIndex = formData.filed_bills.length + 1;
    const formattedNum = `Senate Bill No. 2627-0${nextIndex > 9 ? nextIndex : "2" + nextIndex}`;
    setFormData({
      ...formData,
      filed_bills: [...formData.filed_bills, { number: formattedNum, title: "", description: "" }],
    });
  };

  const handleRemoveBillField = (index: number) => {
    setFormData({
      ...formData,
      filed_bills: formData.filed_bills.filter((_, i) => i !== index),
    });
  };

  const handleBillChange = (index: number, field: "number" | "title" | "description", value: string) => {
    const updated = [...formData.filed_bills];
    updated[index][field] = value;
    setFormData({ ...formData, filed_bills: updated });
  };

  // Submit New Member
  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = formData.profile_url;
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const filteredBills = formData.filed_bills.filter(
        (b) => b.title.trim() !== "" || b.number.trim() !== "" || b.description?.trim() !== ""
      );

      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `member-${Date.now()}`;

      const newRecord: any = {
        name: formData.name,
        full_name: formData.name,
        slug: generatedSlug,
        role: formData.role,
        role_badge: formData.role,
        position: formData.role,
        title: formData.role,
        department: formData.department,
        department_name: formData.department,
        profile_url: avatarUrl || "/usg.jpg",
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        facebook_url: formData.facebook_url || null,
        filed_bills: filteredBills,
      };

      if (user?.id) {
        newRecord.created_by = user.id;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("members")
        .insert(newRecord)
        .select("*");

      if (insertError) {
        console.error("Supabase insert error details:", insertError);
        setErrorMessageModal(`Supabase Database Error: ${insertError.message}\n\nPlease make sure to execute the updated 006_create_members.sql migration script in your Supabase SQL Editor.`);
        setDbError(true);
      } else {
        showToast("USG Member added successfully to Supabase database!");
        setDbError(false);
        await fetchMembers();
        resetForm();
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setErrorMessageModal(`An error occurred while saving: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      role: item.role || "USG Senator",
      department: item.department || departmentOptions[0],
      profile_url: item.profile_url || "",
      phone_number: item.phone_number || "",
      email: item.email || "",
      facebook_url: item.facebook_url || "",
      filed_bills: item.filed_bills && item.filed_bills.length > 0 ? item.filed_bills : [{ number: "Senate Bill No. 2627-021", title: "", description: "" }],
    });
    setImageFile(null);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    try {
      let avatarUrl = formData.profile_url;
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      const filteredBills = formData.filed_bills.filter(
        (b) => b.title.trim() !== "" || b.number.trim() !== "" || b.description?.trim() !== ""
      );

      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `member-${Date.now()}`;

      const updatedFields: any = {
        name: formData.name,
        full_name: formData.name,
        slug: generatedSlug,
        role: formData.role,
        role_badge: formData.role,
        position: formData.role,
        title: formData.role,
        department: formData.department,
        department_name: formData.department,
        profile_url: avatarUrl || "/usg.jpg",
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        facebook_url: formData.facebook_url || null,
        filed_bills: filteredBills,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("members")
        .update(updatedFields)
        .eq("id", editingItem.id);

      if (error) {
        console.error("Supabase update error:", error);
        setErrorMessageModal(`Supabase Update Error: ${error.message}`);
      } else {
        showToast("Member updated successfully in Supabase database!");
        await fetchMembers();
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (err: any) {
      console.error("Edit error:", err);
      setErrorMessageModal(`An error occurred while updating: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Modern Confirmation Modal Delete Action
  const confirmDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", deletingMember.id);

      if (error) {
        console.warn("Delete DB error:", error.message);
        setErrorMessageModal(`Failed to delete member: ${error.message}`);
      } else {
        setMembersList((prev) => prev.filter((m) => m.id !== deletingMember.id));
        showToast("USG Member deleted successfully!");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessageModal("An unexpected error occurred while deleting the member.");
    } finally {
      setDeletingMember(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "USG Senator",
      department: departmentOptions[0],
      profile_url: "",
      phone_number: "",
      email: "",
      facebook_url: "",
      filed_bills: [
        {
          number: "Senate Bill No. 2627-021",
          title: "",
          description: "",
        },
      ],
    });
    setImageFile(null);
  };

  const filteredMembers = membersList.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "all" ||
      item.department?.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Members Portal...</p>
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
                <h1 className="text-2xl font-bold text-slate-900">USG Legislative Management</h1>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#173490]">
                  Legislative & Cabinet
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Add elected senators & appointed cabinet officers with profile images, departments, and filed bills.
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add New USG Member
            </button>
          </div>

          {/* Migration SQL Banner */}
          {dbError && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-5 shadow-sm text-amber-900">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-700"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                <h3 className="font-bold text-base">Supabase Migration Script Ready</h3>
              </div>
              <p className="text-sm mt-1 text-amber-800">
                To sync members to your Supabase database, run this SQL in Supabase SQL Editor:
              </p>
              <div className="mt-3 bg-slate-950 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-36 border border-slate-800">
                {`CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT, full_name TEXT, slug TEXT, role TEXT, role_badge TEXT, position TEXT, title TEXT, department TEXT, department_name TEXT, profile_url TEXT, phone_number TEXT, email TEXT, facebook_url TEXT, filed_bills JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view members" ON members;
DROP POLICY IF EXISTS "Anyone can insert members" ON members;
CREATE POLICY "Anyone can view members" ON members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert members" ON members FOR INSERT WITH CHECK (true);`}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by member name, role, or department..."
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
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Filter Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full md:w-64 rounded-lg border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-800 focus:border-[#173490] focus:outline-none cursor-pointer"
              >
                <option value="all">All Cabinet Departments ({membersList.length})</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Registered USG Members ({filteredMembers.length})
            </h2>

            {filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="font-semibold">No USG members found matching your search or filter.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-sm font-bold text-[#173490] hover:underline"
                >
                  + Add New Member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="px-6 py-4">Member Info</th>
                      <th className="px-6 py-4">Cabinet Department</th>
                      <th className="px-6 py-4">Contact Details</th>
                      <th className="px-6 py-4">Filed Bills</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition">
                        
                        {/* Member Info */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.profile_url || "/usg.jpg"}
                              alt={member.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 shadow-xs flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-base">{member.name}</p>
                              <span className="inline-block mt-0.5 rounded-full bg-[#173490]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#173490]">
                                {member.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cabinet Department */}
                        <td className="px-6 py-4 align-middle">
                          <span className="text-xs font-semibold text-slate-700">
                            {member.department}
                          </span>
                        </td>

                        {/* Contact Details */}
                        <td className="px-6 py-4 align-middle text-xs">
                          <div className="space-y-1">
                            {member.phone_number && (
                              <p className="text-slate-700">📞 {member.phone_number}</p>
                            )}
                            {member.email && (
                              <p className="text-slate-600 truncate max-w-xs">✉️ {member.email}</p>
                            )}
                          </div>
                        </td>

                        {/* Filed Bills */}
                        <td className="px-6 py-4 align-middle">
                          {member.filed_bills && member.filed_bills.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                              📜 {member.filed_bills.length} Filed Bill(s)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No bills filed</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="rounded-lg bg-slate-100 hover:bg-slate-200 p-2 text-slate-700 transition cursor-pointer"
                              title="Edit Member"
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
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </button>

                            <button
                              onClick={() => setDeletingMember(member)}
                              className="rounded-lg bg-red-50 hover:bg-red-100 p-2 text-red-600 transition cursor-pointer"
                              title="Delete Member"
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

          {/* ADD MEMBER MODAL */}
          {isAddModalOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 pt-20 overflow-y-auto"
              onClick={() => setIsAddModalOpen(false)}
            >
              <div
                className="relative my-auto w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
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

                <h2 className="text-xl font-bold text-slate-900 mb-1">Add New USG Member</h2>
                <p className="text-xs text-slate-500 mb-6">Enter member name, position, cabinet department, and filed bills with description</p>

                <form onSubmit={handleSubmitNew} className="space-y-4">
                  {/* Name & Role */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                        placeholder="e.g. Cresencio U. Ablan"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Position / Role (Dropdown) *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#173490] focus:outline-none cursor-pointer bg-white"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cabinet Department Dropdown */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Cabinet Department (Dropdown) *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#173490] focus:outline-none cursor-pointer"
                    >
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Upload Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Direct Phone / Contact Line
                      </label>
                      <input
                        type="text"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                        placeholder="(632) 552-6601 loc. 5301"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Official Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                        placeholder="cresencio.ablan@carsu.edu.ph"
                      />
                    </div>
                  </div>

                  {/* Facebook Link */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Facebook Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="https://facebook.com/username"
                    />
                  </div>

                  {/* FILED BILLS SECTION (Dynamic 1 or more bills with Description) */}
                  <div className="border-t border-slate-200 pt-4 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Filed Bills / Legislative Acts (Optional)</h3>
                        <p className="text-xs text-slate-500">Add bill number, act title, and bill description</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBillField}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#173490] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                      >
                        + Add Another Bill
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.filed_bills.map((bill, index) => (
                        <div key={index} className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row items-start gap-2">
                            <div className="w-full sm:w-56">
                              <input
                                type="text"
                                value={bill.number}
                                onChange={(e) => handleBillChange(index, "number", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold focus:border-[#173490] focus:outline-none"
                                placeholder="Senate Bill No. 2627-021"
                              />
                            </div>

                            <div className="flex-1 w-full">
                              <input
                                type="text"
                                value={bill.title}
                                onChange={(e) => handleBillChange(index, "title", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-[#173490] focus:outline-none"
                                placeholder="AN ACT ESTABLISHING COLLEGE-BASED MEDICAL RESPONSE TEAMS..."
                              />
                            </div>

                            {formData.filed_bills.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBillField(index)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold p-2 cursor-pointer"
                                title="Remove Bill"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Bill Description Input */}
                          <div>
                            <textarea
                              rows={2}
                              value={bill.description || ""}
                              onChange={(e) => handleBillChange(index, "description", e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#173490] focus:outline-none"
                              placeholder="Bill Description / Summary (e.g. Mandates immediate emergency first-responder units across colleges...)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
                      disabled={saving || uploadingImage}
                      className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {saving || uploadingImage ? "Saving..." : "Add Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT MEMBER MODAL */}
          {isEditModalOpen && editingItem && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 pt-20 overflow-y-auto"
              onClick={() => setIsEditModalOpen(false)}
            >
              <div
                className="relative my-auto w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsEditModalOpen(false)}
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

                <h2 className="text-xl font-bold text-slate-900 mb-1">Edit USG Member</h2>
                <p className="text-xs text-slate-500 mb-6">Update member profile, department, contact info, and filed bills with description</p>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Position / Role (Dropdown) *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#173490] focus:outline-none cursor-pointer bg-white"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Cabinet Department (Dropdown) *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#173490] focus:outline-none cursor-pointer"
                    >
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Update Profile Photo File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Direct Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Filed Bills with Description */}
                  <div className="border-t border-slate-200 pt-4 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900">Filed Bills / Legislative Acts</h3>
                      <button
                        type="button"
                        onClick={handleAddBillField}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#173490] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                      >
                        + Add Another Bill
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.filed_bills.map((bill, index) => (
                        <div key={index} className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row items-start gap-2">
                            <div className="w-full sm:w-56">
                              <input
                                type="text"
                                value={bill.number}
                                onChange={(e) => handleBillChange(index, "number", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold focus:border-[#173490] focus:outline-none"
                              />
                            </div>

                            <div className="flex-1 w-full">
                              <input
                                type="text"
                                value={bill.title}
                                onChange={(e) => handleBillChange(index, "title", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-[#173490] focus:outline-none"
                              />
                            </div>

                            {formData.filed_bills.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBillField(index)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold p-2 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Bill Description Input */}
                          <div>
                            <textarea
                              rows={2}
                              value={bill.description || ""}
                              onChange={(e) => handleBillChange(index, "description", e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#173490] focus:outline-none"
                              placeholder="Bill Description / Summary..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || uploadingImage}
                      className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {saving || uploadingImage ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODERN HCI CONFIRMATION MODAL: DELETE USG MEMBER */}
          {deletingMember && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setDeletingMember(null)}
            >
              <div
                className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Warning Icon Badge */}
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
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Delete USG Member?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900">{deletingMember.name}</strong> ({deletingMember.role})? This action cannot be undone.
                </p>

                {/* HCI Action Buttons */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setDeletingMember(null)}
                    className="w-1/2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteMember}
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
                  <h3 className="text-lg font-bold text-slate-900">Database Operation Notice</h3>
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
