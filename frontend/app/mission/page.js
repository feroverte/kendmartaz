import React from "react";
import { getPageContent } from "@/app/actions/dbActions";
import { Leaf, Sprout, Globe, Heart, ShieldCheck } from "lucide-react";
import { getServerLocale, serverT, localizeText } from "@/lib/serverLocale";
import ImageCarousel from "@/components/ImageCarousel";

export const revalidate = 0;

export default async function MissionPage() {
  const locale = await getServerLocale();
  const pageData = await getPageContent("mission_page");

  const heroTitle = localizeText(pageData?.heroTitle, locale) || serverT(locale, "mission.heroTitle");
  const heroSub = localizeText(pageData?.heroSub, locale) || serverT(locale, "mission.heroSub");
  const ceoTitle = localizeText(pageData?.ceoTitle, locale) || serverT(locale, "mission.ceoTitle");
  const ceoName = localizeText(pageData?.ceoName, locale) || serverT(locale, "mission.ceoName");
  const ceoBio = localizeText(pageData?.ceoBio, locale) || serverT(locale, "mission.ceoBio");
  const ceoQuote = localizeText(pageData?.ceoQuote, locale) || serverT(locale, "mission.ceoQuote");
  const defaultSections = [
    { title: serverT(locale, "mission.section1Title"), description: serverT(locale, "mission.section1Desc") },
    { title: serverT(locale, "mission.section2Title"), description: serverT(locale, "mission.section2Desc") },
    { title: serverT(locale, "mission.section3Title"), description: serverT(locale, "mission.section3Desc") },
    { title: serverT(locale, "mission.section4Title"), description: serverT(locale, "mission.section4Desc") },
    { title: serverT(locale, "mission.section5Title"), description: serverT(locale, "mission.section5Desc") }
  ];

  const sections = (pageData?.sections && pageData.sections.length > 0) ? pageData.sections.map(s => ({
    title: localizeText(s.title, locale),
    description: localizeText(s.description, locale)
  })) : defaultSections;

  const icons = [
    <Sprout className="w-7 h-7 text-emerald-800" />,
    <Globe className="w-7 h-7 text-emerald-800" />,
    <Leaf className="w-7 h-7 text-emerald-800" />,
    <Heart className="w-7 h-7 text-emerald-800" />,
    <ShieldCheck className="w-7 h-7 text-emerald-800" />
  ];

  return (
    <div className="py-16">
      {/* Hero */}
      <section className="bg-emerald-950 text-white py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-widest block mb-4">
            {serverT(locale, "mission.initiativeIntent")}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-none">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-emerald-200/80 leading-relaxed font-light">
            {heroSub}
          </p>
        </div>
      </section>

      {/* CEO Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-2/5 bg-emerald-100 flex items-center justify-center p-8">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-emerald-200 flex items-center justify-center overflow-hidden border-4 border-emerald-900/10">
              <img
                src={pageData?.ceoPhoto || "/images/Sustainable-Agriculture.jpg"}
                alt={ceoName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">{ceoTitle}</span>
            <h3 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold mt-2">{ceoName}</h3>
            <p className="text-sm text-emerald-950/70 mt-3 leading-relaxed">
              {ceoBio}
            </p>
            <blockquote className="mt-6 text-base md:text-lg text-emerald-950/80 leading-relaxed italic border-l-4 border-emerald-800 pl-4">
              &ldquo;{ceoQuote}&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full">
            {serverT(locale, "mission.ourPrinciples")}
          </span>
          <p className="text-base text-emerald-950/70 leading-relaxed font-light mt-4">
            {serverT(locale, "mission.principlesDesc")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {sections.length > 0 ? sections.map((section, index) => (
            <div 
              key={index}
              className="p-8 rounded-3xl bg-white border border-emerald-950/5 shadow-sm flex gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                {icons[index % icons.length]}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-serif text-emerald-950 font-semibold">
                  {section.title}
                </h3>
                <p className="text-emerald-950/70 text-sm leading-relaxed font-light">
                  {section.description}
                </p>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center text-emerald-950/40 py-12">{serverT(locale, "mission.noContent")}</div>
          )}
        </div>
      </section>

      {/* Photo Gallery Carousel */}
      {pageData?.photos && pageData.photos.length > 0 && (
        <ImageCarousel photos={pageData.photos} />
      )}

      {/* Quote Banner */}
      <section className="bg-[#f3f1eb] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <Leaf className="w-8 h-8 text-emerald-800 fill-emerald-800" />
          <h3 className="text-2xl font-serif text-emerald-950 font-bold">{serverT(locale, "mission.pledgeTitle")}</h3>
          <blockquote className="text-2xl md:text-3xl font-serif text-emerald-950 italic leading-relaxed">
            &ldquo;{serverT(locale, "mission.pledgeText")}&rdquo;
          </blockquote>
          <p className="text-sm text-emerald-950/70 leading-relaxed max-w-xl">
            {serverT(locale, "mission.pledgeDesc")}
          </p>
        </div>
      </section>
    </div>
  );
}
