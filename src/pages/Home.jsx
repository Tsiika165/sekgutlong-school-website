import React from "react";
import { Award, BookOpen, Users } from "lucide-react";

const Home = ({ setCurrentPage }) => {
  return (
    <div className="bg-stone-50">
      {/* 🔝 HERO (FIXED — CLEAN & LIGHT) */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="inline-block bg-amber-100 text-amber-900 px-5 py-1 rounded-full text-sm font-semibold mb-4">
            Excellence • Discipline • Achievement
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mb-4">
            Welcome to Our School
          </h1>

          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-3">
            Education is the most powerful weapon which you can use to change
            the world
          </p>

          <p className="text-sm text-amber-700 mb-6">
            Building Future Leaders Through Quality Education
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setCurrentPage("admissions")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Apply Now
            </button>

            <button
              onClick={() => setCurrentPage("about")}
              className="bg-white border border-amber-200 text-amber-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-50 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* 👤 PRINCIPAL MESSAGE (small spacing tweak) */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="bg-amber-50 rounded-2xl p-8 h-56 flex items-center justify-center">
                <Users className="w-20 h-20 text-amber-800" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-3">
                Message from the Principal
              </h2>

              <p className="text-gray-700 mb-3 leading-relaxed">
                Welcome to our school family! For over 25 years, we have been
                committed to providing quality education that transforms lives
                and builds character.
              </p>

              <p className="text-gray-700 mb-3 leading-relaxed">
                We believe in nurturing academic excellence, strong moral
                values, leadership skills, and a passion for lifelong learning.
              </p>

              <p className="text-amber-900 font-semibold">
                Together, we build futures.
              </p>

              <p className="text-gray-600 mt-1 text-sm">- Principal Name</p>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ WHY OUR SCHOOL (lighter cards) */}
      <div className="bg-stone-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-amber-900 mb-2">
            Why Our School is Special
          </h2>

          <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
            A nurturing environment where every learner can thrive academically
            and personally.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-amber-100 hover:shadow-md transition">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Academic Excellence
              </h3>
              <p className="text-gray-600 text-sm">
                Dedicated teachers ensuring consistent improvement in results.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-amber-100 hover:shadow-md transition">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Strong Values
              </h3>
              <p className="text-gray-600 text-sm">
                Discipline, respect, and ubuntu shape responsible citizens.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-amber-100 hover:shadow-md transition">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Holistic Development
              </h3>
              <p className="text-gray-600 text-sm">
                Sports, culture, and leadership opportunities for growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 STATS (FIXED — NO DARK BLOCK) */}
      <div className="bg-white border-t border-amber-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-amber-900">25+</div>
            <div className="text-gray-600 text-sm">Years Excellence</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-amber-900">800+</div>
            <div className="text-gray-600 text-sm">Learners</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-amber-900">85%</div>
            <div className="text-gray-600 text-sm">Pass Rate</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-amber-900">45+</div>
            <div className="text-gray-600 text-sm">Staff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
