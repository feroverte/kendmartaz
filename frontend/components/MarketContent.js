"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, MapPin, Search, Sparkles, Heart, Store, Sprout, ArrowRight, Eye } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function MarketContent({ initialListings }) {
  const { locale } = useLocale();
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const activeListings = initialListings.filter(l => l.status === "Active");

  const locations = ["All", ...new Set(activeListings.map(l => l.location))];

  const filtered = activeListings.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "All" || l.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-green-200/20 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-200/15 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-900/5 border border-emerald-900/10 text-emerald-900 text-xs font-semibold uppercase tracking-wider mb-6 mx-auto w-fit">
              <Store className="w-3.5 h-3.5" />
              {t("market.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 tracking-tight leading-[1.15] mb-6">
              {t("market.title")}
            </h1>
            <p className="text-lg text-emerald-950/70 max-w-2xl mx-auto leading-relaxed font-light">
              {t("market.subtitle")}
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-4xl mx-auto"
          >
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-emerald-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("market.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-950/15 rounded-2xl text-sm focus:outline-none focus:border-emerald-800 transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedLocation === loc
                      ? "bg-emerald-900 text-white"
                      : "bg-white border border-emerald-900/10 hover:bg-emerald-50 text-emerald-900"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Climate note */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm flex items-center gap-3">
          <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>{t("market.climateBold")}:</strong> {t("market.climateDesc")}
          </span>
        </div>
      </div>

      {/* Listing Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-emerald-900/5 rounded-3xl">
            <Store className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-950/60 font-light">{t("market.noResults")}</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((listing, idx) => (
              <ListingCard key={listing.id} listing={listing} idx={idx} variants={cardVariants} />
            ))}
          </motion.div>
        )}

        {/* Farmer note */}
        <div className="mt-16 p-8 rounded-3xl bg-emerald-950 text-white text-center max-w-2xl mx-auto">
          <Leaf className="w-8 h-8 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-3">{t("market.farmerCtaTitle")}</h3>
          <p className="text-emerald-200/80 text-sm leading-relaxed max-w-md mx-auto">
            {t("market.farmerCtaDesc")}
          </p>
        </div>
      </section>
    </div>
  );
}

function ListingCard({ listing, variants }) {
  return (
    <motion.div variants={variants} className="bg-white border border-emerald-950/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <Link href={`/market/${listing.id}`}>
        <div className="relative h-52 bg-emerald-100 overflow-hidden">
          <img
            src={listing.photoMain}
            alt={listing.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#fbfaf7]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-900 shadow-sm">
            <MapPin className="w-3 h-3 text-emerald-700" />
            {listing.location}
          </div>
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-green-300">
            {listing.impactPoints} {t("market.ptsPerKg")}
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col gap-3">
        <Link href={`/market/${listing.id}`}>
          <h3 className="text-xl font-serif text-emerald-950 font-bold group-hover:text-emerald-700 transition-colors">
            {listing.name}
          </h3>
        </Link>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-emerald-950/40 font-semibold uppercase tracking-wider">{t("market.available")}</span>
            <span className="font-semibold text-emerald-950">{listing.availableWeight}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-emerald-950/40 font-semibold uppercase tracking-wider">{t("market.quality")}</span>
            <span className="font-semibold text-emerald-950 line-clamp-1">{listing.qualityDesc}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
          <Sparkles className="w-3 h-3" />
          <span className="font-semibold">{t("market.sustainability")}: {listing.sustainability?.split('.')[0]}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <Leaf className="w-3 h-3 fill-green-600" />
          {listing.impactPoints} {t("market.impactPerKg")}
        </div>

        <div className="flex gap-2 mt-1">
          <Link
            href={`/market/${listing.id}`}
            className="flex-1 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> {t("market.viewDetails")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}