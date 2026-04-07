import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, Trash2, Clock3, Search } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const PendingStaffAccounts = ({ onDataChanged }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState(null);

  const loadPendingUsers = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "pending_staff")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading pending staff accounts:", error);
      toast.error("Could not load pending staff accounts.");
      setLoading(false);
      return;
    }

    setPendingUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const fetchPendingUsers = async () => {
      await loadPendingUsers(false);
    };

    fetchPendingUsers();
  }, []);

  const openApproveConfirm = (id) => {
    setSelectedApproveId(id);
    setApproveConfirmOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApproveId) return;

    const toastId = toast.loading("Approving account...");

    const { error } = await supabase
      .from("profiles")
      .update({ role: "staff" })
      .eq("id", selectedApproveId);

    if (error) {
      console.error("Error approving account:", error);
      toast.error("Could not approve this account.", { id: toastId });
      return;
    }

    await loadPendingUsers();
    onDataChanged?.();
    setApproveConfirmOpen(false);
    setSelectedApproveId(null);
    toast.success("Account approved.", { id: toastId });
  };

  const openDeleteConfirm = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    const toastId = toast.loading("Deleting account...");

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", selectedDeleteId);

    if (error) {
      console.error("Error deleting account:", error);
      toast.error("Could not delete this account.", { id: toastId });
      return;
    }

    await loadPendingUsers();
    onDataChanged?.();
    setConfirmOpen(false);
    setSelectedDeleteId(null);
    toast.success("Pending account deleted.", { id: toastId });
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return pendingUsers.filter((user) => {
      if (!query) return true;

      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    });
  }, [pendingUsers, searchTerm]);

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
                Pending Staff Accounts
              </h3>
              <p className="text-sm text-gray-600">
                Review and approve new staff signups
              </p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-amber-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-600"
            />
          </div>

          {!loading && (
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredUsers.length} of {pendingUsers.length} pending
              accounts
            </p>
          )}

          {loading && (
            <p className="text-gray-600">Loading pending staff accounts...</p>
          )}

          {!loading && filteredUsers.length === 0 && (
            <p className="text-gray-600">No pending staff accounts found.</p>
          )}

          {!loading && filteredUsers.length > 0 && (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-amber-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div>
                    <h4 className="text-lg font-bold text-amber-950">
                      {user.full_name}
                    </h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">{user.phone}</p>

                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      pending_staff
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openApproveConfirm(user.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>

                    <button
                      onClick={() => openDeleteConfirm(user.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
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
          setSelectedApproveId(null);
        }}
        onConfirm={handleApprove}
        title="Approve Staff Account"
        message="Are you sure you want to approve this account as staff?"
        confirmText="Approve"
        variant="primary"
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Pending Account"
        message="Are you sure you want to delete this pending account? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
};

export default PendingStaffAccounts;
