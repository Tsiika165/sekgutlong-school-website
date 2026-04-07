import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  Pencil,
  Save,
  X,
  Pin,
  PinOff,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const emptyForm = {
  title: "",
  content: "",
  published: false,
  is_pinned: false,
};

const ManageNews = ({ onDataChanged }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading announcements:", error.message);
        toast.error("Failed to load announcements.");
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) {
        setAnnouncements(data || []);
        setLoading(false);
      }
    };

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadAnnouncements = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error refreshing announcements:", error.message);
      toast.error("Failed to refresh announcements.");
      return;
    }

    setAnnouncements(data || []);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and announcement content are required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving announcement...");

    const { error } = await supabase.from("news").insert([
      {
        title: formData.title,
        content: formData.content,
        published: formData.published,
        is_pinned: formData.is_pinned,
      },
    ]);

    if (error) {
      console.error("Error adding announcement:", error.message);
      toast.error("Could not save announcement.", { id: toastId });
      setSaving(false);
      return;
    }

    setFormData(emptyForm);
    await reloadAnnouncements();
    onDataChanged?.();
    setSaving(false);
    toast.success("Announcement added successfully.", { id: toastId });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title || "",
      content: item.content || "",
      published: !!item.published,
      is_pinned: !!item.is_pinned,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error("Title and announcement content are required.");
      return;
    }

    const toastId = toast.loading("Updating announcement...");

    const { error } = await supabase
      .from("news")
      .update({
        title: editForm.title,
        content: editForm.content,
        published: editForm.published,
        is_pinned: editForm.is_pinned,
      })
      .eq("id", editingId);

    if (error) {
      console.error("Error updating announcement:", error.message);
      toast.error("Could not update announcement.", { id: toastId });
      return;
    }

    await reloadAnnouncements();
    onDataChanged?.();
    cancelEdit();
    toast.success("Announcement updated.", { id: toastId });
  };

  const openDeleteConfirm = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedDeleteId) return;

    const toastId = toast.loading("Deleting announcement...");

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", selectedDeleteId);

    if (error) {
      console.error("Error deleting announcement:", error.message);
      toast.error("Could not delete announcement.", { id: toastId });
      return;
    }

    await reloadAnnouncements();
    onDataChanged?.();
    setConfirmOpen(false);
    setSelectedDeleteId(null);
    toast.success("Announcement deleted.", { id: toastId });
  };

  const handleTogglePublished = async (id, currentValue) => {
    const toastId = toast.loading(
      currentValue
        ? "Unpublishing announcement..."
        : "Publishing announcement...",
    );

    const { error } = await supabase
      .from("news")
      .update({ published: !currentValue })
      .eq("id", id);

    if (error) {
      console.error("Error updating publish status:", error.message);
      toast.error("Could not update publish status.", { id: toastId });
      return;
    }

    await reloadAnnouncements();
    onDataChanged?.();
    toast.success(
      currentValue ? "Announcement unpublished." : "Announcement published.",
      { id: toastId },
    );
  };

  const handleTogglePinned = async (id, currentValue) => {
    const toastId = toast.loading(
      currentValue ? "Unpinning announcement..." : "Pinning announcement...",
    );

    const { error } = await supabase
      .from("news")
      .update({ is_pinned: !currentValue })
      .eq("id", id);

    if (error) {
      console.error("Error updating pin status:", error.message);
      toast.error("Could not update pin status.", { id: toastId });
      return;
    }

    await reloadAnnouncements();
    onDataChanged?.();
    toast.success(
      currentValue ? "Announcement unpinned." : "Announcement pinned.",
      { id: toastId },
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-amber-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="w-5 h-5 text-amber-700" />
            <h3 className="text-xl font-bold">Add Announcement</h3>
          </div>

          <form onSubmit={handleAddAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-950 mb-2">
                Announcement Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                required
                className="w-full border border-amber-200 p-3 rounded-xl outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-950 mb-2">
                Announcement Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write the full announcement"
                required
                rows="6"
                className="w-full border border-amber-200 p-3 rounded-xl outline-none focus:border-amber-600 resize-none"
              />
            </div>

            <label className="flex gap-2 items-center text-sm font-medium text-amber-950">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              Publish now
            </label>

            <label className="flex gap-2 items-center text-sm font-medium text-amber-950">
              <input
                type="checkbox"
                name="is_pinned"
                checked={formData.is_pinned}
                onChange={handleChange}
              />
              Pin this announcement
            </label>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Saving..." : "Add Announcement"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="w-5 h-5 text-amber-700" />
            <h3 className="text-xl font-bold">All Announcements</h3>
          </div>

          {loading && <p className="text-gray-600">Loading announcements...</p>}

          {!loading && announcements.length === 0 && (
            <p className="text-gray-600">No announcements found.</p>
          )}

          {!loading &&
            announcements.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`border p-4 rounded-xl mb-3 ${
                    item.is_pinned
                      ? "border-amber-400 bg-amber-50/40"
                      : "border-amber-200"
                  }`}
                >
                  {!isEditing ? (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-amber-950">
                            {item.title}
                          </p>
                          {item.is_pinned && (
                            <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                              Pinned
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          Posted on {formatDate(item.created_at)}
                        </p>

                        <p className="text-sm mt-2">
                          Status:{" "}
                          <span
                            className={`font-medium ${
                              item.published
                                ? "text-green-700"
                                : "text-yellow-700"
                            }`}
                          >
                            {item.published ? "Published" : "Draft"}
                          </span>
                        </p>

                        <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => startEdit(item)}
                          className="bg-amber-100 px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleTogglePinned(item.id, item.is_pinned)
                          }
                          className="bg-orange-100 px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          {item.is_pinned ? (
                            <>
                              <PinOff className="w-4 h-4" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="w-4 h-4" />
                              Pin
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleTogglePublished(item.id, item.published)
                          }
                          className="bg-yellow-200 px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          {item.published ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Publish
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => openDeleteConfirm(item.id)}
                          className="bg-red-200 px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-amber-950 mb-2">
                          Announcement Title
                        </label>
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full border border-amber-200 p-3 rounded-xl outline-none focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-950 mb-2">
                          Announcement Content
                        </label>
                        <textarea
                          name="content"
                          value={editForm.content}
                          onChange={handleEditChange}
                          rows="6"
                          className="w-full border border-amber-200 p-3 rounded-xl outline-none focus:border-amber-600 resize-none"
                        />
                      </div>

                      <label className="flex gap-2 items-center text-sm font-medium text-amber-950">
                        <input
                          type="checkbox"
                          name="published"
                          checked={editForm.published}
                          onChange={handleEditChange}
                        />
                        Published
                      </label>

                      <label className="flex gap-2 items-center text-sm font-medium text-amber-950">
                        <input
                          type="checkbox"
                          name="is_pinned"
                          checked={editForm.is_pinned}
                          onChange={handleEditChange}
                        />
                        Pinned
                      </label>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-100 px-4 py-2 rounded-lg flex items-center gap-2 text-green-700"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700"
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
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        onConfirm={handleDeleteAnnouncement}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
};

export default ManageNews;
