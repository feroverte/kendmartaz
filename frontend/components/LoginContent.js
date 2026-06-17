"use client";

import React, { useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";
import { Leaf, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { locale } = useLocale();
  const t = useTranslations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/profile";
      } else {
        setError(data.error || t("login.login_failed"));
      }
    } catch {
      setError(t("login.server_error"));
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
            <h1 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold">{t("login.welcome_back")}</h1>
            <p className="text-sm text-emerald-950/60 mt-1">{t("login.subtitle")}</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("login.email_label")}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.email_placeholder")}
                  className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("login.password_label")}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.password_placeholder")}
                  className="w-full pl-10 pr-12 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-800/40 hover:text-emerald-800">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-emerald-950/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-300 text-emerald-800 focus:ring-emerald-500"
                />
                {t("login.remember_me")}
              </label>
              <Link href="/forgot-password" className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold transition-colors">
                {t("login.forgot_password")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? t("login.signing_in") : (
                <>
                  <LogIn className="w-4 h-4" /> {t("login.sign_in")}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-emerald-950/60">{t("login.no_account")} </span>
            <Link href="/register" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors">
              {t("login.create_account")} <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}