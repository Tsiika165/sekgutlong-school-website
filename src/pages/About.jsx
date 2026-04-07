import React from "react";
import PageLayout from "../components/PageLayout";

const About = () => {
  return (
    <PageLayout
      title="About Our School"
      subtitle="Our story, our values, our achievements"
    >
      <p className="text-gray-700 text-lg mb-6">
        Established in 1998, our school has been transforming lives for over 25
        years. We are proud to be a pillar of educational excellence in our
        community, nurturing young minds and building the leaders of tomorrow.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-amber-50 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-amber-900 mb-4">
            Our Mission
          </h3>
          <p className="text-gray-700">
            To provide quality, accessible education that empowers learners to
            reach their full potential academically, socially, and morally,
            while fostering a love for lifelong learning.
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Vision</h3>
          <p className="text-gray-700">
            To be a leading institution recognized for producing well-rounded,
            responsible citizens who contribute positively to society and excel
            in their chosen paths.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-amber-900 mb-6">
          Our Core Values
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Excellence</h4>
              <p className="text-gray-700">
                We strive for the highest standards in everything we do.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Integrity</h4>
              <p className="text-gray-700">
                We uphold honesty, transparency, and ethical conduct.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Ubuntu</h4>
              <p className="text-gray-700">
                We believe in humanity, community, and caring for one another.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Respect</h4>
              <p className="text-gray-700">
                We treat everyone with dignity and value diversity.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              5
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Discipline</h4>
              <p className="text-gray-700">
                We maintain high standards of behavior and self-control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
