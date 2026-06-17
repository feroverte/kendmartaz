"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function ResetPasswordPage() {
  const { locale } = useLocale();
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token;
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError(t("resetPassword.minChars")); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || t("resetPassword.failed"));
      }
    } catch {
      setError(t("resetPassword.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-green-200/20 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-200/15 blur-3xl -z-10" />

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
            <h1 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold">{t("resetPassword.title")}</h1>
            <p className="text-sm text-emerald-950/60 mt-1">{t("resetPassword.subtitle")}</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">{error}</div>
          )}

          {done ? (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-sm text-emerald-950/70 leading-relaxed">{t("resetPassword.success")}</p>
              <Link href="/login" className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
                {t("resetPassword.signIn")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("resetPassword.newPasswordLabel")}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("resetPassword.passwordPlaceholder")}
                    className="w-full pl-10 pr-12 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-800/40 hover:text-emerald-800">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-2xl font-semibold text-sm transition-colors mt-2">
                {loading ? t("resetPassword.resetting") : t("resetPassword.resetBtn")}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
