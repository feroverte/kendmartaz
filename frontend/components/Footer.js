"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Globe, MapPin, Heart, Award, ExternalLink } from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function Footer() {
  const [credits, setCredits] = useState([]);
  const { locale } = useLocale();
  const t = useTranslations();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/credits`).then(r => r.json()).then(setCredits).catch(() => {});
  }, [BACKEND_URL]);

  return (
    <footer className="bg-emerald-950 text-[#fbfaf7] pt-16 pb-12 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* About section */}
        <div className="flex flex-col gap-4">
          <img src="/images/logo.png" alt="KendMart" className="w-36 h-auto" />
          <p className="text-emerald-200/75 text-sm leading-relaxed max-w-xs">
            {t("footer.tagline")}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            {t("footer.carbonNeutral")}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-4">
            {t("footer.climateInitiative")}
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-emerald-200/80">
            <li>
              <Link href="/mission" className="hover:text-white transition-colors">
                {t("footer.ourMission")}
              </Link>
            </li>
            <li>
              <Link href="/why-local" className="hover:text-white transition-colors">
                {t("footer.whySustainable")}
              </Link>
            </li>
            <li>
              <Link href="/research" className="hover:text-white transition-colors">
                {t("footer.research")}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                {t("footer.educational")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-4">
            {t("footer.communityTools")}
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-emerald-200/80">
            <li>
              <Link href="/market" className="hover:text-white transition-colors">
                {t("footer.farmersMarket")}
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                {t("footer.meetFarmers")}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                {t("footer.impactDashboard")}
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-white transition-colors">
                {t("footer.myProfile")}
              </Link>
            </li>
            <li className="text-xs text-emerald-400 font-medium italic mt-1">
              {t("footer.pureImpact")}
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            {t("footer.getInvolved")}
          </h4>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            {t("footer.getInvolvedDesc")}
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-emerald-200/70">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>info@kendmart.org</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Baku & Regions, Azerbaijan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recognition / Credits */}
      {credits.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 mb-8 border-b border-emerald-900/40">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{t("footer.recognition")}</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {credits.map(credit => (
              <a
                key={credit.id}
                href={credit.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-3 rounded-xl bg-emerald-900/30 border border-emerald-800/30 hover:bg-emerald-800/40 hover:border-emerald-700/50 transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">{credit.role}</span>
                <span className="text-sm font-medium text-emerald-100 mt-0.5 group-hover:text-white transition-colors flex items-center gap-1">
                  {credit.name}
                  <ExternalLink className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                {credit.platform && (
                  <span className="text-[9px] text-emerald-500/70 mt-0.5">{credit.platform}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-emerald-200/60">
        <div>
          &copy; {new Date().getFullYear()} KendMart. {t("footer.allRights")}
        </div>
        <div className="flex items-center gap-1.5">
          <span>{t("footer.madeWith")}</span>
          <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>{t("footer.forClimate")}</span>
        </div>
      </div>
    </footer>
  );
}
