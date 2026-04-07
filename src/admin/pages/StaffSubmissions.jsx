import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  UserCircle2,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const StaffSubmissions = ({ onDataChanged }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const loadSubmissions = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("staff_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading staff submissions:", error);
      toast.error("Could not load staff submissions.");
      setLoading(false);
      return;
    }

    setSubmissions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("staff_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading staff submissions:", error);
        if (isMounted) {
          toast.error("Could not load staff submissions.");
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setSubmissions(data || []);
        setLoading(false);
      }
    };

    fetchSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const openApproveConfirm = (submission) => {
    setSelectedSubmission(submission);
    setApproveConfirmOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    const toastId = toast.loading("Approving submission...");

    const staffPayload = {
      full_name: selectedSubmission.full_name,
      role: selectedSubmission.role,
      subjects: selectedSubmission.subjects,
      grades: selectedSubmission.grades,
      email: selectedSubmission.email,
      subject: selectedSubmission.subjects,
      photo_url: selectedSubmission.photo_url,
      favourite_quote: selectedSubmission.favourite_quote,
    };

    const { error: upsertError } = await supabase
      .from("staff")
      .upsert([staffPayload], { onConflict: "email" });

    if (upsertError) {
      console.error("Error publishing staff profile:", upsertError);
      toast.error("Could not publish this staff profile.", { id: toastId });
      return;
    }

    const { error: updateError } = await supabase
      .from("staff_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedSubmission.id);

    if (updateError) {
      console.error("Error updating submission:", updateError);
      toast.error(
        "Staff profile was published, but submission status was not updated.",
        { id: toastId },
      );
      return;
    }

    await loadSubmissions();
    onDataChanged?.();
    setApproveConfirmOpen(false);
    setSelectedSubmission(null);
    toast.success("Submission approved.", { id: toastId });
  };

  const openRejectConfirm = (submission) => {
    setSelectedSubmission(submission);
    setRejectConfirmOpen(true);
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    const toastId = toast.loading("Rejecting submission...");

    const { error } = await supabase
      .from("staff_submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedSubmission.id);

    if (error) {
      console.error("Error rejecting submission:", error);
      toast.error("Could not reject this submission.", { id: toastId });
      return;
    }

    await loadSubmissions();
    onDataChanged?.();
    setRejectConfirmOpen(false);
    setSelectedSubmission(null);
    toast.success("Submission rejected.", { id: toastId });
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-800";
  };

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !query ||
        submission.full_name?.toLowerCase().includes(query) ||
        submission.email?.toLowerCase().includes(query) ||
        submission.role?.toLowerCase().includes(query);

      const normalizedStatus = submission.status || "pending";
      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-600 p-3 rounded-xl">
              <Clock3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-950">
                Staff Profile Submissions
              </h3>
              <p className="text-sm text-gray-600">
                Review and approve submitted staff profiles
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or role"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-amber-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {!loading && (
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredSubmissions.length} of {submissions.length}{" "}
              submissions
            </p>
          )}

          {loading && (
            <p className="text-gray-600">Loading staff submissions...</p>
          )}

          {!loading && filteredSubmissions.length === 0 && (
            <p className="text-gray-600">No staff submissions found.</p>
          )}

          {!loading && filteredSubmissions.length > 0 && (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-amber-200 rounded-xl p-5 flex flex-col gap-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center">
                        {submission.photo_url ? (
                          <img
                            src={submission.photo_url}
                            alt={submission.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle2 className="w-10 h-10 text-amber-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-amber-950">
                          {submission.full_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {submission.email || "No email"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {submission.role || "No role"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Subjects: {submission.subjects || "Not provided"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Grades: {submission.grades || "Not provided"}
                        </p>

                        {submission.favourite_quote && (
                          <p className="text-sm text-gray-700 mt-2 italic">
                            “{submission.favourite_quote}”
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          submission.status,
                        )}`}
                      >
                        {submission.status || "pending"}
                      </span>
                    </div>
                  </div>

                  {submission.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openApproveConfirm(submission)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>

                      <button
                        onClick={() => openRejectConfirm(submission)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={approveConfirmOpen}
        onClose={() => {
          setApproveConfirmOpen(false);
          setSelectedSubmission(null);
        }}
        onConfirm={handleApprove}
        title="Approve Submission"
        message="Are you sure you want to approve this staff submission and publish it to the public staff page?"
        confirmText="Approve"
        variant="primary"
      />

      <ConfirmModal
        isOpen={rejectConfirmOpen}
        onClose={() => {
          setRejectConfirmOpen(false);
          setSelectedSubmission(null);
        }}
        onConfirm={handleReject}
        title="Reject Submission"
        message="Are you sure you want to reject this staff submission?"
        confirmText="Reject"
      />
    </>
  );
};

export default StaffSubmissions;
