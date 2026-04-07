import React, { useState } from "react";
import PageLayout from "../components/PageLayout";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Sending message...");

    const { error } = await supabase.from("contacts").insert([
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error.message);
      toast.error("Message could not be sent. Please try again.", {
        id: toastId,
      });
      setIsSending(false);
      return;
    }

    // ✅ Success
    toast.success("Message sent successfully! We’ll get back to you soon.", {
      id: toastId,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setIsSending(false);
  };

  return (
    <PageLayout title="Contact Us" subtitle="Get in touch with our school">
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            Contact Information
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Phone Numbers</p>
                <p className="text-gray-700">Main Office: 011 123 4567</p>
                <p className="text-gray-700">Principal: 011 123 4568</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Email</p>
                <p className="text-gray-700">info@sekgutlong.co.za</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Address</p>
                <p className="text-gray-700">
                  Phuthaditjhaba, Witsieshoek 9870
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Hours</p>
                <p className="text-gray-700">Mon–Fri: 7:30 – 16:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (FORM) */}
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 border border-amber-200 rounded-xl"
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full p-3 border border-amber-200 rounded-xl"
            />

            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="w-full p-3 border border-amber-200 rounded-xl"
            />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              rows="5"
              className="w-full p-3 border border-amber-200 rounded-xl"
            />

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-amber-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
