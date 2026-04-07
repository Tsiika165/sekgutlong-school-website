import React from "react";
import PageLayout from "../components/PageLayout";
import { BookOpen, Award, Users, Laptop } from "lucide-react";

const Academics = () => {
  return (
    <PageLayout
      title="Academics"
      subtitle="Excellence in education across all grades"
    >
      <p className="text-gray-700 text-lg mb-8">
        We follow the South African CAPS (Curriculum and Assessment Policy
        Statement) curriculum, providing a comprehensive education from Grade 8
        to Grade 12. Our dedicated teachers ensure that every learner receives
        personalized attention and support to excel academically.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
          <BookOpen className="w-12 h-12 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-amber-900 mb-3">Curriculum</h3>
          <p className="text-gray-700 mb-3">
            Our curriculum covers all core subjects including:
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>• Mathematics & Mathematical Literacy</li>
            <li>• Physical Sciences & Life Sciences</li>
            <li>• English Home & First Additional Language</li>
            <li>• Accounting & Business Studies</li>
            <li>• Geography & History</li>
            <li>• Life Orientation</li>
          </ul>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
          <Award className="w-12 h-12 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-amber-900 mb-3">
            Academic Support
          </h3>
          <p className="text-gray-700 mb-3">
            We provide comprehensive support to ensure every learner succeeds:
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>• Extra classes after school</li>
            <li>• Weekend study sessions</li>
            <li>• Individual tutoring programs</li>
            <li>• Holiday crash courses</li>
            <li>• Exam preparation workshops</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-900 to-amber-800 text-white rounded-2xl p-8 mb-12">
        <h3 className="text-2xl font-bold mb-4">Our Academic Achievements</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-300 mb-2">85%</div>
            <div className="text-amber-100">Overall Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-300 mb-2">45%</div>
            <div className="text-amber-100">Bachelor Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-300 mb-2">12</div>
            <div className="text-amber-100">Distinctions in 2025</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-amber-50 rounded-xl p-6">
          <Users className="w-12 h-12 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-amber-900 mb-3">
            Small Class Sizes
          </h3>
          <p className="text-gray-700">
            With an average class size of 35 learners, our teachers can provide
            personalized attention and support to each student, ensuring no one
            is left behind.
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-6">
          <Laptop className="w-12 h-12 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-amber-900 mb-3">
            Modern Facilities
          </h3>
          <p className="text-gray-700">
            Our school is equipped with science laboratories, a computer center,
            a well-stocked library, and modern classrooms to enhance the
            learning experience.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Academics;
