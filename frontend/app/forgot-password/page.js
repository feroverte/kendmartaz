"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        if (data.resetLink) setResetLink(data.resetLink);
      } else {
      setError(data.error || t("forgotPassword.somethingWrong"));
    }
  } catch {
    setError(t("forgotPassword.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-green-200/20 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-200/15 blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-emerald-900/5 rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-emerald-700" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold">{t("forgotPassword.title")}</h1>
            <p className="text-sm text-emerald-950/60 mt-1">{t("forgotPassword.subtitle")}</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">{error}</div>
          )}

          {sent ? (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-sm text-emerald-950/70 leading-relaxed">
                {t("forgotPassword.sentMessage")}
              </p>
              {resetLink && (
                <div className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-900/5 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">{t("forgotPassword.devResetLink")}</p>
                  <a href={resetLink} className="text-xs text-emerald-700 underline break-all">{resetLink}</a>
                </div>
              )}
              <Link href="/login" className="mt-2 text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors flex items-center gap-1">
                {t("forgotPassword.backToSignIn")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("forgotPassword.emailLabel")}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-2xl font-semibold text-sm transition-colors mt-2">
                {loading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors">
              {t("forgotPassword.backToSignIn")} <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
