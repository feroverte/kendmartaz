"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, MapPin, Phone, ArrowLeft, Heart, Sprout, Globe, CheckCircle2, X, ChevronLeft, ChevronRight, MessageCircle, Maximize2, Minus, Plus, Loader2 } from "lucide-react";
import { checkUserSession, saveListing, unsaveListing, getSavedListings, checkListingContact, submitListingAnswer } from "@/app/actions/dbActions";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function ListingDetailContent({ listing }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [backHref, setBackHref] = useState("/market");

  // Contact questionnaire state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactState, setContactState] = useState("initial"); // initial | questions | completed
  const [contactData, setContactData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [answerError, setAnswerError] = useState("");

  // Full-screen gallery state
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fsPhotoIdx, setFsPhotoIdx] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("from") === "profile") setBackHref("/profile?tab=saved");
    }
  }, []);

  const photos = (() => {
    try { const p = JSON.parse(listing.photos || "[]"); return [listing.photoMain, ...p].filter(Boolean); }
    catch { return [listing.photoMain].filter(Boolean); }
  })();

  useEffect(() => {
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

  useEffect(() => {
    const handleKey = (e) => {
      if (!fullscreenOpen) return;
      if (e.key === "Escape") { setFullscreenOpen(false); setZoomLevel(1); }
      if (e.key === "ArrowLeft") handleFsPrev();
      if (e.key === "ArrowRight") handleFsNext();
      if (e.key === "+" || e.key === "=") setZoomLevel(z => Math.min(z + 0.25, 4));
      if (e.key === "-") setZoomLevel(z => Math.max(z - 0.25, 0.5));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenOpen, fsPhotoIdx]);

  const handleFsPrev = useCallback(() => setFsPhotoIdx(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const handleFsNext = useCallback(() => setFsPhotoIdx(i => (i + 1) % photos.length), [photos.length]);

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

  const handleContactClick = async () => {
    if (!user) { router.push("/login"); return; }
    setShowContactModal(true);
    setContactState("initial");
    setContactData(null);
    setAnswers({});
    setAnswerError("");
    setContactLoading(true);
    const res = await checkListingContact(listing.id);
    setContactLoading(false);
    if (res.completed) {
      setContactState("completed");
      setContactData(res);
    } else {
      setContactState("questions");
      setContactData(res);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answers.usage || !answers.reason) { setAnswerError(t("listing.answerRequired")); return; }
    setAnswerError("");
    setContactLoading(true);
    const res = await submitListingAnswer(listing.id, answers);
    setContactLoading(false);
    if (res.success) {
      setContactState("completed");
      setContactData(res);
    } else {
      setAnswerError(res.error || t("listing.answerFailed"));
    }
  };

  const openFullscreen = (idx) => {
    setFsPhotoIdx(idx);
    setZoomLevel(1);
    setFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
    setZoomLevel(1);
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
            <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden bg-emerald-100 cursor-zoom-in group" onClick={() => openFullscreen(currentPhotoIdx)}>
              <img src={photos[currentPhotoIdx]} alt={listing.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
              {photos.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((p) => (p - 1 + photos.length) % photos.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white">
                    <ChevronLeft className="w-4 h-4 text-emerald-900" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((p) => (p + 1) % photos.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white">
                    <ChevronRight className="w-4 h-4 text-emerald-900" />
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setCurrentPhotoIdx(i)} className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 ${i === currentPhotoIdx ? 'border-emerald-800' : 'border-transparent hover:border-emerald-300'}`}>
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

      {/* Contact / Questionnaire Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            {/* Loading */}
            {contactLoading && (
              <div className="p-10 text-center flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
                <p className="text-sm text-emerald-950/70">{t("listing.loading")}</p>
              </div>
            )}

            {/* Questions */}
            {!contactLoading && contactState === "questions" && (
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-serif text-emerald-950 font-bold">{t("listing.questionsTitle")}</h2>
                  <button onClick={() => setShowContactModal(false)} className="p-1 text-emerald-400 hover:text-emerald-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-emerald-950/70 mb-6">{t("listing.questionsDesc")}</p>

                {/* Question 1 */}
                <div className="mb-5">
                  <p className="text-sm font-semibold text-emerald-950 mb-3">{t("listing.qUsage")}</p>
                  <div className="flex flex-col gap-2">
                    {t("listing.qOptionsUsage").split("|").map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setAnswers(a => ({ ...a, usage: opt }))}
                        className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${answers.usage === opt ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold" : "bg-white border-emerald-200/50 text-emerald-950/70 hover:border-emerald-300"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-emerald-950 mb-3">{t("listing.qReason")}</p>
                  <div className="flex flex-col gap-2">
                    {t("listing.qOptionsReason").split("|").map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setAnswers(a => ({ ...a, reason: opt }))}
                        className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${answers.reason === opt ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold" : "bg-white border-emerald-200/50 text-emerald-950/70 hover:border-emerald-300"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {answerError && <p className="text-sm text-red-500 mb-4">{answerError}</p>}

                <button
                  onClick={handleAnswerSubmit}
                  disabled={!answers.usage || !answers.reason}
                  className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-300 text-white rounded-2xl font-semibold text-sm transition-colors"
                >
                  {t("listing.submitAnswers")}
                </button>
              </div>
            )}

            {/* Completed — show phone */}
            {!contactLoading && contactState === "completed" && (
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
                      href={`tel:${contactData?.phone || listing.farmerPhone}`}
                      className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> {t("listing.callFarmer")}
                    </a>
                    <a
                      href={`https://wa.me/${(contactData?.phone || listing.farmerPhone).replace(/[^0-9]/g, '')}`}
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
                      <a href={`tel:${contactData?.phone || listing.farmerPhone}`} className="hover:text-emerald-700 transition-colors">
                        {contactData?.phone || listing.farmerPhone}
                      </a>
                    </p>
                  </div>

                  {contactData?.pointsAwarded > 0 && (
                    <p className="text-xs text-emerald-950/50 mt-4">
                      {t("listing.earnedPrefix")} <strong>{contactData.pointsAwarded} {t("listing.impactPoints")}</strong> {t("listing.earnedSuffix")}
                    </p>
                  )}
                </motion.div>
              </div>
            )}

            {/* Initial / error fallback */}
            {!contactLoading && contactState === "initial" && !contactData && (
              <div className="p-8 text-center">
                <p className="text-sm text-red-500">{t("listing.contactError")}</p>
                <button onClick={() => setShowContactModal(false)} className="mt-4 text-sm text-emerald-700 underline">
                  {t("listing.close")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Full-Screen Gallery Overlay */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center">
          <button onClick={closeFullscreen} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
            <button onClick={() => setZoomLevel(z => Math.max(z - 0.25, 0.5))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-xs text-white/80 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(z => Math.min(z + 0.25, 4))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button onClick={handleFsPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button onClick={handleFsNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/60 z-10">
                {fsPhotoIdx + 1} / {photos.length}
              </div>
            </>
          )}

          <motion.img
            key={fsPhotoIdx}
            src={photos[fsPhotoIdx]}
            alt=""
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[90vh] object-contain cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease-out" }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}