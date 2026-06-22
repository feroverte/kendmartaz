"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function FaqSection({ faq, locale }) {
  const t = useTranslations();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-20" id="faq">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full">
          FAQ
        </span>
        <h1 className="text-3xl md:text-4xl font-serif text-emerald-950 font-bold mt-6 mb-4">
          {t("faq.title")}
        </h1>
        <p className="text-emerald-950/70 leading-relaxed font-light">
          {t("faq.subtitle")}
        </p>
      </div>

      {faq.length === 0 && (
        <p className="text-center text-emerald-950/40 py-12">{t("faq.noCategories")}</p>
      )}

      <div className="flex flex-col gap-8">
        {faq.map((cat) => (
          <div key={cat.id}>
            <h2 className="text-xl font-serif text-emerald-950 font-semibold mb-4 pb-2 border-b border-emerald-900/10">
              {cat.name}
            </h2>
            <div className="flex flex-col gap-2">
              {cat.questions.map((q) => (
                <div key={q.id} className="bg-white rounded-2xl border border-emerald-950/5 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggle(q.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center shrink-0 transition-transform duration-300 ${openId === q.id ? "rotate-45" : ""}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-emerald-950 pr-4">{q.question}</span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: openId === q.id ? "400px" : "0px",
                      opacity: openId === q.id ? 1 : 0,
                    }}
                  >
                    <div className="px-5 pb-5 pl-16">
                      <p className="text-sm text-emerald-950/70 leading-relaxed">{q.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}