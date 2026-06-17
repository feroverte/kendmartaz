import React from "react";
import { getPageContent } from "@/app/actions/dbActions";
import { Leaf, Award, ShieldCheck, Heart, Tractor } from "lucide-react";
import { getServerLocale, serverT, localizeText } from "@/lib/serverLocale";

export const revalidate = 0;

export default async function WhyLocalPage() {
  const locale = await getServerLocale();
  const pageData = await getPageContent("why_local_page");

  const heroTitle = localizeText(pageData?.heroTitle, locale) || serverT(locale, "whyLocal.heroTitle");
  const heroSub = localizeText(pageData?.heroSub, locale) || serverT(locale, "whyLocal.heroSub");
  const defaultSections = [
    { id: "industrial", title: serverT(locale, "whyLocal.section1Title"), content: serverT(locale, "whyLocal.section1Content") },
    { id: "soils", title: serverT(locale, "whyLocal.section2Title"), content: serverT(locale, "whyLocal.section2Content") },
    { id: "chemicals", title: serverT(locale, "whyLocal.section3Title"), content: serverT(locale, "whyLocal.section3Content") },
    { id: "resilience", title: serverT(locale, "whyLocal.section4Title"), content: serverT(locale, "whyLocal.section4Content") }
  ];

  const sections = (pageData?.sections && pageData.sections.length > 0) ? pageData.sections.map(s => ({
    id: s.id,
    title: localizeText(s.title, locale),
    content: localizeText(s.content, locale)
  })) : defaultSections;

  const evidenceMap = {
    industrial: serverT(locale, "whyLocal.evidenceIndustrial"),
    soils: serverT(locale, "whyLocal.evidenceSoils"),
    chemicals: serverT(locale, "whyLocal.evidenceChemicals"),
    resilience: serverT(locale, "whyLocal.evidenceResilience")
  };

  const illustrations = {
    industrial: <Tractor className="w-8 h-8 text-emerald-800" />,
    soils: <Leaf className="w-8 h-8 text-emerald-800" />,
    chemicals: <Heart className="w-8 h-8 text-emerald-800" />,
    resilience: <ShieldCheck className="w-8 h-8 text-emerald-800" />
  };

  return (
    <div className="py-16">
      {/* Hero */}
      <section className="bg-emerald-950 text-white py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-widest block mb-4">
            {serverT(locale, "whyLocal.sustainableScience")}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-emerald-200/80 leading-relaxed font-light">
            {heroSub}
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-20 flex flex-col gap-16">
        {sections.length > 0 ? sections.map((section) => (
          <div 
            key={section.id || section.title} 
            className="flex flex-col md:flex-row gap-8 items-start p-8 rounded-3xl bg-white border border-emerald-950/5 shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm">
              {illustrations[section.id] || <Award className="w-8 h-8 text-emerald-800" />}
            </div>
            
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-serif text-emerald-950 font-bold">
                {section.title}
              </h2>
              <p className="text-emerald-950/70 text-sm md:text-base leading-relaxed font-light">
                {section.content}
              </p>
              {evidenceMap[section.id] && (
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-900/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{serverT(locale, "whyLocal.environmentalImpact")}</span>
                  <p className="text-sm text-emerald-800/80 leading-relaxed mt-1">
                    {evidenceMap[section.id]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center text-emerald-950/40 py-12">{serverT(locale, "whyLocal.noContent")}</div>
        )}
      </section>

      {/* Why It Matters */}
      <section className="bg-emerald-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-green-400 block mb-4">
            {serverT(locale, "whyLocal.takeaway")}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-white font-bold mb-10">
            {serverT(locale, "whyLocal.whyItMatters")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-sm text-emerald-100 font-medium">{serverT(locale, "whyLocal.healthierSoils")}</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-sm text-emerald-100 font-medium">{serverT(locale, "whyLocal.reducedCarbon")}</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-sm text-emerald-100 font-medium">{serverT(locale, "whyLocal.strongerEconomies")}</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-sm text-emerald-100 font-medium">{serverT(locale, "whyLocal.betterResilience")}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
