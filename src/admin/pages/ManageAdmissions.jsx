import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Save, FileText } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  id: null,
  title: "",
  description: "",
  requirements: "",
  application_open_date: "",
  application_deadline: "",
  extension_deadline: "",
  status: "Open",
  notes: "",
  is_active: true,
};

const ManageAdmissions = ({ onDataChanged }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAdmissions = async () => {
      const { data, error } = await supabase
        .from("admissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading admissions:", error);
        toast.error("Could not load admissions information.");
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) {
        if (data) {
          setFormData({
            id: data.id || null,
            title: data.title || "",
            description: data.description || "",
            requirements: data.requirements || "",
            application_open_date: data.application_open_date || "",
            application_deadline: data.application_deadline || "",
            extension_deadline: data.extension_deadline || "",
            status: data.status || "Open",
            notes: data.notes || "",
            is_active: data.is_active ?? true,
          });
        }

        setLoading(false);
      }
    };

    loadAdmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Admissions title is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving admissions...");

    const payload = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      application_open_date: formData.application_open_date || null,
      application_deadline: formData.application_deadline || null,
      extension_deadline: formData.extension_deadline || "",
      status: formData.status,
      notes: formData.notes,
      is_active: formData.is_active,
    };

    let error = null;

    if (formData.id) {
      const response = await supabase
        .from("admissions")
        .update(payload)
        .eq("id", formData.id);

      error = response.error;
    } else {
      const response = await supabase
        .from("admissions")
        .insert([payload])
        .select()
        .single();

      error = response.error;

      if (!error && response.data) {
        setFormData((prev) => ({
          ...prev,
          id: response.data.id,
        }));
      }
    }

    if (error) {
      console.error("Error saving admissions:", error);
      toast.error("Could not save admissions information.", { id: toastId });
      setSaving(false);
      return;
    }

    onDataChanged?.();
    toast.success("Admissions information saved successfully.", {
      id: toastId,
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
        <p className="text-gray-600">Loading admissions information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-5 h-5 text-amber-700" />
          <div>
            <h3 className="text-xl font-bold text-amber-950">
              Manage Admissions
            </h3>
            <p className="text-sm text-gray-600">
              Update admissions information shown on the public site
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-bold text-amber-900 mb-4">
              Basic Information
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Admissions Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter admissions title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Admissions Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter admissions description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  placeholder="Enter admission requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="5"
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-amber-900 mb-4">
              Important Dates and Status
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Applications Open Date
                </label>
                <input
                  type="date"
                  name="application_open_date"
                  value={formData.application_open_date}
                  onChange={handleChange}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Applications Deadline
                </label>
                <input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleChange}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Extension Deadline / Status
                </label>
                <input
                  type="text"
                  name="extension_deadline"
                  placeholder="e.g. 2026-07-15, To be announced, No extension"
                  value={formData.extension_deadline}
                  onChange={handleChange}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Admissions Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-amber-900 mb-4">
              Additional Information
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-950 mb-2">
                  Admission Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="Enter general notes about admissions, including any extension explanation if needed"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-amber-950">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                Make this admissions record active
              </label>
            </div>
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Admissions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmissions;
