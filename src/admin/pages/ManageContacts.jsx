import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Mail, Trash2, CheckCircle2, Reply, Search } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const ManageContacts = ({ onDataChanged }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const loadMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading messages:", error);
      toast.error("Could not load messages.");
      setLoading(false);
      return;
    }

    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading messages:", error);
        if (isMounted) {
          toast.error("Could not load messages.");
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setMessages(data || []);
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from("contacts")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking as read:", error);
      toast.error("Could not update message.");
      return;
    }

    toast.success("Message marked as read.");
    onDataChanged?.();
    loadMessages();
  };

  const markAsReplied = async (id) => {
    const { error } = await supabase
      .from("contacts")
      .update({ is_replied: true, is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking as replied:", error);
      toast.error("Could not update reply status.");
      return;
    }

    toast.success("Message marked as replied.");
    onDataChanged?.();
    loadMessages();
  };

  const handleReply = (msg) => {
    const subject = encodeURIComponent(
      "Re: Your enquiry to Sekgutlong Secondary School",
    );

    const body = encodeURIComponent(
      `Hello ${msg.name || ""},\n\nThank you for contacting Sekgutlong Secondary School.\n\nRegarding your message:\n"${msg.message || ""}"\n\nBest regards,\nSekgutlong Secondary School`,
    );

    const mailtoLink = `mailto:${msg.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, "_self");
  };

  const openDeleteConfirm = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const deleteMessage = async () => {
    if (!selectedDeleteId) return;

    const toastId = toast.loading("Deleting message...");

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", selectedDeleteId);

    if (error) {
      console.error("Error deleting message:", error);
      toast.error("Could not delete message.", { id: toastId });
      return;
    }

    await loadMessages();
    onDataChanged?.();
    setConfirmOpen(false);
    setSelectedDeleteId(null);
    toast.success("Message deleted.", { id: toastId });
  };

  const getCardStyle = (msg) => {
    if (msg.is_replied) {
      return "border-green-200 bg-green-50";
    }

    if (msg.is_read) {
      return "border-gray-200 bg-gray-50";
    }

    return "border-amber-300 bg-amber-50";
  };

  const getStatusText = (msg) => {
    if (msg.is_replied) return "Replied";
    if (msg.is_read) return "Read";
    return "Unread";
  };

  const getStatusStyle = (msg) => {
    if (msg.is_replied) return "bg-green-100 text-green-700";
    if (msg.is_read) return "bg-gray-200 text-gray-700";
    return "bg-yellow-100 text-yellow-800";
  };

  const filteredMessages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return messages.filter((msg) => {
      const matchesSearch =
        !query ||
        msg.name?.toLowerCase().includes(query) ||
        msg.email?.toLowerCase().includes(query) ||
        msg.message?.toLowerCase().includes(query) ||
        msg.subject?.toLowerCase().includes(query);

      let messageStatus = "unread";
      if (msg.is_replied) {
        messageStatus = "replied";
      } else if (msg.is_read) {
        messageStatus = "read";
      }

      const matchesStatus =
        statusFilter === "all" || messageStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, searchTerm, statusFilter]);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-amber-700" />
            <h3 className="text-xl font-bold text-amber-950">
              Contact Messages
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, subject, or message"
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
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {!loading && (
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredMessages.length} of {messages.length} messages
            </p>
          )}

          {loading && <p className="text-gray-600">Loading messages...</p>}

          {!loading && filteredMessages.length === 0 && (
            <p className="text-gray-600">No messages found.</p>
          )}

          <div className="space-y-4">
            {!loading &&
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-xl p-4 ${getCardStyle(msg)}`}
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-amber-950">{msg.name}</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            msg,
                          )}`}
                        >
                          {getStatusText(msg)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-1">{msg.email}</p>

                      {msg.subject && (
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">Subject:</span>{" "}
                          {msg.subject}
                        </p>
                      )}

                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!msg.is_read && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={() => handleReply(msg)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-1 transition"
                      >
                        <Reply className="w-4 h-4" />
                        Reply
                      </button>

                      {!msg.is_replied && (
                        <button
                          onClick={() => markAsReplied(msg.id)}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Replied
                        </button>
                      )}

                      <button
                        onClick={() => openDeleteConfirm(msg.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        onConfirm={deleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
};

export default ManageContacts;
