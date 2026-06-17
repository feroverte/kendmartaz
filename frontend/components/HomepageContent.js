"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Leaf, 
  Sprout, 
  Users, 
  FileText, 
  Globe, 
  ArrowRight, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Heart, 
  ChevronRight, 
  ShieldCheck, 
  X,
  Sparkles
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { createRequest } from "@/app/actions/dbActions";
import confetti from "canvas-confetti";
import { useTranslations } from "@/hooks/useTranslations";

function ht(value, locale) {
  if (!value && value !== 0 && value !== "") return "";
  if (typeof value === "object" && value !== null) {
    return value[locale] || value.en || "";
  }
  return value || "";
}

export default function HomepageContent({ initialFarmers, initialSettings, initialPageContent, locale = "en" }) {
  const pc = initialPageContent || {};
  const _t = (v) => ht(v, locale);
  const t = useTranslations();
  // Stats state
  const [stats, setStats] = useState(initialSettings);
  const [farmers, setFarmers] = useState(initialFarmers);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  // Modal state
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    product: "",
    quantity: 1
  });

  const regions = ["All", ...new Set(farmers.map(f => f.region))];

  const filteredFarmers = farmers.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.products.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.practices.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "All" || f.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleOpenModal = (farmer) => {
    setSelectedFarmer(farmer);
    const productList = farmer.products.split(",").map(p => p.trim());
    setFormData({
      customerName: "",
      email: "",
      phone: "",
      product: productList[0] || "",
      quantity: 1
    });
  };

  const handleCloseModal = () => {
    setSelectedFarmer(null);
    setSuccessData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;

    setIsSubmitting(true);
    try {
      const result = await createRequest({
        ...formData,
        quantity: parseInt(formData.quantity) || 1,
        farmerId: selectedFarmer.id
      });

      if (result.success) {
        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#047857", "#34d399", "#fef08a"]
        });

        // Set success response
        setSuccessData(result);
        
        // Dynamically update stats in UI
        const addedPoints = result.pointsEarned;
        const currentPoints = parseInt(stats.total_impact_points || "0");
        const currentRequests = parseInt(stats.purchase_requests || "0");
        const currentImpact = parseFloat(stats.estimated_climate_impact || "0.0");

        setStats({
          ...stats,
          total_impact_points: String(currentPoints + addedPoints),
          purchase_requests: String(currentRequests + 1),
          estimated_climate_impact: String((currentImpact + (addedPoints * 0.002)).toFixed(2))
        });
      } else {
        const alertMsg = locale === "az" ? "Sorğu təqdim edilə bilmədi: " : "Failed to submit request: ";
        alert(alertMsg + result.error);
      }
    } catch (err) {
      console.error(err);
      alert(locale === "az" ? "Göndərmə zamanı xəta baş verdi." : "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent px-6 md:px-12 py-20 overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-green-200/20 blur-3xl -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-200/15 blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Tag */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/5 border border-emerald-900/10 text-emerald-900 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <Leaf className="w-3.5 h-3.5 text-green-600 fill-green-600" />
            {_t(pc.heroTag) || t("home.heroTag")}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-serif text-emerald-950 tracking-tight leading-[1.15] mb-6 max-w-4xl animate-fade-in">
            {_t(pc.heroTitle) || t("home.heroTitle")}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-emerald-950/70 max-w-2xl mb-10 leading-relaxed font-light">
            {_t(pc.heroSub) || t("home.heroSub")}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => scrollToSection("farmers-section")}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-green-600/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {t("home.requestLocal")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/mission"
              className="px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-900/10 rounded-2xl font-semibold text-base transition-colors duration-300 flex items-center justify-center"
            >
              {t("home.ourMission")}
            </Link>
            <button
              onClick={() => scrollToSection("statistics-section")}
              className="px-8 py-4 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-2xl font-semibold text-base transition-colors duration-300 flex items-center justify-center"
            >
              {t("home.impactStats")}
            </button>
          </div>
        </div>
      </section>

      {/* 2. MEET OUR FARMERS SECTION */}
      <section id="farmers-section" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full">
              {_t(pc.farmerSectionTag) || t("home.farmerSectionTag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-4">
              {_t(pc.farmerSectionTitle) || t("home.farmerSectionTitle")}
            </h2>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
              />
            </div>
            
            {/* Region select filter */}
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedRegion === region
                      ? "bg-emerald-900 text-white"
                      : "bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Farmer Grid */}
        {filteredFarmers.length === 0 ? (
          <div className="text-center py-20 bg-white border border-emerald-900/5 rounded-3xl">
            <p className="text-emerald-950/60 font-light">{t("home.noFarmers")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFarmers.map((farmer) => (
              <div 
                key={farmer.id} 
                className="bg-white border border-emerald-950/5 rounded-3xl overflow-hidden shadow-sm hover-lift flex flex-col justify-between"
              >
                {/* Farmer Image */}
                <div className="relative h-64 w-full bg-emerald-900/10">
                  <img
                    src={farmer.photoUrl}
                    alt={farmer.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#fbfaf7]/90 backdrop-blur-sm border border-emerald-900/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-900 shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {farmer.region}
                  </div>
                </div>

                {/* Farmer Details */}
                <div className="p-6 flex-grow flex flex-col gap-4">
                  <div>
                    <h3 className="text-2xl font-serif text-emerald-950 font-bold">{farmer.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mt-1">
                      🌱 {farmer.products}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-950/40 block">
                      {t("home.farmerStory")}
                    </span>
                    <p className="text-sm text-emerald-950/70 leading-relaxed mt-1 font-light italic">
                      "{farmer.story}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-950/40 block">
                      {t("home.sustainabilityPractices")}
                    </span>
                    <p className="text-sm text-emerald-900 font-medium leading-relaxed mt-1">
                      {farmer.practices}
                    </p>
                  </div>
                </div>

                {/* Farmer Actions */}
                <div className="p-6 border-t border-emerald-900/5 bg-[#fcfbfa]/50">
                  <button
                    onClick={() => handleOpenModal(farmer)}
                    className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-colors duration-200"
                  >
                    {t("home.requestProduct")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. STATS / COUNTERS SECTION */}
      <section id="statistics-section" className="py-16 bg-emerald-950 text-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-numeric font-bold mb-1 flex items-center justify-center">
                <AnimatedCounter value={stats.total_impact_points || "0"} />
              </div>
                <span className="text-xs md:text-sm uppercase tracking-wider text-emerald-200/70 font-medium">
                {t("home.totalImpactPoints")}
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-numeric font-bold mb-1">
                <AnimatedCounter value={stats.farmers_featured || "0"} />
              </div>
                <span className="text-xs md:text-sm uppercase tracking-wider text-emerald-200/70 font-medium">
                {t("home.farmersFeatured")}
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-numeric font-bold mb-1">
                <AnimatedCounter value={stats.purchase_requests || "0"} />
              </div>
                <span className="text-xs md:text-sm uppercase tracking-wider text-emerald-200/70 font-medium">
                {t("home.purchaseRequests")}
              </span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-numeric font-bold mb-1">
                <AnimatedCounter value={stats.estimated_climate_impact || "0.0"} suffix={t("home.co2Suffix")} />
              </div>
                <span className="text-xs md:text-sm uppercase tracking-wider text-emerald-200/70 font-medium">
                {t("home.co2Reduced")}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CLIMATE MISSION SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full">
            {_t(pc.missionSectionTag) || t("home.missionSectionTag")}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-4 mb-6">
            {_t(pc.missionSectionTitle) || t("home.missionSectionTitle")}
          </h2>
          <p className="text-base text-emerald-950/70 leading-relaxed font-light">
            {_t(pc.missionSectionSub) || t("home.missionSectionSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(pc.missionCards && pc.missionCards.length > 0 ? pc.missionCards.map(c => ({ title: _t(c.title), description: _t(c.description) })) : [
  { title: t("home.missionCard1Title"), description: t("home.missionCard1Desc") },
  { title: t("home.missionCard2Title"), description: t("home.missionCard2Desc") },
  { title: t("home.missionCard3Title"), description: t("home.missionCard3Desc") },
  { title: t("home.missionCard4Title"), description: t("home.missionCard4Desc") },
  { title: t("home.missionCard5Title"), description: t("home.missionCard5Desc") },
  { title: t("home.missionCard6Title"), description: t("home.missionCard6Desc") }
]).map((card, idx) => {
            const icons = [Sprout, Globe, Leaf, Heart, ShieldCheck, Sparkles];
            const Icon = icons[idx % icons.length];
            const isCTA = idx === (pc.missionCards ? pc.missionCards.length - 1 : 5);
            const cardClasses = isCTA
              ? "p-8 rounded-3xl bg-emerald-950 text-white flex flex-col justify-between gap-6"
              : "p-8 rounded-3xl bg-white border border-emerald-900/5 hover-lift flex flex-col gap-5";
            return (
              <div key={idx} className={cardClasses}>
                {isCTA ? (
                  <>
                    <div>
                      <Icon className="w-8 h-8 text-green-400 mb-4" />
                      <h3 className="text-xl font-serif text-green-300 font-semibold mb-2">{card.title}</h3>
                      <p className="text-emerald-200/80 text-sm leading-relaxed">{card.description}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-green-300 border-t border-emerald-800 pt-4 hover:text-white transition-colors">
                      {t("home.goToDashboard")}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif text-emerald-950 font-semibold">{card.title}</h3>
                    <p className="text-emerald-950/70 text-sm leading-relaxed">{card.description}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="py-24 bg-[#f3f1eb]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full">
              {_t(pc.howItWorksTag) || t("home.howItWorksTag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-4 mb-6">
              {_t(pc.howItWorksTitle) || t("home.howItWorksTitle")}
            </h2>
            <p className="text-base text-emerald-950/70 leading-relaxed font-light">
              {_t(pc.howItWorksSub) || t("home.howItWorksSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {(pc.steps && pc.steps.length > 0 ? pc.steps.map(s => ({ title: _t(s.title), description: _t(s.description) })) : [
  { title: t("home.step1Title"), description: t("home.step1Desc") },
  { title: t("home.step2Title"), description: t("home.step2Desc") },
  { title: t("home.step3Title"), description: t("home.step3Desc") },
  { title: t("home.step4Title"), description: t("home.step4Desc") }
]).map((step, idx) => (
              <div key={idx} className="flex flex-col gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-900 text-white font-numeric font-bold text-lg flex items-center justify-center shadow-md">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-serif text-emerald-950 font-semibold mt-2">{step.title}</h3>
                <p className="text-sm text-emerald-950/75 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Survey Link Banner */}
      {stats.survey_link && (
        <section className="py-12 px-6 md:px-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-950 to-emerald-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-serif font-bold">{t("home.helpUsImprove")}</h3>
              <p className="text-emerald-200/80 text-sm mt-1">{t("home.surveyDesc")}</p>
            </div>
            <a
              href={stats.survey_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              {t("home.takeSurvey")}
            </a>
          </div>
        </section>
      )}

      {/* PURCHASE REQUEST FORM MODAL */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-emerald-900/10 animate-fade-in">
            {/* Header */}
            <div className="bg-emerald-950 p-6 text-white flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-semibold text-green-300 tracking-wider">
                  {t("home.requestConnection")}
                </span>
                <h3 className="text-2xl font-serif mt-1 font-bold">
                  {t("home.sourcingFrom")} {selectedFarmer.name}
                </h3>
                <p className="text-xs text-emerald-200/80 mt-1">
                  {selectedFarmer.region} • {t("home.directFarmerSupport")}
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-emerald-100 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Success overlay */}
            {successData ? (
              <div className="p-8 text-center flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-serif text-emerald-950 font-bold mb-2">{t("home.requestSubmitted")}</h4>
                  <p className="text-sm text-emerald-950/70 leading-relaxed max-w-sm">
                    {t("home.requestThankYou")} <span className="font-semibold text-emerald-950">{formData.product}</span> ({formData.quantity}) {t("home.requestDetail")} {selectedFarmer.name} {t("home.willContact")}
                  </p>
                </div>

                {/* Points Card */}
                <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-900/5 flex items-center justify-between text-left">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      {t("home.climateImpactGenerated")}
                    </span>
                    <span className="block text-lg font-bold text-emerald-950">
                      🌱 {successData.pointsEarned} {t("home.impactPoints")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-600 block">{t("home.carbonOffset")}</span>
                    <span className="text-sm font-bold text-emerald-900 font-numeric">
                      -{(successData.pointsEarned * 0.002).toFixed(3)} {t("dashboard.tonnesLabel")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 w-full mt-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-xl text-center text-sm font-semibold transition-colors"
                  >
                    {t("home.viewSupporterLevel")}
                  </Link>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    {t("home.closeWindow")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                
                {/* Product Select from farmer products list */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950/60 mb-1">
                    {t("home.selectProduct")}
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full p-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  >
                    {selectedFarmer.products.split(",").map((p) => {
                      const name = p.trim();
                      return (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Quantity input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950/60 mb-1">
                    {t("home.quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value === "" ? "" : parseInt(e.target.value) || 1 })}
                    onBlur={() => setFormData((prev) => ({ ...prev, quantity: prev.quantity === "" ? 1 : prev.quantity }))}
                    className="w-full p-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950/60 mb-1">
                    {t("home.yourName")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("home.requestNamePlaceholder")}
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950/60 mb-1">
                    {t("home.emailAddress")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("home.requestEmailPlaceholder")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950/60 mb-1">
                    {t("home.phoneNumber")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("home.requestPhonePlaceholder")}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-emerald-900/5 border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
                    required
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 border border-emerald-950/15 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors text-emerald-950"
                  >
                    {t("home.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? t("home.submitting") : t("home.submitRequest")}
                  </button>
                </div>

                <div className="text-[10px] text-emerald-950/50 text-center leading-relaxed mt-2">
                  🔐 {t("home.privacyNotice")}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
