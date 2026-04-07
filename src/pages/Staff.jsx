import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { Quote, Mail, UserCircle2, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading staff:", error);
        return;
      }

      if (isMounted) {
        setStaffMembers(data || []);
      }
    };

    fetchStaff();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageLayout
      title="Our Staff"
      subtitle="Meet the passionate educators shaping the future"
    >
      {staffMembers.length === 0 ? (
        <div className="text-center py-12">
          <UserCircle2 className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            No staff profiles available yet.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {staffMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedMember(member)}
              className="bg-white border-2 border-amber-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition w-full"
            >
              <div className="flex justify-center mb-6">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.full_name}
                    className="w-32 h-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <UserCircle2 className="w-14 h-14 text-amber-400" />
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                {member.full_name}
              </h3>

              <p className="text-amber-700 text-xl mb-5">
                {member.role || "Staff Member"}
              </p>

              {(member.subjects || member.subject) && (
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold">Subjects:</span>{" "}
                  {member.subjects || member.subject}
                </p>
              )}

              {member.grades && (
                <p className="text-gray-700 mb-5">
                  <span className="font-semibold">Grades:</span> {member.grades}
                </p>
              )}

              {member.favourite_quote && (
                <div className="flex items-start justify-center gap-2 text-gray-600 italic mb-5">
                  <Quote className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <p className="line-clamp-3">{member.favourite_quote}</p>
                </div>
              )}

              {member.email && (
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Mail className="w-5 h-5" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-auto flex justify-center">
                  {selectedMember.photo_url ? (
                    <img
                      src={selectedMember.photo_url}
                      alt={selectedMember.full_name}
                      className="w-48 h-48 object-cover rounded-2xl border border-amber-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <UserCircle2 className="w-20 h-20 text-amber-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <h3 className="text-3xl font-bold text-amber-900 mb-2">
                    {selectedMember.full_name}
                  </h3>

                  <p className="text-xl text-amber-700 mb-6">
                    {selectedMember.role || "Staff Member"}
                  </p>

                  <div className="space-y-3 text-gray-700">
                    {(selectedMember.subjects || selectedMember.subject) && (
                      <p>
                        <span className="font-semibold">Subjects:</span>{" "}
                        {selectedMember.subjects || selectedMember.subject}
                      </p>
                    )}

                    {selectedMember.grades && (
                      <p>
                        <span className="font-semibold">Grades:</span>{" "}
                        {selectedMember.grades}
                      </p>
                    )}

                    {selectedMember.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-600" />
                        <span>{selectedMember.email}</span>
                      </p>
                    )}
                  </div>

                  {selectedMember.favourite_quote && (
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <div className="flex items-start gap-3 text-gray-700 italic">
                        <Quote className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                        <p>{selectedMember.favourite_quote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Staff;
