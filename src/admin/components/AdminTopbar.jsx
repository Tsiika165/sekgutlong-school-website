import React, { useState } from "react";
import { Bell, UserCircle2, LogOut } from "lucide-react";

const AdminTopbar = ({
  title,
  profile,
  handleLogout,
  notifications = [],
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const totalPending = notifications.reduce(
    (sum, item) => sum + (item.count || 0),
    0,
  );

  const hasNotifications = totalPending > 0;

  const handleNotificationClick = (pageId) => {
    setShowNotifications(false);
    onNavigate?.(pageId);
  };

  return (
    <div className="bg-white border-b border-amber-200 px-6 py-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* LEFT: TITLE */}
        <div>
          <h1 className="text-4xl font-bold text-amber-950">{title}</h1>
          <p className="text-gray-600 mt-1">
            Manage your school website content here
          </p>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-4 self-end lg:self-auto">
          {/* 🔔 NOTIFICATIONS */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative bg-amber-50 hover:bg-amber-100 transition w-10 h-10 rounded-full flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-amber-700" />

              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* DROPDOWN */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-amber-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-amber-100">
                  <h3 className="font-bold text-amber-950">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    {hasNotifications
                      ? `${totalPending} item(s) need attention`
                      : "No new notifications"}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNotificationClick(item.page)}
                      className="w-full text-left px-4 py-4 hover:bg-amber-50 transition border-b border-amber-50 last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-amber-950">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>

                        <span
                          className={`min-w-[2rem] h-8 px-2 rounded-full text-sm font-bold flex items-center justify-center ${
                            item.count > 0
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.count}
                        </span>
                      </div>
                    </button>
                  ))}

                  {!notifications.length && (
                    <div className="px-4 py-6 text-sm text-gray-600">
                      No notifications available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 👤 USER */}
          <div className="border border-amber-200 rounded-2xl px-4 py-2 flex items-center gap-2 min-w-[180px]">
            <UserCircle2 className="w-7 h-7 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950 text-sm">
                {profile?.full_name || "Admin User"}
              </p>
              <p className="text-xs text-gray-600">
                {profile?.role || "admin"}
              </p>
            </div>
          </div>

          {/* 🚪 LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 transition w-10 h-10 rounded-full flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
