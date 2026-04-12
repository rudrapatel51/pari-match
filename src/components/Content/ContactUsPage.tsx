import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiMessageSquare,
} from "react-icons/fi";
import { contentApi } from "../../api/client";
import { useToastStore } from "../../store/toastStore";

const ContactUsPage: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contentApi.contactUs(form);
      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Page header ── */}
      <div className="bg-brand-primary-dark px-6 py-5">
        <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
          Contact Us
        </h1>
        <p className="text-sm text-brand-text-70 mt-0.5">
          Our support team is available 24/7 to help you
        </p>
      </div>

      <div className="p-4 md:p-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ── Contact Info Card ── */}
          <div className="bg-bg-card border border-stroke-light shadow-betting-card overflow-hidden">
            {/*
                          FIX: bg-bg-light-blue → bg-brand-primary-dark
                          bg-bg-light-blue is a hover tint — wrong as a card section header.
                          bg-brand-primary-dark gives a proper dark header matching the page header.
                          FIX: text-brand-text → text-brand-text
                          On bg-brand-primary-dark, text must always be text-brand-text.
                        */}
            <div className="px-5 py-3.5 border-b border-stroke-light bg-brand-primary-dark">
              <h2 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                Get In Touch
              </h2>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-sm text-brand-text">
                Have questions or need assistance? Our support team is available
                24/7 to help.
              </p>

              {[
                {
                  Icon: FiPhone,
                  label: "Phone",
                  value: "1800-XXX-XXXX",
                  color: "text-accent-green",
                },
                {
                  Icon: FiMail,
                  label: "Email",
                  value: "support@wlssports.com",
                  color: "text-accent-yellow",
                },
                {
                  Icon: FiMapPin,
                  label: "Address",
                  value: "India",
                  color: "text-accent-red",
                },
              ].map(({ Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-3">
                  {/*
                                      FIX: bg-brand-primary/10 → bg-brand-primary-dark
                                      brand-primary/10 = dark navy at 10% opacity.
                                      In dark mode: near-invisible overlay on dark bg-bg-card.
                                      bg-brand-primary-dark is an explicit dark surface token
                                      that always has visible contrast in both themes.

                                      FIX: text-brand-primary → per-icon accent color
                                      brand-primary = dark navy in dark mode = invisible on
                                      bg-brand-primary-dark. Each contact type gets its own
                                      vivid accent color that reads in both themes:
                                        Phone   → accent-green  (action/available)
                                        Email   → accent-yellow (communication)
                                        Address → accent-red    (location pin)
                                    */}
                  <div className="w-10 h-10 bg-brand-text-10 flex items-center justify-center flex-shrink-0 border border-stroke-light">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-text-70 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-sm text-brand-text mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Form / Success Card ── */}
          <div className="bg-bg-card border border-stroke-light shadow-betting-card overflow-hidden">
            {submitted ? (
              <>
                {/* Success header */}
                <div className="px-5 py-3.5 border-b border-stroke-light bg-accent-green/10">
                  <h2 className="text-xs font-semibold text-accent-green uppercase tracking-wider">
                    Message Sent
                  </h2>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-brand-text-10 flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-8 h-8 text-accent-green" />
                  </div>
                  <h3 className="text-lg font-bold text-accent-green mb-1">
                    Message Sent!
                  </h3>
                  <p className="text-sm text-brand-text-70 mb-6">
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="px-5 py-2.5 bg-accent-green text-black text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Send Another
                  </button>
                </div>
              </>
            ) : (
              <>
                {/*
                                  FIX: bg-bg-light-blue → bg-brand-primary-dark (same as info card)
                                  FIX: FiMessageSquare text-brand-primary → text-brand-text-70
                                       brand-primary is dark navy — invisible on brand-primary-dark.
                                       text-brand-text-70 reads well on bg-brand-primary-dark.
                                  FIX: text-brand-text → text-brand-text (heading on dark bg)
                                */}
                <div className="px-5 py-3.5 border-b border-stroke-light bg-brand-primary-dark flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4 text-brand-text-70" />
                  <h2 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                    Send a Message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {[
                    {
                      key: "name",
                      label: "Full Name",
                      type: "text",
                      placeholder: "Your full name",
                    },
                    {
                      key: "email",
                      label: "Email",
                      type: "email",
                      placeholder: "your@email.com",
                    },
                    {
                      key: "subject",
                      label: "Subject",
                      type: "text",
                      placeholder: "How can we help?",
                    },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
                        {label} <span className="text-accent-red">*</span>
                      </label>
                      <input
                        type={type}
                        value={(form as any)[key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={placeholder}
                        required
                        className="input-field"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
                      Message <span className="text-accent-red">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Describe your issue or question..."
                      required
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-accent-green text-black font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
