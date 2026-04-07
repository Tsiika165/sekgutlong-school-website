import React from "react";
import { Menu, X, GraduationCap, LogIn } from "lucide-react";

const Navbar = ({
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  navigation,
  openLoginModal,
}) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-800 to-amber-900 w-12 h-12 rounded-full flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">
                Sekgutlong Secondary School
              </h1>
              <p className="text-xs text-gray-600">Kgothala le bothateng</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentPage === item.id
                    ? "bg-amber-600 text-white"
                    : "text-gray-700 hover:bg-amber-50"
                }`}
              >
                {item.name}
              </button>
            ))}

            <button
              onClick={openLoginModal}
              className="ml-2 p-2 rounded-full hover:bg-amber-100 transition"
              title="Login"
            >
              <LogIn className="w-5 h-5 text-amber-900" />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={openLoginModal}
              className="p-2 rounded-full hover:bg-amber-100 transition"
              title="Login"
            >
              <LogIn className="w-5 h-5 text-amber-900" />
            </button>

            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  currentPage === item.id
                    ? "bg-amber-600 text-white"
                    : "text-gray-700 hover:bg-amber-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
