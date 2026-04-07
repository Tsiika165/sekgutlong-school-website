import React from "react";
import {
  LayoutDashboard,
  Newspaper,
  Image,
  GraduationCap,
  Mail,
  Users,
  UserPlus,
  School,
  FilePenLine,
  ShieldCheck,
} from "lucide-react";

const AdminSidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "news", label: "Manage Announcements", icon: Newspaper },
    { id: "gallery", label: "Manage Gallery", icon: Image },
    { id: "admissions", label: "Manage Admissions", icon: GraduationCap },
    { id: "contacts", label: "Contact Messages", icon: Mail },
    { id: "staff", label: "Manage Staff", icon: Users },
    { id: "staff-submissions", label: "Staff Submissions", icon: UserPlus },
    {
      id: "pending-staff-accounts",
      label: "Pending Staff Accounts",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-amber-950 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-amber-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-amber-200">School Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                isActive
                  ? "bg-amber-600 text-white shadow-lg"
                  : "text-amber-100 hover:bg-amber-900"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-amber-800">
        <p className="text-xs text-amber-300">School Admin Panel v1.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
