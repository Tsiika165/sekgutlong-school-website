import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Academics from "./pages/Academics";
import Admissions from "./pages/Admissions";
import News from "./pages/News";
import Gallery from "./pages/Gallery";
import Staff from "./pages/Staff";
import Contact from "./pages/Contact";
import AdminDashboard from "./admin/AdminDashboard";
import StaffApply from "./staff/StaffApply";
import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";
import { supabase } from "./lib/supabase";
import toast from "react-hot-toast";

const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "home";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("authProfile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const navigation = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Academics", id: "academics" },
    { name: "Admissions", id: "admissions" },
    { name: "Announcements", id: "news" },
    { name: "Gallery", id: "gallery" },
    { name: "Staff", id: "staff" },
    { name: "Contact", id: "contact" },
  ];

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("authProfile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("authProfile");
    }
  }, [profile]);

  const handleLoginSuccess = (loggedInProfile) => {
    setProfile(loggedInProfile);
    setShowLoginModal(false);

    if (loggedInProfile.role === "admin") {
      setCurrentPage("admin");
      return;
    }

    if (loggedInProfile.role === "staff") {
      setCurrentPage("staff-apply");
      return;
    }

    if (loggedInProfile.role === "pending_staff") {
      toast("Your account is waiting for admin approval.", {
        icon: "⏳",
      });
      setCurrentPage("home");
      return;
    }

    setCurrentPage("home");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
      }
    } catch (error) {
      console.error("Logout unexpected error:", error);
    } finally {
      setProfile(null);
      localStorage.removeItem("authProfile");
      localStorage.setItem("currentPage", "home");
      setCurrentPage("home");
      setShowLoginModal(false);
      setShowSignupModal(false);
      setMobileMenuOpen(false);
      window.location.reload();
    }
  };

  const renderProtectedBlocked = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-600">You do not have access to this page.</p>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home setCurrentPage={setCurrentPage} />;

      case "about":
        return <About />;

      case "academics":
        return <Academics />;

      case "admissions":
        return <Admissions />;

      case "news":
        return <News />;

      case "gallery":
        return <Gallery />;

      case "staff":
        return <Staff />;

      case "contact":
        return <Contact />;

      case "admin":
        if (profile?.role === "admin") {
          return (
            <AdminDashboard profile={profile} handleLogout={handleLogout} />
          );
        }
        return renderProtectedBlocked();

      case "staff-apply":
        if (profile?.role === "staff" || profile?.role === "admin") {
          return <StaffApply profile={profile} handleLogout={handleLogout} />;
        }
        return renderProtectedBlocked();

      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  const isAdminPage = currentPage === "admin" && profile?.role === "admin";
  const isStaffPage =
    currentPage === "staff-apply" &&
    (profile?.role === "staff" || profile?.role === "admin");

  return (
    <div className="min-h-screen bg-stone-50">
      {!isAdminPage && !isStaffPage && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navigation={navigation}
          openLoginModal={() => setShowLoginModal(true)}
        />
      )}

      {renderPage()}

      {!isAdminPage && !isStaffPage && (
        <Footer setCurrentPage={setCurrentPage} />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onOpenSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onOpenLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};

export default App;
