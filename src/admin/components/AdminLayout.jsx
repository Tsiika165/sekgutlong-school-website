import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = ({
  currentPage,
  setCurrentPage,
  title,
  profile,
  handleLogout,
  children,
  notifications = [],
}) => {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AdminSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex flex-col">
        <AdminTopbar
          title={title}
          profile={profile}
          handleLogout={handleLogout}
          notifications={notifications}
          onNavigate={setCurrentPage}
        />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
