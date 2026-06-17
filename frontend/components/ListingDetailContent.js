"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, MapPin, Phone, ArrowLeft, Heart, Sparkles, Sprout, Globe, Users, CheckCircle2, X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { checkUserSession, saveListing, unsaveListing, getSavedListings } from "@/app/actions/dbActions";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function ListingDetailContent({ listing }) {
  const router = useRouter();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [backHref, setBackHref] = useState("/market");
  const { locale } = useLocale();
  const t = useTranslations();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("from") === "profile") setBackHref("/profile?tab=saved");
    }
  }, []);

  const photos = (() => {
    try { const p = JSON.parse(listing.photos || "[]"); return [listing.photoMain, ...p]; }
    catch { return [listing.photoMain]; }
  })();

  useEffect(() => {
    checkUserSession().then(setUser);
    (async () => {
      const u = await checkUserSession();
      setUser(u);
      if (u) {
        const saved = await getSavedListings();
        const match = saved.find(s => s.listingId === listing.id);
        if (match) { setIsSaved(true); setSavedId(match.id); }
      }
    })();
  }, [listing.id]);

  const handleSave = async () => {
    if (!user) { router.push("/login"); return; }
    if (isSaved && savedId) {
      await unsaveListing(savedId);
      setIsSaved(false);
      setSavedId(null);
    } else {
      const res = await saveListing(listing.id);
      if (res.success) { setIsSaved(true); setSavedId(res.saved?.id); }
    }
  };

  const handleContactClick = () => {
    setShowContactModal(true);
    setContactRevealed(false);
    setTimeout(() => setContactRevealed(true), 2500);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> {backHref === "/market" ? t("listing.backToMarket") : t("listing.backToSaved")}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden bg-emerald-100">
              <img src={photos[currentPhotoIdx]} alt={listing.name} className="w-full h-full object-cover" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setCurrentPhotoIdx((p) => (p - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"><ChevronLeft className="w-4 h-4 text-emerald-900" /></button>
                  <button onClick={() => setCurrentPhotoIdx((p) => (p + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"><ChevronRight className="w-4 h-4 text-emerald-900" /></button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setCurrentPhotoIdx(i)} className={`w-16 h-12 rounded-xl overflow-hidden border-2 ${i === currentPhotoIdx ? 'border-emerald-800' : 'border-transparent'}`}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex flex-col gap-5"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-emerald-950 font-bold">{listing.name}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-emerald-700 mt-1">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className={`p-2.5 rounded-xl transition-all ${isSaved ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-emerald-900/5">
                <span className="text-[10px] uppercase font-bold text-emerald-950/40">{t("listing.available")}</span>
                <p className="text-xl font-bold font-numeric text-emerald-950 mt-1">{listing.availableWeight}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-emerald-900/5">
                <span className="text-[10px] uppercase font-bold text-emerald-950/40">{t("listing.impactPoints")}</span>
                <p className="text-xl font-bold font-numeric text-emerald-950 mt-1">{listing.impactPoints} {t("listing.ptsPerKg")}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950/40 mb-1">{t("listing.description")}</h3>
              <p className="text-sm text-emerald-950/80 leading-relaxed">{listing.description}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950/40 mb-1">{t("listing.quality")}</h3>
              <p className="text-sm text-emerald-950/80">{listing.qualityDesc}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-2">
                <Sprout className="w-4 h-4" /> {t("listing.sustainability")}
              </div>
              <p className="text-sm text-emerald-800/80">{listing.sustainability}</p>
            </div>

            {/* Farmer info */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-900/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950/40 mb-2">{t("listing.farmer")}</h3>
              <p className="text-lg font-semibold text-emerald-950">{listing.farmerName}</p>
              <p className="text-sm text-emerald-700 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {listing.location}
              </p>
            </div>

            {/* Climate Impact */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-green-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-green-300">{t("listing.climateImpact")}</span>
              </div>
              <p className="text-sm text-emerald-200/80 leading-relaxed">
                {t("listing.climateImpactDesc")}{" "}
                {t("listing.estimated")} <strong className="text-green-300">{listing.impactPoints} {t("listing.impactPoints")}</strong> {t("listing.perKg")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleContactClick}
                className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> {t("listing.contactFarmer")}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            {!contactRevealed ? (
              <div className="p-10 text-center flex flex-col items-center gap-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Sprout className="w-10 h-10 text-emerald-700" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-serif text-emerald-950 font-bold mb-3">
                    {t("listing.modalTitle")}
                  </h2>
                  <p className="text-sm text-emerald-950/70 leading-relaxed max-w-sm mx-auto">
                    {t("listing.modalSubtitle")}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, staggerChildren: 0.1 }}
                  className="flex flex-col gap-2 w-full text-left"
                >
                  {[
                    { icon: <Users className="w-4 h-4" />, text: t("listing.modalStrengthenCommunities") },
                    { icon: <Sprout className="w-4 h-4" />, text: t("listing.modalSupportSustainable") },
                    { icon: <Globe className="w-4 h-4" />, text: t("listing.modalReduceDependence") },
                    { icon: <Leaf className="w-4 h-4" />, text: t("listing.modalCreatePositiveImpact") }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center gap-2.5 text-sm text-emerald-800"
                    >
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        {item.icon}
                      </div>
                      <span>✓ {item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center"
                >
                  <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">{t("listing.estimatedImpact")}</span>
                  <p className="text-3xl font-bold font-numeric text-emerald-950 mt-1">
                    {listing.impactPoints * 2} {t("listing.points")}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">{t("listing.perUnit", { weight: listing.availableWeight })}</p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-xs text-emerald-950/50 animate-pulse"
                >
                  {t("listing.revealingInfo")}
                </motion.p>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t("listing.contactRevealed")}</span>
                  </div>
                  <button onClick={() => setShowContactModal(false)} className="p-1 text-emerald-400 hover:text-emerald-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-green-600 fill-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif text-emerald-950 font-bold mb-1">{listing.farmerName}</h3>
                  <p className="text-sm text-emerald-700 flex items-center justify-center gap-1 mb-6">
                    <MapPin className="w-3.5 h-3.5" /> {listing.location}
                  </p>

                  <div className="flex flex-col gap-3 mb-6">
                    <a
                      href={`tel:${listing.farmerPhone}`}
                      className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> {t("listing.callFarmer")}
                    </a>
                    <a
                      href={`https://wa.me/${listing.farmerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> {t("listing.whatsapp")}
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
                    <span className="text-[10px] font-bold uppercase text-emerald-950/40">{t("listing.phoneNumber")}</span>
                    <p className="text-lg font-bold font-numeric text-emerald-950 mt-1">
                      <a href={`tel:${listing.farmerPhone}`} className="hover:text-emerald-700 transition-colors">
                        {listing.farmerPhone}
                      </a>
                    </p>
                  </div>

                  <p className="text-xs text-emerald-950/50 mt-4">
                    {t("listing.earnedPrefix")} <strong>{listing.impactPoints * 2} {t("listing.impactPoints")}</strong> {t("listing.earnedSuffix")}
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}