"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Heart, LogOut, MapPin, Sparkles, ArrowRight, Sprout, Globe, BarChart3, Pencil, Check, X } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function ProfileContent({ user: initialUser, initialSavedListings }) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [savedListings] = useState(initialSavedListings?.filter(s => s.listing) || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || "");
  const [editPhone, setEditPhone] = useState((user.phone || "").replace(/^\+994\s*/, ""));
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const { locale } = useLocale();
  const t = useTranslations();

  const levelNames = ["Seed Supporter", "Green Supporter", "Climate Friend", "Climate Champion", "Earth Guardian"];
  const levelThresholds = [0, 50, 150, 350, 600];
  const currentLevel = levelThresholds.filter(t => (user.impactPoints || 0) >= t).length - 1;
  const nextThreshold = levelThresholds[currentLevel + 1] || levelThresholds[levelThresholds.length - 1];
  const progress = Math.min(100, ((user.impactPoints || 0) / nextThreshold) * 100);

  const handleLogout = async () => {
    await fetch("/api/auth/user-logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { setEditError(t("profile.nameCannotBeEmpty")); return; }
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch("/api/auth/user-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), phone: "+994 " + editPhone.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, name: editName.trim(), phone: "+994 " + editPhone.trim() });
        setIsEditing(false);
        router.refresh();
      } else {
        setEditError(data.error || t("profile.failedToUpdate"));
      }
    } catch {
      setEditError(t("profile.networkError"));
    }
    setSaving(false);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold">{user.name}</h1>
              <p className="text-sm text-emerald-950/60">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsEditing(!isEditing); if (!isEditing) { setEditName(user.name); setEditPhone(user.phone || ""); setActiveTab("overview"); } setEditError(""); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Pencil className="w-4 h-4" /> {isEditing ? t("profile.cancel") : t("profile.edit")}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t("profile.logout")}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Impact Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="w-5 h-5 text-green-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-300">{t("profile.impactLevel")}</span>
              </div>
              <p className="text-lg font-bold font-serif">{levelNames[Math.max(0, currentLevel)]}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-emerald-300 mb-1">
                  <span>{user.impactPoints || 0} {t("profile.points")}</span>
                  <span>{nextThreshold} {t("profile.points")}</span>
                </div>
                <div className="h-2 rounded-full bg-emerald-800 overflow-hidden">
                  <div className="h-full rounded-full bg-green-400 transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
              </div>
            </div>

            {/* Tabs */}
            {[
              { id: "overview", label: t("profile.overview"), icon: <User className="w-4 h-4" /> },
              { id: "saved", label: t("profile.savedProducts"), icon: <Heart className="w-4 h-4" /> },
              { id: "stats", label: t("profile.statistics"), icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "bg-white text-emerald-950/70 border border-emerald-950/5 hover:bg-emerald-900/5"
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-emerald-950/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("profile.accountDetails")}</h2>

                {editError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{editError}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-emerald-950/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-950/40 mb-1">
                      <User className="w-4 h-4" /> {t("profile.fullName")}
                    </div>
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full text-sm font-semibold text-emerald-950 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-emerald-950">{user.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-emerald-950/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-950/40 mb-1">
                      <Mail className="w-4 h-4" /> {t("profile.email")}
                    </div>
                    <p className="text-sm font-semibold text-emerald-950">{user.email}</p>
                  </div>

                  {/* Phone */}
                  <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-emerald-950/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-950/40 mb-1">
                      <Phone className="w-4 h-4" /> {t("profile.phone")}
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-emerald-950/50">+994</span>
                        <input
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                          placeholder={t("profile.phonePlaceholder")}
                          maxLength={9}
                          className="w-full text-sm font-semibold text-emerald-950 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-emerald-950">{user.phone || t("profile.notSet")}</p>
                    )}
                  </div>

                  {/* Impact Points */}
                  <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-emerald-950/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-950/40 mb-1">
                      <Sparkles className="w-4 h-4" /> {t("profile.impactPoints")}
                    </div>
                    <p className="text-sm font-semibold text-emerald-950">{user.impactPoints || 0} {t("profile.points")}</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> {saving ? t("profile.saving") : t("profile.saveChanges")}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditError(""); }}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      <X className="w-4 h-4" /> {t("profile.cancel")}
                    </button>
                  </div>
                )}

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-bold uppercase text-emerald-700">{t("profile.climateContribution")}</span>
                  </div>
                  <p className="text-sm text-emerald-800/80 leading-relaxed">
                    {t("profile.climateContributionDesc")}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "saved" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-emerald-950/5 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("profile.savedProducts")}</h2>
                  <Link href="/market" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1">
                    {t("profile.browseMarket")} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {savedListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-emerald-950/50 text-sm">{t("profile.noSavedProducts")}</p>
                    <Link href="/market" className="mt-3 inline-block px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold">
                      {t("profile.exploreMarket")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedListings.map((item) => (
                      <Link
                        key={item.id}
                        href={`/market/${item.listing.id}?from=profile`}
                        className="p-4 rounded-2xl border border-emerald-950/5 bg-[#fcfbfa] flex gap-3 items-center hover:shadow-sm transition-shadow group"
                      >
                        <div className="w-16 h-16 rounded-xl bg-emerald-100 overflow-hidden shrink-0">
                          <img src={item.listing.photoMain} alt={item.listing.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-emerald-950 text-sm group-hover:text-emerald-700 transition-colors">{item.listing.name}</h4>
                          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {item.listing.location}
                          </p>
                          <p className="text-[10px] text-emerald-950/40 mt-0.5">{item.listing.impactPoints} {t("profile.pointsPerKg")}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-emerald-950/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("profile.yourContributionStats")}</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <Sprout className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-numeric text-emerald-950">{user.impactPoints || 0}</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">{t("profile.impactPoints")}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-green-50 border border-green-200 text-center">
                    <Globe className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-numeric text-emerald-950">{savedListings.length}</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">{t("profile.productsSaved")}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                    <Sparkles className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-numeric text-emerald-950">{levelNames[Math.max(0, currentLevel)]}</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">{t("profile.climateLevel")}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-numeric text-emerald-950">{((user.impactPoints || 0) * 2).toFixed(1)} kg</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">{t("profile.estCo2Reduced")}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white text-center">
                  <Sprout className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-serif font-semibold mb-2">{t("profile.keepSupporting")}</h3>
                  <p className="text-sm text-emerald-200/80 max-w-md mx-auto">
                    {t("profile.keepSupportingDesc")}
                  </p>
                  <Link
                    href="/market"
                    className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-emerald-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    {t("profile.visitMarket")} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}