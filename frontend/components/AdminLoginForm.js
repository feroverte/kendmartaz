"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions/dbActions";
import { KeyRound, Mail } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "kendmart-admin";

export default function AdminLoginForm() {
  const { locale } = useLocale();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        router.push(`/${ADMIN_PATH}/manage`);
        router.refresh();
      } else {
        setError(result.error || t("adminLogin.incorrect"));
      }
    } catch (err) {
      console.error(err);
      setError(t("adminLogin.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs font-semibold text-red-700 text-center">
          {error}
        </div>
      )}

      <div className="relative">
        <Mail className="w-4 h-4 text-emerald-950/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("adminLogin.emailPlaceholder")}
          className="w-full pl-10 pr-4 py-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
          required
        />
      </div>

      <div className="relative">
        <KeyRound className="w-4 h-4 text-emerald-950/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("adminLogin.passwordPlaceholder")}
          className="w-full pl-10 pr-4 py-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-xl text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5"
      >
        {loading ? t("adminLogin.verifying") : t("adminLogin.accessDashboard")}
      </button>
    </form>
  );
}
