"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackFormProps {
  accessKey?: string;
}

export default function FeedbackForm({
  accessKey = "b53f2636-00a8-4f65-8626-8e6d1eef3552",
}: FeedbackFormProps) {
  const [recipient, setRecipient] = useState<"USG" | "COA" | "COMELEC">("USG");
  const [feedbackType, setFeedbackType] = useState<"Suggestion" | "Feedback" | "Comment" | "Inquiry">("Suggestion");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmittedRecipient, setLastSubmittedRecipient] = useState<"USG" | "COA" | "COMELEC">("USG");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("access_key", accessKey);
      formData.append("subject", `[${recipient} - ${feedbackType}] ${subject}`);
      formData.append("name", isAnonymous ? "Anonymous Student" : name);
      formData.append("email", isAnonymous ? "anonymous@student.portal" : email);
      formData.append("from_name", isAnonymous ? "Anonymous Student" : name);
      formData.append("recipient_body", recipient);
      formData.append("feedback_type", feedbackType);
      formData.append("message", message);
      formData.append("is_anonymous", isAnonymous ? "Yes" : "No");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setLastSubmittedRecipient(recipient);
        setShowSuccessModal(true);
        setStatus("idle");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setErrorMessage(data.message || "Failed to send submission. Please check your access key or try again.");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error occurred. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 w-full"
        id="feedback-section"
      >
        {/* Section Header (Outside the Card) */}
        <div className="max-w-3xl mb-6 px-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold text-[#173490] mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Student Feedback Form
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Suggestions, Feedback & Comments
          </h2>
          <p className="mt-2 text-slate-600 text-base">
            Directly send your insights, proposals, or concerns to institutional bodies. Your voice matters in shaping student governance.
          </p>
        </div>

        {/* Main Form Card Container */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-md p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Body Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Select Recipient Body <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "USG", label: "USG", sub: "University Student Government" },
                  { id: "COA", label: "COA", sub: "Commission on Audit" },
                  { id: "COMELEC", label: "COMELEC", sub: "Commission on Elections" },
                ].map((item) => {
                  const isSelected = recipient === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRecipient(item.id as any)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${isSelected
                        ? "border-[#173490] bg-[#173490]/5 text-[#173490] ring-2 ring-[#173490]"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50"
                        }`}
                    >
                      <span className="text-lg font-black">{item.label}</span>
                      <span className="text-[11px] font-medium text-slate-500 mt-0.5">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Type Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Feedback Type <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Suggestion", "Feedback", "Comment", "Inquiry"] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setFeedbackType(type)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${feedbackType === type
                      ? "bg-[#173490] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Identity & Anonymous Toggle */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-800">Sender Identity</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#173490] focus:ring-[#173490]"
                  />
                  <span className="text-xs font-semibold text-slate-600">Submit Anonymously</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      required={!isAnonymous}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-2 focus:ring-[#173490]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@carsu.edu.ph"
                      required={!isAnonymous}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-2 focus:ring-[#173490]/20"
                    />
                  </div>
                </div>
              )}
              {isAnonymous && (
                <p className="text-xs text-slate-500 italic">
                  Your name and email will be hidden. Your response will be delivered as an anonymous submission.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Subject / Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Brief summary of your ${feedbackType.toLowerCase()} to ${recipient}...`}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-2 focus:ring-[#173490]/20"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Detailed Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Write your detailed ${feedbackType.toLowerCase()} or recommendations for ${recipient} here...`}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-2 focus:ring-[#173490]/20 resize-y"
              />
            </div>

            {/* Error Message Alert */}
            {status === "error" && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
                {errorMessage || "Submission failed. Please check your internet connection or Web3Forms access key."}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-700"></span>
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#173490] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#122870] focus:outline-none focus:ring-2 focus:ring-[#173490]/40 disabled:opacity-50 shadow-md"
              >
                {status === "submitting" ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit {feedbackType} to {recipient}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* Success Modal Dialog */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-slate-100"
            >
              {/* Close Button (X) */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Animated Checkmark Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Feedback Submitted Successfully!
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Thank you for your contribution. Your submission has been transmitted to{" "}
                <span className="font-bold text-[#173490]">{lastSubmittedRecipient}</span>.
              </p>

              <div className="mt-6 flex items-center justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#173490] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#122870] shadow-md focus:outline-none focus:ring-2 focus:ring-[#173490]/40"
                >
                  Close & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
