import React, { useEffect, useState } from "react";
import {
  Newspaper,
  Image,
  Users,
  UserPlus,
  Mail,
  GraduationCap,
  UserRoundPlus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "../components/StatCard";
import { supabase } from "../../lib/supabase";

const DashboardHome = ({ setCurrentPage, refreshKey = 0 }) => {
  const [stats, setStats] = useState({
    news: 0,
    gallery: 0,
    staff: 0,
    pendingAccounts: 0,
    submissions: 0,
    unreadMessages: 0,
    publishedAnnouncements: 0,
    draftAnnouncements: 0,
    admissionsStatus: "Unknown",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const [
          newsRes,
          galleryRes,
          staffRes,
          pendingAccountsRes,
          submissionsRes,
          unreadMessagesRes,
          publishedAnnouncementsRes,
          draftAnnouncementsRes,
          admissionsRes,
        ] = await Promise.all([
          supabase.from("news").select("*", { count: "exact", head: true }),
          supabase.from("gallery").select("*", { count: "exact", head: true }),
          supabase.from("staff").select("*", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "pending_staff"),
          supabase
            .from("staff_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false),
          supabase
            .from("news")
            .select("*", { count: "exact", head: true })
            .eq("published", true),
          supabase
            .from("news")
            .select("*", { count: "exact", head: true })
            .eq("published", false),
          supabase
            .from("admissions")
            .select("status")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (isMounted) {
          setStats({
            news: newsRes.count || 0,
            gallery: galleryRes.count || 0,
            staff: staffRes.count || 0,
            pendingAccounts: pendingAccountsRes.count || 0,
            submissions: submissionsRes.count || 0,
            unreadMessages: unreadMessagesRes.count || 0,
            publishedAnnouncements: publishedAnnouncementsRes.count || 0,
            draftAnnouncements: draftAnnouncementsRes.count || 0,
            admissionsStatus: admissionsRes.data?.status || "Unknown",
          });
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadStats();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const getAdmissionsDisplay = () => {
    if (loading) return "...";
    if (stats.admissionsStatus === "Open") return "Open";
    if (stats.admissionsStatus === "Closed") return "Closed";
    return stats.admissionsStatus || "Unknown";
  };

  const getAdmissionsColor = () => {
    if (stats.admissionsStatus === "Open") return "bg-green-500";
    if (stats.admissionsStatus === "Closed") return "bg-red-500";
    return "bg-gray-500";
  };

  const overviewChartData = [
    { name: "Announcements", value: stats.news },
    { name: "Gallery", value: stats.gallery },
    { name: "Staff", value: stats.staff },
    { name: "Messages", value: stats.unreadMessages },
  ];

  const workflowChartData = [
    { name: "Pending Accounts", value: stats.pendingAccounts },
    { name: "Pending Submissions", value: stats.submissions },
    { name: "Unread Messages", value: stats.unreadMessages },
  ];

  const announcementChartData = [
    { name: "Published", value: stats.publishedAnnouncements },
    { name: "Drafts", value: stats.draftAnnouncements },
  ];

  const workflowColors = ["#d97706", "#ea580c", "#92400e"];
  const announcementColors = ["#16a34a", "#ca8a04"];

  return (
    <div className="space-y-8">
      {loading && (
        <p className="text-gray-600 text-sm">Loading dashboard statistics...</p>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Announcements"
          value={loading ? "..." : stats.news}
          subtitle="Published and draft announcements"
          icon={Newspaper}
          color="bg-amber-600"
          clickable
          onClick={() => setCurrentPage("news")}
        />

        <StatCard
          title="Gallery Items"
          value={loading ? "..." : stats.gallery}
          subtitle="Images and videos uploaded"
          icon={Image}
          color="bg-orange-600"
          clickable
          onClick={() => setCurrentPage("gallery")}
        />

        <StatCard
          title="Approved Staff"
          value={loading ? "..." : stats.staff}
          subtitle="Currently visible on website"
          icon={Users}
          color="bg-yellow-600"
          clickable
          onClick={() => setCurrentPage("staff")}
        />

        <StatCard
          title="Pending Staff Accounts"
          value={loading ? "..." : stats.pendingAccounts}
          subtitle="Waiting for account approval"
          icon={UserRoundPlus}
          color="bg-purple-600"
          clickable
          onClick={() => setCurrentPage("pending-staff-accounts")}
        />

        <StatCard
          title="Pending Staff Submissions"
          value={loading ? "..." : stats.submissions}
          subtitle="Waiting for profile review"
          icon={UserPlus}
          color="bg-red-500"
          clickable
          onClick={() => setCurrentPage("staff-submissions")}
        />

        <StatCard
          title="Unread Messages"
          value={loading ? "..." : stats.unreadMessages}
          subtitle="Need admin attention"
          icon={Mail}
          color="bg-amber-700"
          clickable
          onClick={() => setCurrentPage("contacts")}
        />

        <StatCard
          title="Admissions Status"
          value={getAdmissionsDisplay()}
          subtitle="Current admissions cycle"
          icon={GraduationCap}
          color={getAdmissionsColor()}
          clickable
          onClick={() => setCurrentPage("admissions")}
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950 mb-2">
            System Overview
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Core public-facing content and attention areas
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950 mb-2">
            Admin Workflow Status
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Tasks currently waiting for admin action
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workflowChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {workflowChartData.map((entry, index) => (
                    <Cell
                      key={`workflow-cell-${index}`}
                      fill={workflowColors[index % workflowColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-amber-950 mb-2">
          Announcement Publishing Status
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Published announcements compared with drafts
        </p>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={announcementChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {announcementChartData.map((entry, index) => (
                  <Cell
                    key={`announcement-cell-${index}`}
                    fill={announcementColors[index % announcementColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
