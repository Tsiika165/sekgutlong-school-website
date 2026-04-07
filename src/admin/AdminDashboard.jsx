import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import DashboardHome from "./pages/DashboardHome";
import ManageNews from "./pages/ManageNews";
import ManageGallery from "./pages/ManageGallery";
import ManageAdmissions from "./pages/ManageAdmissions";
import ManageContacts from "./pages/ManageContacts";
import ManageStaff from "./pages/ManageStaff";
import StaffSubmissions from "./pages/StaffSubmissions";
import PendingStaffAccounts from "./pages/PendingStaffAccounts";
import { supabase } from "../lib/supabase";

const AdminDashboard = ({ profile, handleLogout }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const [messagesRes, accountsRes, submissionsRes] = await Promise.all([
          supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "pending_staff"),
          supabase
            .from("staff_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

        if (isMounted) {
          setNotifications([
            {
              id: "messages",
              label: "Unread Messages",
              description: "Visitors are waiting for responses",
              count: messagesRes.count || 0,
              page: "contacts",
            },
            {
              id: "accounts",
              label: "Pending Staff Accounts",
              description: "New staff signups need approval",
              count: accountsRes.count || 0,
              page: "pending-staff-accounts",
            },
            {
              id: "submissions",
              label: "Pending Staff Submissions",
              description: "Staff profiles need review",
              count: submissionsRes.count || 0,
              page: "staff-submissions",
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading notifications:", error.message);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardHome
            setCurrentPage={setCurrentPage}
            refreshKey={refreshKey}
          />
        );

      case "news":
        return <ManageNews onDataChanged={triggerRefresh} />;

      case "gallery":
        return <ManageGallery onDataChanged={triggerRefresh} />;

      case "admissions":
        return <ManageAdmissions onDataChanged={triggerRefresh} />;

      case "contacts":
        return <ManageContacts onDataChanged={triggerRefresh} />;

      case "staff":
        return <ManageStaff onDataChanged={triggerRefresh} />;

      case "staff-submissions":
        return <StaffSubmissions onDataChanged={triggerRefresh} />;

      case "pending-staff-accounts":
        return <PendingStaffAccounts onDataChanged={triggerRefresh} />;

      default:
        return (
          <DashboardHome
            setCurrentPage={setCurrentPage}
            refreshKey={refreshKey}
          />
        );
    }
  };

  const getTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard Overview";
      case "news":
        return "Manage Announcements";
      case "gallery":
        return "Manage Gallery";
      case "admissions":
        return "Manage Admissions";
      case "contacts":
        return "Contact Messages";
      case "staff":
        return "Manage Staff";
      case "staff-submissions":
        return "Staff Submissions";
      case "pending-staff-accounts":
        return "Pending Staff Accounts";

      default:
        return "Dashboard Overview";
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      title={getTitle()}
      profile={profile}
      handleLogout={handleLogout}
      notifications={notifications}
    >
      {renderPage()}
    </AdminLayout>
  );
};

export default AdminDashboard;
