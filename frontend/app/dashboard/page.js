import React from "react";
import Link from "next/link";
import { 
  Sprout, 
  Users, 
  FileText, 
  Globe, 
  Award, 
  Leaf, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Activity 
} from "lucide-react";
import { getSettings, getRequests, getFarmers, getPageContent } from "@/app/actions/dbActions";
import { getServerLocale, serverT, localizeText } from "@/lib/serverLocale";

export const revalidate = 0;

function getLevelDetails(points, levels) {
  let activeLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].points) {
      activeLevel = levels[i];
      nextLevel = levels[i + 1] || null;
    }
  }

  const min = activeLevel.points;
  const max = nextLevel ? nextLevel.points : 1000;
  const range = max - min;
  const progress = nextLevel ? Math.min(((points - min) / range) * 100, 100) : 100;

  return { activeLevel, nextLevel, progress };
}

export default async function DashboardPage() {
  const locale = await getServerLocale();
  const settings = await getSettings();
  const requests = await getRequests();
  const farmers = await getFarmers();
  const dp = await getPageContent("dashboard_page");

  const dc = dp || {};

  const totalPoints = parseInt(settings.total_impact_points || "0");
  const totalRequests = parseInt(settings.purchase_requests || "0");
  const featuredFarmersCount = parseInt(settings.farmers_featured || "0");
  const totalCo2Saved = parseFloat(settings.estimated_climate_impact || "0.0");

  const defaultLevels = [
    { name: serverT(locale, "dashboard.level1Name"), points: 0, emoji: "🌱", color: "text-green-600 bg-green-50 border-green-200", desc: serverT(locale, "dashboard.level1Desc") },
    { name: serverT(locale, "dashboard.level2Name"), points: 50, emoji: "🌿", color: "text-emerald-700 bg-emerald-50 border-emerald-200", desc: serverT(locale, "dashboard.level2Desc") },
    { name: serverT(locale, "dashboard.level3Name"), points: 150, emoji: "🌎", color: "text-blue-700 bg-blue-50 border-blue-200", desc: serverT(locale, "dashboard.level3Desc") },
    { name: serverT(locale, "dashboard.level4Name"), points: 350, emoji: "🏆", color: "text-amber-800 bg-amber-50 border-amber-200", desc: serverT(locale, "dashboard.level4Desc") },
    { name: serverT(locale, "dashboard.level5Name"), points: 600, emoji: "🌳", color: "text-emerald-950 bg-emerald-100 border-emerald-300", desc: serverT(locale, "dashboard.level5Desc") }
  ];

  const levels = (dc.levels && dc.levels.length > 0) ? dc.levels.map(l => ({
    name: localizeText(l.name, locale),
    points: l.points,
    emoji: l.emoji || "🌱",
    color: defaultLevels.find(d => d.name === localizeText(l.name, "en"))?.color || "text-emerald-700 bg-emerald-50 border-emerald-200",
    desc: localizeText(l.desc, locale)
  })) : defaultLevels;

  const { activeLevel, nextLevel, progress } = getLevelDetails(totalPoints, levels);

  const productGroups = {};
  requests.forEach(r => {
    productGroups[r.product] = (productGroups[r.product] || 0) + r.quantity;
  });

  const chartData = Object.keys(productGroups).map(key => ({
    name: key,
    value: productGroups[key]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const defaultChartData = [
    { name: serverT(locale, "dashboard.chartHoney"), value: 32 },
    { name: serverT(locale, "dashboard.chartTomatoes"), value: 25 },
    { name: serverT(locale, "dashboard.chartApples"), value: 20 },
    { name: serverT(locale, "dashboard.chartCheese"), value: 15 },
    { name: serverT(locale, "dashboard.chartMilk"), value: 12 }
  ];
  const finalChartData = chartData.length > 0 ? chartData : defaultChartData;

  const maxChartValue = Math.max(...finalChartData.map(d => d.value), 1);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-950/10 pb-8 mb-10">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> {localizeText(dc.headerTag, locale) || serverT(locale, "dashboard.headerTag")}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-emerald-950 font-bold mt-1">
            {localizeText(dc.headerTitle, locale) || serverT(locale, "dashboard.headerTitle")}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Link
            href="/market"
            className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            {serverT(locale, "dashboard.submitRequest")}
            <ChevronRight className="w-4 h-4" />
          </Link>
          <span className="text-[11px] text-emerald-950/50 text-right leading-tight max-w-44">
            {localizeText(dc.headerSub, locale) || serverT(locale, "dashboard.headerSub")}
          </span>
        </div>
      </div>

      {/* Grid 1: Supporter Level & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Supporter Badge Level Card */}
        <div className="lg:col-span-2 bg-white border border-emerald-950/5 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950/50">
                  {localizeText(dc.supporterStatusLabel, locale) || serverT(locale, "dashboard.supporterStatusLabel")}
                </span>
                <h2 className="text-3xl font-serif font-bold text-emerald-950 mt-1 flex items-center gap-2">
                  <span>{activeLevel.emoji}</span>
                  {activeLevel.name}
                </h2>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${activeLevel.color}`}>
                {localizeText(dc.activeStatusLabel, locale) || serverT(locale, "dashboard.activeStatusLabel")}
              </span>
            </div>
            <p className="text-emerald-950/70 text-sm leading-relaxed mt-4">
              {activeLevel.desc}
            </p>

            {/* Quick metrics */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-900/5 text-center">
                <span className="text-lg font-bold font-numeric text-emerald-950 block">{totalRequests}</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-950/50 font-semibold">{localizeText(dc.productsRequestedLabel, locale) || serverT(locale, "dashboard.productsRequestedLabel")}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-900/5 text-center">
                <span className="text-lg font-bold font-numeric text-emerald-950 block">{featuredFarmersCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-950/50 font-semibold">{localizeText(dc.farmersSupportedLabel, locale) || serverT(locale, "dashboard.farmersSupportedLabel")}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-900/5 text-center">
                <span className="text-lg font-bold font-numeric text-emerald-950 block">{totalCo2Saved.toFixed(1)}t</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-950/50 font-semibold">{localizeText(dc.carbonSavedLabel, locale) || serverT(locale, "dashboard.carbonSavedLabel")}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-emerald-950/60 mb-2">
              <span>{localizeText(dc.progressLabel, locale) || serverT(locale, "dashboard.progressLabel")} {nextLevel ? nextLevel.name : (localizeText(dc.maxLevelLabel, locale) || serverT(locale, "dashboard.maxLevelLabel"))}</span>
              <span className="font-numeric">{totalPoints} / {nextLevel ? nextLevel.points : totalPoints} {localizeText(dc.pointsLabel, locale) || serverT(locale, "dashboard.pointsLabel")}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-emerald-900/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-850 progress-bar-fill rounded-full"
                style={{ width: `${progress}%`, backgroundColor: '#064e3b' }}
              />
            </div>
            {nextLevel && (
              <div className="text-[11px] text-emerald-800/80 mt-2">
                🌱 {(localizeText(dc.unlockLabel, locale) || serverT(locale, "dashboard.unlockLabel"))} <strong>{nextLevel.name}</strong> {(localizeText(dc.eachItemLabel, locale) || serverT(locale, "dashboard.eachItemLabel"))}
              </div>
            )}
          </div>
        </div>

        {/* Level Ranks list */}
        <div className="bg-[#fbfaf7] border border-emerald-950/5 rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950/60 mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-800" /> {localizeText(dc.supporterTierLabel, locale) || serverT(locale, "dashboard.supporterTierLabel")}
          </h3>
          <div className="flex flex-col gap-2">
            {levels.map((lvl) => {
              const isActive = activeLevel.name === lvl.name;
              return (
                <div 
                  key={lvl.name} 
                  className={`flex items-center justify-between p-3 rounded-2xl border text-sm transition-all ${
                    isActive 
                      ? "bg-emerald-900 text-white border-emerald-900 shadow-sm scale-[1.02]" 
                      : "bg-white text-emerald-950 border-emerald-950/5 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lvl.emoji}</span>
                    <span className="font-semibold">{lvl.name}</span>
                  </div>
                  <span className="font-numeric font-bold text-xs">{lvl.points}{localizeText(dc.ptsSuffix, locale) || serverT(locale, "dashboard.ptsSuffix")}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid 2: Statistics counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white border border-emerald-950/5 shadow-sm text-center">
          <span className="text-2xl block mb-2">🌱</span>
          <span className="text-2xl md:text-3xl font-bold font-numeric text-emerald-950 block">{totalPoints}</span>
          <span className="text-xs uppercase tracking-wider text-emerald-950/40 font-semibold mt-1 block">{localizeText(dc.impactPointsLabel, locale) || serverT(locale, "dashboard.impactPointsLabel")}</span>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-emerald-950/5 shadow-sm text-center">
          <span className="text-2xl block mb-2">🛒</span>
          <span className="text-2xl md:text-3xl font-bold font-numeric text-emerald-950 block">{totalRequests}</span>
          <span className="text-xs uppercase tracking-wider text-emerald-950/40 font-semibold mt-1 block">{localizeText(dc.requestsSavedLabel, locale) || serverT(locale, "dashboard.requestsSavedLabel")}</span>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-emerald-950/5 shadow-sm text-center">
          <span className="text-2xl block mb-2">👨‍🌾</span>
          <span className="text-2xl md:text-3xl font-bold font-numeric text-emerald-950 block">{featuredFarmersCount}</span>
          <span className="text-xs uppercase tracking-wider text-emerald-950/40 font-semibold mt-1 block">{localizeText(dc.activeFarmersLabel, locale) || serverT(locale, "dashboard.activeFarmersLabel")}</span>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-emerald-950/5 shadow-sm text-center">
          <span className="text-2xl block mb-2">🌍</span>
          <span className="text-2xl md:text-3xl font-bold font-numeric text-emerald-950 block">{totalCo2Saved.toFixed(2)}t</span>
          <span className="text-xs uppercase tracking-wider text-emerald-950/40 font-semibold mt-1 block">{localizeText(dc.co2ReducedLabel, locale) || serverT(locale, "dashboard.co2ReducedLabel")}</span>
        </div>
      </div>

      {/* Grid 3: Visual SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Product Demand Bar Chart */}
        <div className="bg-white border border-emerald-950/5 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-serif text-emerald-950 font-bold">{localizeText(dc.topProductsTitle, locale) || serverT(locale, "dashboard.topProductsTitle")}</h3>
              <p className="text-xs text-emerald-950/50 mt-0.5">{localizeText(dc.topProductsSub, locale) || serverT(locale, "dashboard.topProductsSub")}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-800" />
          </div>

          {/* SVG Bar Chart */}
          <div className="flex flex-col gap-5 pt-2">
            {finalChartData.map((d, index) => {
              const percentage = (d.value / maxChartValue) * 100;
              return (
                <div key={d.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-emerald-950 items-center">
                    <span>{d.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-numeric text-emerald-950/60">{d.value} {serverT(locale, "dashboard.units")}</span>
                      <span className="font-numeric font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                        {Math.round(percentage)}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-5 bg-emerald-900/5 rounded-lg overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-900 rounded-lg progress-bar-fill hover:bg-emerald-800 transition-colors"
                      style={{ width: `${percentage}%`, backgroundColor: index % 2 === 0 ? '#15803d' : '#14532d' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CO2 Emissions Offset Visual */}
        <div className="bg-emerald-950 text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">
              {localizeText(dc.impactFormulaSub, locale) || serverT(locale, "dashboard.impactFormulaSub")}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1 mb-4">
              {localizeText(dc.impactFormulaTitle, locale) || serverT(locale, "dashboard.impactFormulaTitle")}
            </h3>
            <p className="text-emerald-200/80 text-sm leading-relaxed mb-4">
              {localizeText(dc.impactFormulaText, locale) || serverT(locale, "dashboard.impactFormulaText")}
            </p>
            
            <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-emerald-300">
                <span>{localizeText(dc.calculatedOffsetLabel, locale) || serverT(locale, "dashboard.calculatedOffsetLabel")}</span>
                <span className="font-numeric font-bold">{totalPoints} points × 2kg</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>{localizeText(dc.totalSavingsLabel, locale) || serverT(locale, "dashboard.totalSavingsLabel")}</span>
                <span className="font-numeric font-bold text-lg text-green-300">
                  {totalCo2Saved.toFixed(3)} {localizeText(dc.tonnesLabel, locale) || serverT(locale, "dashboard.tonnesLabel")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-emerald-300/80 uppercase font-semibold tracking-wider pt-4 border-t border-white/10">
            <Leaf className="w-4 h-4 text-green-400" /> {(localizeText(dc.treesMatchLabel, locale) || serverT(locale, "dashboard.treesMatchLabel")).replace("{trees}", Math.round(totalCo2Saved * 45))}
          </div>
        </div>

        {/* Research Link */}
        <Link
          href="/research"
          className="lg:col-span-2 flex items-center justify-between p-6 bg-white border border-emerald-950/5 rounded-3xl hover:bg-emerald-50/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <span className="text-base font-bold text-emerald-950">{localizeText(dc.researchLinkTitle, locale) || serverT(locale, "research.title")}</span>
              <p className="text-sm text-emerald-950/60 mt-0.5 max-w-lg">
                {localizeText(dc.researchLinkSub, locale) || serverT(locale, "dashboard.researchLinkSub")}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0" />
        </Link>

      </div>

    </div>
  );
}
