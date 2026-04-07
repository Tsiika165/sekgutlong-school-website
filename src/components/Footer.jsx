import React from "react";

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="bg-gradient-to-br from-amber-900 to-amber-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              Sekgutlong Secondary School
            </h3>
            <p className="text-amber-100">Kgothala le bothateng</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage("admissions")}
                className="block text-amber-100 hover:text-white"
              >
                Apply Now
              </button>
              <button
                onClick={() => setCurrentPage("contact")}
                className="block text-amber-100 hover:text-white"
              >
                Contact Us
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-amber-100">011 123 4567</p>
            <p className="text-amber-100">info@sekgutlong.co.za</p>
          </div>
        </div>
        <div className="border-t border-amber-700 mt-8 pt-8 text-center text-amber-100">
          <p>&copy; 2026 Sekgutlong Secondary School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
