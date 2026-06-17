"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, Eye, EyeOff, Phone, User, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function RegisterContent() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", repeatPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { locale } = useLocale();
  const t = useTranslations();
  const phonePrefix = "+994 ";
  const [phoneInput, setPhoneInput] = useState("");

  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    setPhoneInput(digits);
    setForm({ ...form, phone: phonePrefix + digits });
  };

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailRegex.test(form.email)) {
      setError(t("register.invalidEmail"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("register.passwordMinChars"));
      return;
    }
    if (strength < 4) {
      setError(t("register.passwordStrengthError"));
      return;
    }
    if (form.password !== form.repeatPassword) {
      setError(t("register.passwordsDontMatch"));
      return;
    }
    if (form.phone.length < 14) {
      setError(t("register.invalidPhone"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        router.push("/profile");
        router.refresh();
      } else {
        setError(data.error || t("register.registrationFailed"));
      }
    } catch {
      setError(t("register.serverError"));
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
            <h1 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold">{t("register.title")}</h1>
            <p className="text-sm text-emerald-950/60 mt-1">{t("register.subtitle")}</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("register.name")}</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("register.namePlaceholder")} className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("register.email")}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("register.emailPlaceholder")} className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors" required />
              </div>
              {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                <p className="text-xs text-red-500 mt-1">{t("register.invalidEmail")}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("register.phone")}</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <div className="flex items-center w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm">
                  <span className="text-emerald-800 font-semibold whitespace-nowrap">🇦🇿 +994 </span>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={t("register.phonePlaceholder")}
                    className="flex-1 ml-1 bg-transparent outline-none text-sm"
                    required
                  />
                </div>
              </div>
              {phoneInput.length > 0 && phoneInput.length < 9 && (
                <p className="text-xs text-red-500 mt-1">{t("register.invalidPhoneDetail")}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("register.password")}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t("register.passwordPlaceholder")} className="w-full pl-10 pr-12 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-800/40 hover:text-emerald-800">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className={`flex items-center gap-0.5 ${form.password.length >= 8 ? 'text-green-600' : 'text-emerald-400'}`}>
                      {form.password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {t("register.passwordChars")}
                    </span>
                    <span className={`flex items-center gap-0.5 ${/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-emerald-400'}`}>
                      {/[A-Z]/.test(form.password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {t("register.passwordUppercase")}
                    </span>
                    <span className={`flex items-center gap-0.5 ${/[a-z]/.test(form.password) ? 'text-green-600' : 'text-emerald-400'}`}>
                      {/[a-z]/.test(form.password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {t("register.passwordLowercase")}
                    </span>
                    <span className={`flex items-center gap-0.5 ${/[0-9]/.test(form.password) ? 'text-green-600' : 'text-emerald-400'}`}>
                      {/[0-9]/.test(form.password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {t("register.passwordNumber")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1.5">{t("register.repeatPassword")}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type={showRepeat ? "text" : "password"} value={form.repeatPassword} onChange={(e) => setForm({ ...form, repeatPassword: e.target.value })} placeholder={t("register.repeatPasswordPlaceholder")} className="w-full pl-10 pr-12 py-3 bg-emerald-50/50 border border-emerald-950/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors" required />
                <button type="button" onClick={() => setShowRepeat(!showRepeat)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-800/40 hover:text-emerald-800">
                  {showRepeat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.repeatPassword && form.password !== form.repeatPassword && (
                <p className="text-xs text-red-500 mt-1">{t("register.passwordsDontMatch")}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? t("register.creating") : t("register.submit")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-emerald-950/60">{t("register.alreadyAccount")} </span>
            <Link href="/login" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors">
              {t("register.signIn")} <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}