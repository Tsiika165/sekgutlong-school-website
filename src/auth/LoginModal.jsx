import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { X, LogIn } from "lucide-react";
import toast from "react-hot-toast";

const LoginModal = ({ onClose, onOpenSignup, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmail = (value) => {
    return value.includes("@");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Logging in...");

    let emailToUse = identifier.trim();

    if (!isEmail(emailToUse)) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", emailToUse)
        .single();

      if (error || !data?.email) {
        toast.error("No account found with that email or phone number.", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      emailToUse = data.email;
    }

    const { data: authData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

    if (loginError) {
      toast.error(loginError.message, { id: toastId });
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      toast.error("Login failed.", { id: toastId });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      toast.error("Profile not found.", { id: toastId });
      setLoading(false);
      return;
    }

    toast.success("Logged in successfully.", { id: toastId });
    onLoginSuccess(profile);
    setLoading(false);
    onClose();
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
          <h2 className="text-2xl font-bold text-amber-950">Login</h2>
          <p className="text-sm text-gray-600 mt-1">
            Staff and admin access only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Email or Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-amber-200 rounded-xl px-4 py-3 outline-none focus:border-amber-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          Need an account?{" "}
          <button
            type="button"
            onClick={onOpenSignup}
            className="text-amber-700 font-semibold hover:text-amber-900"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
