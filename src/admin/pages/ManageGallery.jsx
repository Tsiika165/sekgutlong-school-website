import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Trash2, Upload, Plus, Pencil, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const emptyForm = {
  title: "",
  description: "",
};

const ManageGallery = ({ onDataChanged }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [file, setFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading gallery:", error);
        toast.error("Failed to load gallery.");
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setGalleryItems(data || []);
        setLoading(false);
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadGallery = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reloading gallery:", error);
      toast.error("Failed to refresh gallery.");
      return;
    }

    setGalleryItems(data || []);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const detectMediaType = (selectedFile) => {
    if (selectedFile.type.startsWith("image/")) return "image";
    if (selectedFile.type.startsWith("video/")) return "video";
    return null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Select a file first.");
      return;
    }

    const mediaType = detectMediaType(file);
    if (!mediaType) {
      toast.error("Only image or video files are allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Max file size is 50MB.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading media...");

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const { error: uploadError } = await supabase.storage
      .from("news-media")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error(uploadError.message, { id: toastId });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("news-media").getPublicUrl(fileName);
    const fileUrl = data.publicUrl;

    const { error: insertError } = await supabase.from("gallery").insert([
      {
        title: formData.title,
        description: formData.description,
        media_type: mediaType,
        file_url: fileUrl,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      toast.error("Could not save gallery item.", { id: toastId });
      setUploading(false);
      return;
    }

    setFile(null);
    setFormData(emptyForm);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    await reloadGallery();
    onDataChanged?.();
    setUploading(false);
    toast.success("Media uploaded successfully.", { id: toastId });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title || "",
      description: item.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const toastId = toast.loading("Updating gallery item...");

    const { error } = await supabase
      .from("gallery")
      .update({
        title: editForm.title,
        description: editForm.description,
      })
      .eq("id", editingId);

    if (error) {
      console.error("Edit error:", error);
      toast.error("Could not update gallery item.", { id: toastId });
      return;
    }

    await reloadGallery();
    onDataChanged?.();
    cancelEdit();
    toast.success("Gallery item updated.", { id: toastId });
  };

  const openDeleteConfirm = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    const toastId = toast.loading("Deleting item...");

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", selectedDeleteId);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Could not delete item.", { id: toastId });
      return;
    }

    await reloadGallery();
    onDataChanged?.();
    setConfirmOpen(false);
    setSelectedDeleteId(null);
    toast.success("Gallery item deleted.", { id: toastId });
  };

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-amber-200">
          <h3 className="text-xl font-bold mb-4">Upload Media</h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-950 mb-2">
                Title
              </label>
              <input
                placeholder="Enter media title"
                value={formData.title}
                required
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border p-3 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-950 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter media description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border p-3 rounded-xl"
                rows="4"
              />
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative border-2 border-dashed p-8 rounded-xl text-center"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute top-3 left-3 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full shadow"
              >
                <Plus className="w-4 h-4" />
              </button>

              <Upload className="mx-auto mb-2" />

              {file ? (
                <p className="font-medium">{file.name}</p>
              ) : (
                <p>Drag & drop file here or use + button</p>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="submit"
              disabled={uploading}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-200">
          <h3 className="text-xl font-bold mb-4">Gallery</h3>

          {loading && <p className="text-gray-600">Loading gallery...</p>}

          {!loading && galleryItems.length === 0 && (
            <p className="text-gray-600">No gallery items found.</p>
          )}

          {!loading &&
            galleryItems.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className="border border-amber-200 rounded-xl p-4 mb-4"
                >
                  {!isEditing ? (
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-20 h-16 bg-gray-200 rounded overflow-hidden">
                          {item.media_type === "image" ? (
                            <img
                              src={item.file_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={item.file_url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-amber-950">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.media_type}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="bg-amber-100 px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
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
                          Title
                        </label>
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full border p-3 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-950 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          rows="4"
                          className="w-full border p-3 rounded-xl"
                        />
                      </div>

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
        onConfirm={handleDelete}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
};

export default ManageGallery;
