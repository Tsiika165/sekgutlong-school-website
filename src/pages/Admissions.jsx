import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { FileText, Calendar, Info } from "lucide-react";
import { supabase } from "../lib/supabase";

const Admissions = () => {
  const [admissionInfo, setAdmissionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAdmissions = async () => {
      try {
        const { data, error } = await supabase
          .from("admissions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching admissions:", error);
          return;
        }

        if (isMounted) {
          setAdmissionInfo(data || null);
        }
      } catch (error) {
        console.error("Unexpected admissions error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAdmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return dateString;
  };

  const getExtensionDisplay = () => {
    if (!admissionInfo) return "Not set";
    if (admissionInfo.extension_deadline) {
      return formatDate(admissionInfo.extension_deadline);
    }
    return "Not set";
  };

  const getStatusClasses = (status) => {
    if (status === "Open") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Closed") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <PageLayout title="Admissions" subtitle="Join our school family today">
      {loading && (
        <p className="text-center text-gray-600">Loading admissions...</p>
      )}

      {!loading && !admissionInfo && (
        <p className="text-center text-gray-600">
          No admissions information available yet.
        </p>
      )}

      {!loading && admissionInfo && (
        <div className="space-y-8">
          <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-amber-900 mb-3">
              {admissionInfo.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {admissionInfo.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-amber-600" />
                <h4 className="text-xl font-bold text-amber-900">
                  Requirements
                </h4>
              </div>
              <p className="text-gray-700 whitespace-pre-line">
                {admissionInfo.requirements}
              </p>
            </div>

            <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-amber-600" />
                <h4 className="text-xl font-bold text-amber-900">
                  Important Dates
                </h4>
              </div>

              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-semibold">Applications Open:</span>{" "}
                  {formatDate(admissionInfo.application_open_date)}
                </p>
                <p>
                  <span className="font-semibold">Applications Close:</span>{" "}
                  {formatDate(admissionInfo.application_deadline)}
                </p>
                <p>
                  <span className="font-semibold">Extension:</span>{" "}
                  {getExtensionDisplay()}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                      admissionInfo.status,
                    )}`}
                  >
                    {admissionInfo.status || "Not set"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-900 to-amber-800 text-white rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Info className="w-8 h-8 text-amber-300 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Admission Notes</h3>
                <p className="text-amber-100">
                  {admissionInfo.notes || "No extra notes available right now."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Admissions;
