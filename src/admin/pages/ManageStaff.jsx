import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Pencil,
  Trash2,
  Save,
  X,
  UserCircle2,
  Upload,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const emptyForm = {
  id: "",
  full_name: "",
  role: "",
  subject: "",
  subjects: "",
  grades: "",
  email: "",
  photo_url: "",
  favourite_quote: "",
};

const ManageStaff = ({ onDataChanged }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading staff:", error);
        toast.error("Could not load staff.");
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) {
        setStaffMembers(data || []);
        setLoading(false);
      }
    };

    fetchStaff();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadStaff = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reloading staff:", error);
      toast.error("Could not reload staff.");
      setLoading(false);
      return;
    }

    setStaffMembers(data || []);
    setLoading(false);
  };

  const startEdit = (member) => {
    setEditingId(member.id);
    setPhotoFile(null);
    setFormData({
      id: member.id || "",
      full_name: member.full_name || "",
      role: member.role || "",
      subject: member.subject || "",
      subjects: member.subjects || member.subject || "",
      grades: member.grades || "",
      email: member.email || "",
      photo_url: member.photo_url || "",
      favourite_quote: member.favourite_quote || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setPhotoFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please choose an image file only.");
      return;
    }

    setPhotoFile(selectedFile);
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    const toastId = toast.loading("Saving staff member...");
    let finalPhotoUrl = formData.photo_url;

    if (photoFile) {
      const fileName = `${Date.now()}-${photoFile.name.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("news-media")
        .upload(fileName, photoFile);

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        toast.error(uploadError.message, { id: toastId });
        return;
      }

      const { data } = supabase.storage
        .from("news-media")
        .getPublicUrl(fileName);

      finalPhotoUrl = data.publicUrl;
    }

    const payload = {
      full_name: formData.full_name,
      role: formData.role,
      subject: formData.subjects || formData.subject,
      subjects: formData.subjects,
      grades: formData.grades,
      email: formData.email,
      photo_url: finalPhotoUrl,
      favourite_quote: formData.favourite_quote,
    };

    const { error } = await supabase
      .from("staff")
      .update(payload)
      .eq("id", editingId);

    if (error) {
      console.error("Error updating staff:", error);
      toast.error("Could not update staff member.", { id: toastId });
      return;
    }

    cancelEdit();
    await reloadStaff();
    onDataChanged?.();
    toast.success("Staff member updated.", { id: toastId });
  };

  const openDeleteConfirm = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    const toastId = toast.loading("Deleting staff member...");

    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", selectedDeleteId);

    if (error) {
      console.error("Error deleting staff:", error);
      toast.error("Could not delete staff member.", { id: toastId });
      return;
    }

    await reloadStaff();
    onDataChanged?.();
    setConfirmOpen(false);
    setSelectedDeleteId(null);
    toast.success("Staff member deleted.", { id: toastId });
  };

  const filteredStaff = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return staffMembers.filter((member) => {
      if (!query) return true;

      return (
        member.full_name?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        member.subjects?.toLowerCase().includes(query) ||
        member.subject?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
    });
  }, [staffMembers, searchTerm]);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-amber-950">Manage Staff</h3>
            <p className="text-sm text-gray-600">
              Edit or remove approved staff profiles
            </p>
          </div>

          <div className="relative mb-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, subject, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-amber-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-600"
            />
          </div>

          {!loading && (
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredStaff.length} of {staffMembers.length} staff
              members
            </p>
          )}

          {loading && <p className="text-gray-600">Loading staff members...</p>}

          {!loading && filteredStaff.length === 0 && (
            <p className="text-gray-600">No staff members found.</p>
          )}

          {!loading && filteredStaff.length > 0 && (
            <div className="space-y-4">
              {filteredStaff.map((member) => {
                const isEditing = editingId === member.id;

                return (
                  <div
                    key={member.id}
                    className="border border-amber-200 rounded-2xl p-5"
                  >
                    {!isEditing ? (
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserCircle2 className="w-10 h-10 text-amber-400" />
                            )}
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-amber-950">
                              {member.full_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {member.role || "No role"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Subjects:{" "}
                              {member.subjects ||
                                member.subject ||
                                "Not provided"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Grades: {member.grades || "Not provided"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Email: {member.email || "Not provided"}
                            </p>

                            {member.favourite_quote && (
                              <p className="text-sm text-gray-700 italic mt-2">
                                “{member.favourite_quote}”
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(member)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => openDeleteConfirm(member.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="full_name"
                            placeholder="Full Name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                          />

                          <input
                            type="text"
                            name="role"
                            placeholder="Role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                          />

                          <input
                            type="text"
                            name="subjects"
                            placeholder="Subjects"
                            value={formData.subjects}
                            onChange={handleChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                          />

                          <input
                            type="text"
                            name="grades"
                            placeholder="Grades"
                            value={formData.grades}
                            onChange={handleChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                          />

                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                          />
                        </div>

                        <div className="border border-amber-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-amber-900 mb-3">
                            Update Profile Photo
                          </p>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Choose Photo
                          </button>

                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                          />

                          {photoFile && (
                            <p className="text-sm text-gray-600 mt-3">
                              {photoFile.name}
                            </p>
                          )}

                          {!photoFile && formData.photo_url && (
                            <p className="text-sm text-gray-500 mt-3">
                              Current photo already set
                            </p>
                          )}
                        </div>

                        <textarea
                          name="favourite_quote"
                          placeholder="Favourite Quote"
                          value={formData.favourite_quote}
                          onChange={handleChange}
                          rows="4"
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 resize-none"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
};

export default ManageStaff;
