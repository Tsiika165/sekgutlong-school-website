import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../components/PageLayout";
import { supabase } from "../lib/supabase";
import {
  Upload,
  UserCircle2,
  LogOut,
  Clock3,
  CheckCircle2,
  XCircle,
  Mail,
  Briefcase,
  BookOpen,
  Quote,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const StaffApply = ({ profile, handleLogout }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    subjects: "",
    grades: "",
    favourite_quote: "",
    email: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [reviewedAt, setReviewedAt] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadExistingSubmission = async () => {
      setFormData((prev) => ({
        ...prev,
        full_name: profile?.full_name || "",
        email: profile?.email || "",
      }));

      if (!profile?.email) return;

      const { data, error } = await supabase
        .from("staff_submissions")
        .select("*")
        .eq("email", profile.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading existing submission:", error);
        return;
      }

      if (data) {
        setFormData({
          full_name: data.full_name || profile?.full_name || "",
          role: data.role || "",
          subjects: data.subjects || "",
          grades: data.grades || "",
          favourite_quote: data.favourite_quote || "",
          email: data.email || profile?.email || "",
        });

        setSubmissionStatus(data.status || "pending");
        setReviewedAt(data.reviewed_at || null);
        setPhotoPreview(data.photo_url || "");
      } else {
        setSubmissionStatus(null);
        setReviewedAt(null);
        setPhotoPreview("");
      }
    };

    loadExistingSubmission();
  }, [profile]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please choose an image file only.");
      return;
    }

    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(selectedFile);
    setPhotoPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Submitting profile...");

    let photoUrl = "";

    if (photoFile) {
      const fileName = `${Date.now()}-${photoFile.name.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("news-media")
        .upload(fileName, photoFile);

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        toast.error(uploadError.message, { id: toastId });
        setSubmitting(false);
        return;
      }

      const { data } = supabase.storage
        .from("news-media")
        .getPublicUrl(fileName);

      photoUrl = data.publicUrl;
    }

    const payload = {
      ...formData,
      status: "pending",
      reviewed_at: null,
    };

    if (photoUrl) {
      payload.photo_url = photoUrl;
    }

    const { error } = await supabase
      .from("staff_submissions")
      .upsert([payload], { onConflict: "email" });

    if (error) {
      console.error("Submission error:", error);
      toast.error(error.message, { id: toastId });
      setSubmitting(false);
      return;
    }

    setSubmissionStatus("pending");
    setReviewedAt(null);
    setPhotoFile(null);
    setSubmitting(false);

    toast.success("Your profile submission has been sent for admin review.", {
      id: toastId,
    });
  };

  const getStatusUI = () => {
    if (!submissionStatus) return null;

    if (submissionStatus === "approved") {
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        text: "Approved",
        message:
          "Your profile has been approved and is ready for public display.",
        classes: "bg-green-50 text-green-700 border-green-200",
      };
    }

    if (submissionStatus === "rejected") {
      return {
        icon: <XCircle className="w-4 h-4" />,
        text: "Rejected",
        message: "Your submission was reviewed but not approved yet.",
        classes: "bg-red-50 text-red-700 border-red-200",
      };
    }

    return {
      icon: <Clock3 className="w-4 h-4" />,
      text: "Pending Review",
      message: "Your submission is waiting for admin approval.",
      classes: "bg-yellow-50 text-yellow-800 border-yellow-200",
    };
  };

  const statusUI = getStatusUI();

  const formatReviewedAt = (value) => {
    if (!value) return null;

    return new Date(value).toLocaleString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageLayout
      title="Staff Profile Submission"
      subtitle="Complete your staff profile for admin approval and public display"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="bg-white border border-amber-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <UserCircle2 className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-amber-950">
                {profile?.full_name || "User"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition self-start md:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {statusUI && (
          <div
            className={`border rounded-2xl p-4 md:p-5 shadow-sm ${statusUI.classes}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{statusUI.icon}</div>
              <div>
                <p className="font-semibold">Status: {statusUI.text}</p>
                <p className="text-sm mt-1">{statusUI.message}</p>

                {reviewedAt && (
                  <p className="text-sm mt-2 opacity-80">
                    Reviewed on: {formatReviewedAt(reviewedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-amber-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="border-b border-amber-100 bg-amber-50/60 px-6 md:px-8 py-5">
            <h2 className="text-xl font-bold text-amber-950">
              Build Your Public Staff Profile
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in your professional details so the school can publish your
              profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-amber-700" />
                    <h3 className="text-lg font-semibold text-amber-950">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-amber-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-700" />
                    <h3 className="text-lg font-semibold text-amber-950">
                      Professional Information
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        placeholder="e.g. Teacher, HOD"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Subjects
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="subjects"
                          placeholder="e.g. Mathematics, Physical Sciences"
                          value={formData.subjects}
                          onChange={handleChange}
                          className="w-full border border-amber-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Grades
                      </label>
                      <input
                        type="text"
                        name="grades"
                        placeholder="e.g. Grade 10, Grade 11"
                        value={formData.grades}
                        onChange={handleChange}
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Quote className="w-5 h-5 text-amber-700" />
                    <h3 className="text-lg font-semibold text-amber-950">
                      Personal Touch
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                      Favourite Quote
                    </label>
                    <textarea
                      name="favourite_quote"
                      placeholder="Share a short quote that reflects your personality or teaching approach"
                      value={formData.favourite_quote}
                      onChange={handleChange}
                      rows="4"
                      className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 resize-none"
                    ></textarea>
                  </div>
                </section>
              </div>

              <div>
                <section className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 md:p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-amber-700" />
                    <h3 className="text-lg font-semibold text-amber-950">
                      Profile Photo
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-white p-4">
                      <div className="w-full h-64 rounded-2xl bg-amber-50 flex items-center justify-center overflow-hidden border border-amber-100">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center px-4">
                            <UserCircle2 className="w-16 h-16 text-amber-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-amber-900">
                              No photo selected yet
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Upload a clear professional-looking profile photo
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
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
                        <p className="text-sm text-gray-600 mt-3 break-words">
                          Selected: {photoFile.name}
                        </p>
                      )}
                    </div>

                    <div className="bg-white border border-amber-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-900 mb-2">
                        Photo Tips
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use a clear front-facing photo</li>
                        <li>• Make sure your face is visible</li>
                        <li>• Keep the background simple if possible</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-amber-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Ready to submit?
                </p>
                <p className="text-sm text-gray-600">
                  Your submission will be reviewed by an admin before it appears
                  publicly.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition min-w-[180px]"
              >
                {submitting ? "Submitting..." : "Submit Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default StaffApply;
