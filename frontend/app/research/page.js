import React from "react";
import { Sprout, Globe, BarChart3, Users, FileText, Database, Download, Share2, Tractor, Leaf, Heart, ShieldCheck } from "lucide-react";
import { getDatasets } from "@/app/actions/dbActions";
import { getServerLocale, serverT, localizeText } from "@/lib/serverLocale";
import PublicResearchContent from "@/components/PublicResearchContent";

export const revalidate = 0;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function ResearchPage() {
  const locale = await getServerLocale();
  const data = await getDatasets(true);
  const { datasets, settings } = data || { datasets: [], settings: {} };

  let userCount = 0;
  try {
    const res = await fetch(`${API}/api/users/count`, { cache: "no-store" });
    if (res.ok) { const j = await res.json(); userCount = j.count || 0; }
  } catch {}

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Hero */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-7 h-7 text-emerald-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 font-bold mb-4 leading-tight">
            {serverT(locale, "research.title")}
          </h1>
          <p className="text-lg text-emerald-950/60 leading-relaxed">
            {serverT(locale, "research.subtitle")}
          </p>
        </div>

        <PublicResearchContent datasets={datasets} settings={settings} userCount={userCount} />
      </div>
    </div>
  );
}
