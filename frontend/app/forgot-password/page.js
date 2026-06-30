"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const STEPS = ["email", "otp", "done"];

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const t = useTranslations();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(t("forgotPassword.otpSentMessage").replace("{email}", email));
        setStep(1);
      } else {
        setError(data.error || t("forgotPassword.somethingWrong"));
      }
    } catch {
      setError(t("forgotPassword.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError(t("resetPassword.minChars")); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || t("resetPassword.failed"));
      }
    } catch {
      setError(t("resetPassword.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const stepTitle = () => {
    if (step === 0) return t("forgotPassword.title");
    if (step === 1) return t("forgotPassword.otpStepTitle");
    return t("resetPassword.title");
  };

  const stepSubtitle = () => {
    if (step === 0) return t("forgotPassword.subtitle");
    if (step === 1) return t("forgotPassword.otpStepSubtitle");
    return t("resetPassword.subtitle");
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
          {/* Step indicator */}
          {step < 2 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.slice(0, 2).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= step ? "bg-emerald-900 text-white" : "bg-emerald-100 text-emerald-400"}`}>
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  {i === 0 && <div className={`w-10 h-0.5 transition-colors ${step >= 1 ? "bg-emerald-900" : "bg-emerald-100"}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-emerald-700" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold">{stepTitle()}</h1>
            <p className="text-sm text-emerald-950/60 mt-1">{stepSubtitle()}</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">{error}</div>
          )}

          {/* Step 0: Email */}
          {step === 0 && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-2xl font-semibold text-sm transition-colors mt-2 flex items-center justify-center gap-2">
                {loading ? t("forgotPassword.sending") : t("forgotPassword.sendCode")}
              </button>
            </form>
          )}

          {/* Step 1: OTP + New Password */}
          {step === 1 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              {message && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">{message}</div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("forgotPassword.otpLabel")}</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder={t("forgotPassword.otpPlaceholder")}
                    className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm text-center tracking-[8px] font-bold focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                </div>
              </div>
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
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-2xl font-semibold text-sm transition-colors mt-2 flex items-center justify-center gap-2">
                {loading ? t("resetPassword.resetting") : t("resetPassword.resetBtn")}
              </button>
            </form>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-sm text-emerald-950/70 leading-relaxed">{t("resetPassword.success")}</p>
              <Link href="/login" className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
                {t("resetPassword.signIn")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center flex items-center justify-center gap-4">
            {step === 1 && (
              <button onClick={() => { setStep(0); setError(""); setMessage(""); }} className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> {t("forgotPassword.backToEmail")}
              </button>
            )}
            {step === 0 && (
              <Link href="/login" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors flex items-center gap-1">
                {t("forgotPassword.backToSignIn")} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
