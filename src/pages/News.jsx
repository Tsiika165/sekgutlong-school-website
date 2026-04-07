import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { Calendar, Bell, Award, Megaphone, Pin } from "lucide-react";
import { supabase } from "../lib/supabase";

const ITEMS_PER_LOAD = 5;

const News = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error.message);
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setAnnouncements(data || []);
        setLoading(false);
      }
    };

    fetchAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleAnnouncements = useMemo(() => {
    return announcements.slice(0, visibleCount);
  }, [announcements, visibleCount]);

  const hasMore = visibleCount < announcements.length;

  const getIcon = (title = "") => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("sport")) {
      return Award;
    }

    if (lowerTitle.includes("exam") || lowerTitle.includes("test")) {
      return Calendar;
    }

    return Bell;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <PageLayout
      title="Announcements"
      subtitle="Stay updated with school announcements"
    >
      {loading && (
        <p className="text-center text-gray-600">Loading announcements...</p>
      )}

      {!loading && announcements.length === 0 && (
        <p className="text-center text-gray-600">
          No announcements available yet.
        </p>
      )}

      {!loading && announcements.length > 0 && (
        <div className="space-y-6">
          {visibleAnnouncements.map((item) => {
            const IconComponent = getIcon(item.title);

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition ${
                  item.is_pinned
                    ? "border-amber-400 bg-amber-50/40"
                    : "border-amber-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-amber-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-amber-900">
                        {item.title}
                      </h3>
                      <Megaphone className="w-5 h-5 text-amber-500" />
                      {item.is_pinned && (
                        <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Posted on {formatDate(item.created_at)}
                    </p>

                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_LOAD)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Load More Announcements
              </button>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default News;
