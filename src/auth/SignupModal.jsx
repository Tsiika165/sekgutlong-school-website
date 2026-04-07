import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { X, UserPlus, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const SignupModal = ({ onClose, onOpenLogin }) => {
  const [accessCode, setAccessCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const correctCode = import.meta.env.VITE_STAFF_ACCESS_CODE;

  const handleVerifyCode = (e) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error("Please enter the staff access code.");
      return;
    }

    if (accessCode !== correctCode) {
      toast.error("Invalid staff access code.");
      return;
    }

    toast.success("Access code verified.");
    setCodeVerified(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating account...");

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signupError) {
      toast.error(signupError.message, { id: toastId });
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      toast.error("Signup failed.", { id: toastId });
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: "pending_staff",
      },
    ]);

    if (profileError) {
      toast.error(profileError.message, { id: toastId });
      setLoading(false);
      return;
    }

    toast.success("Account created. Waiting for admin approval.", {
      id: toastId,
    });

    setLoading(false);
    onClose();
    onOpenLogin();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-amber-950">Staff Sign Up</h2>
          <p className="text-sm text-gray-600 mt-1">Staff access only</p>
        </div>

        {!codeVerified ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Staff Access Code
              </label>
              <input
                type="password"
                placeholder="Enter staff access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-600 mt-5 text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onOpenLogin}
            className="text-amber-700 font-semibold hover:text-amber-900"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupModal;
