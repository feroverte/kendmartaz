"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, TrendingUp, Clock, DollarSign, Star, CheckCircle2, XCircle, ShoppingBag, BarChart3, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, Sector } from "recharts";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const CARD_CLASS = "bg-white border border-emerald-950/5 rounded-2xl shadow-sm overflow-hidden";
const SECTION_TITLE = "text-xl font-serif font-bold text-emerald-950";
const SUBSECTION_TITLE = "text-xl font-serif font-semibold text-emerald-950";

const PIE_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#0d9488", "#14b8a6", "#65a30d", "#84cc16"];

const COLUMN_MATCHERS = {
  q1: ["sonuncu dəfə orqanik", "haradan tapdınız", "1."],
  q2: ["çətinlik", "2."],
  q4: ["çatdırılma necə oldu", "çatdırılma müddəti", "4."],
  q5: ["çatdırılma xərci"],
  q6: ["ümumi məmnuniyyət"],
  q7: ["heç olub ki", "tapa bilməmisiniz", "5."],
  q8: ["necə tapırsınız", "6."],
  q9: ["nə qədər tez-tez", "tez-tez alırsınız", "7."],
};

function findColumn(columns, matchers) {
  return columns.find(c => matchers.some(m => c.name.toLowerCase().includes(m.toLowerCase())));
}

function aggregateValues(rows, columnName) {
  const counts = {};
  rows.forEach(row => {
    const val = row[columnName];
    if (val && val.trim()) {
      const key = val.trim();
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const items = Object.entries(counts)
    .map(([name, count]) => ({ name, count, percentage: (count / total * 100) }))
    .sort((a, b) => b.count - a.count);
  return { items, total };
}

function PieTooltip({ active, payload }) {
  const t = useTranslations();
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-emerald-950/10 rounded-xl shadow-lg px-4 py-3">
      <p className="font-semibold text-emerald-950 text-sm mb-1">{d.name}</p>
      <p className="text-emerald-700 text-sm">{d.payload.count} {t("survey.responses")} <span className="text-emerald-400">({d.payload.percentage.toFixed(1)}%)</span></p>
    </div>
  );
}

function BarTooltip({ active, payload }) {
  const t = useTranslations();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-emerald-950/10 rounded-xl shadow-lg px-4 py-3">
      <p className="font-semibold text-emerald-950 text-sm mb-1">{d.name}</p>
      <p className="text-emerald-700 text-sm">{d.count} {t("survey.responses")} <span className="text-emerald-400">({d.percentage.toFixed(1)}%)</span></p>
    </div>
  );
}

function ActivePieShape({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) {
  return (
    <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.85} />
  );
}

function RenderActivePie({ activeIndex, setActiveIndex, data, colors }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RePieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={ActivePieShape}
          data={data}
          cx="50%" cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="count"
          nameKey="name"
          onMouseEnter={(_, idx) => setActiveIndex(idx)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={colors[idx % colors.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={40}
          formatter={(value, entry) => (
            <span className="text-sm text-emerald-950/80">{value} — {entry.payload?.count || 0}</span>
          )}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}

function PieChartCard({ title, data, total, icon: Icon }) {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(null);
  if (!data || data.length === 0) return null;
  return (
    <div className={CARD_CLASS}>
      <div className="p-5 pb-2 flex items-center gap-2 border-b border-emerald-950/5">
        {Icon && <Icon className="w-5 h-5 text-emerald-600" />}
        <h4 className="text-base font-semibold text-emerald-950">{title}</h4>
        <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{total} {t("survey.responses")}</span>
      </div>
      <div className="p-4">
        <RenderActivePie activeIndex={activeIndex} setActiveIndex={setActiveIndex} data={data} colors={PIE_COLORS} />
      </div>
    </div>
  );
}

function HorizontalBarCard({ title, data, total, icon: Icon }) {
  const t = useTranslations();
  const TOP_N = 10;
  const displayData = data.slice(0, TOP_N);
  const maxCount = displayData[0]?.count || 1;
  return (
    <div className={CARD_CLASS}>
      <div className="p-5 pb-2 flex items-center gap-2 border-b border-emerald-950/5">
        {Icon && <Icon className="w-5 h-5 text-emerald-600" />}
        <h4 className="text-base font-semibold text-emerald-950">{title}</h4>
        <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{total} {t("survey.responses")}</span>
      </div>
      <div className="p-5">
        {data.length > TOP_N && (
          <p className="text-xs text-emerald-500 mb-4 font-medium">{t("survey.topVariants", { top: TOP_N, total: data.length })}</p>
        )}
        <div className="flex flex-col gap-3">
          {displayData.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              className="group relative"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-emerald-950 leading-tight pr-2 flex-1">{item.name}</span>
                <span className="text-sm font-semibold text-emerald-700 whitespace-nowrap">{item.count} ({item.percentage.toFixed(1)}%)</span>
              </div>
              <div className="relative h-7 bg-emerald-50 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ delay: idx * 0.03, duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResponseExplorer({ data, total, title, icon: Icon }) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(d => d.name.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div className={CARD_CLASS}>
      <div className="p-5 pb-2 flex items-center gap-2 border-b border-emerald-950/5">
        {Icon && <Icon className="w-5 h-5 text-emerald-600 shrink-0" />}
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-emerald-950">{t("survey.openResponses")}</h4>
          <p className="text-xs text-emerald-500/70 truncate">{title}</p>
        </div>
        <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">{total} {t("survey.responses")}</span>
      </div>
      <div className="px-5 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            type="text"
            placeholder={t("survey.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-emerald-50/50 border border-emerald-950/10 rounded-xl text-sm text-emerald-950 placeholder:text-emerald-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>
      </div>
      <div className="px-5 pb-5 max-h-[400px] overflow-y-auto space-y-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-200">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <p className="text-sm text-emerald-400 text-center py-8">{t("survey.noMatches")}</p>
          ) : filtered.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-950/5 hover:bg-emerald-50 hover:border-emerald-950/10 transition-all"
            >
              <p className="text-sm text-emerald-950/80 leading-relaxed">{item.name}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SplitComparison({ beliCount, xeyrCount, total }) {
  const t = useTranslations();
  const beliPct = (beliCount / total * 100);
  const xeyrPct = (xeyrCount / total * 100);
  const dominant = beliCount >= xeyrCount ? "Bəli" : "Xeyr";

  return (
    <div className={CARD_CLASS}>
      <div className="p-5 pb-2 flex items-center gap-2 border-b border-emerald-950/5">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <h4 className="text-base font-semibold text-emerald-950">{t("survey.productAvailability")}</h4>
        <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{total} {t("survey.responses")}</span>
      </div>
      <div className="p-6">
        <p className="text-sm text-emerald-500/70 mb-6 text-center">
          {t("survey.productAvailabilityDesc")}
        </p>
        <div className="flex gap-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`flex-1 rounded-2xl p-6 text-center border-2 transition-all ${dominant === "Bəli" ? "bg-emerald-950 border-emerald-800 text-white shadow-lg" : "bg-white border-emerald-950/10"}`}
          >
            <p className={`text-sm uppercase font-bold tracking-wider ${dominant === "Bəli" ? "text-emerald-300" : "text-emerald-400"}`}>{t("survey.yes")}</p>
            <p className={`text-5xl font-bold mt-2 ${dominant === "Bəli" ? "text-white" : "text-emerald-950"}`}>{beliCount}</p>
            <p className={`text-xl font-semibold mt-1 ${dominant === "Bəli" ? "text-emerald-300" : "text-emerald-500"}`}>{beliPct.toFixed(1)}%</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className={`flex-1 rounded-2xl p-6 text-center border-2 transition-all ${dominant === "Xeyr" ? "bg-emerald-950 border-emerald-800 text-white shadow-lg" : "bg-white border-emerald-950/10"}`}
          >
            <p className={`text-sm uppercase font-bold tracking-wider ${dominant === "Xeyr" ? "text-emerald-300" : "text-emerald-400"}`}>{t("survey.no")}</p>
            <p className={`text-5xl font-bold mt-2 ${dominant === "Xeyr" ? "text-white" : "text-emerald-950"}`}>{xeyrCount}</p>
            <p className={`text-xl font-semibold mt-1 ${dominant === "Xeyr" ? "text-emerald-300" : "text-emerald-500"}`}>{xeyrPct.toFixed(1)}%</p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-950/5 text-center"
        >
          <p className="text-sm text-emerald-700 font-medium">
            {t("survey.dominanceText", { dominant: dominant, diff: Math.abs(beliCount - xeyrCount), pct: Math.abs(beliPct - xeyrPct).toFixed(1) })}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StatsBar({ totalResponses, totalQuestions, dataset }) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: t("survey.totalResponses"), value: totalResponses, icon: Users, color: "from-emerald-600 to-emerald-500" },
        { label: t("survey.questionsAnalyzed"), value: totalQuestions, icon: MessageSquare, color: "from-teal-600 to-teal-500" },
        { label: t("survey.responseRate"), value: `${(totalResponses / (dataset.rows?.length || 1) * 100).toFixed(0)}%`, icon: BarChart3, color: "from-emerald-700 to-emerald-600" },
        { label: t("survey.datasetRecords"), value: dataset.rows?.length || 0, icon: FileText, color: "from-emerald-500 to-emerald-400" },
      ].map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.3 }}
          className="bg-white border border-emerald-950/5 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-950 font-numeric">{stat.value}</p>
              <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function SurveyReport({ dataset }) {
  const columns = dataset?.columns || [];
  const rows = dataset?.rows || [];

  const { locale } = useLocale();
  const t = useTranslations();

  const colQ1 = findColumn(columns, COLUMN_MATCHERS.q1);
  const colQ2 = findColumn(columns, COLUMN_MATCHERS.q2);
  const colQ4 = findColumn(columns, COLUMN_MATCHERS.q4);
  const colQ5 = findColumn(columns, COLUMN_MATCHERS.q5);
  const colQ6 = findColumn(columns, COLUMN_MATCHERS.q6);
  const colQ7 = findColumn(columns, COLUMN_MATCHERS.q7);
  const colQ8 = findColumn(columns, COLUMN_MATCHERS.q8);
  const colQ9 = findColumn(columns, COLUMN_MATCHERS.q9);

  const q1Data = colQ1 ? aggregateValues(rows, colQ1.name) : null;
  const q2Data = colQ2 ? aggregateValues(rows, colQ2.name) : null;
  const q4Data = colQ4 ? aggregateValues(rows, colQ4.name) : null;
  const q5Data = colQ5 ? aggregateValues(rows, colQ5.name) : null;
  const q6Data = colQ6 ? aggregateValues(rows, colQ6.name) : null;
  const q7Data = colQ7 ? aggregateValues(rows, colQ7.name) : null;
  const q8Data = colQ8 ? aggregateValues(rows, colQ8.name) : null;
  const q9Data = colQ9 ? aggregateValues(rows, colQ9.name) : null;

  const hasSurveyData = colQ1 || colQ2;
  if (!hasSurveyData) return null;

  const totalResponses = rows.length;
  const questionsFound = [colQ1, colQ2, colQ4, colQ5, colQ6, colQ7, colQ8, colQ9].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-emerald-950">{t("survey.dashboard")}</h2>
        <p className="text-sm text-emerald-500 mt-1">{dataset.name || "Survey Analysis Report"}</p>
      </div>

      <StatsBar totalResponses={totalResponses} totalQuestions={questionsFound} dataset={dataset} />

      {q1Data && q1Data.items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className={SECTION_TITLE + " mb-4"}>{t("survey.q1")}</h3>
          <ResponseExplorer data={q1Data.items} total={q1Data.total} title={colQ1?.name || ""} icon={Search} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {q2Data && q2Data.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className={SUBSECTION_TITLE + " mb-4"}>{t("survey.q2")}</h3>
            <HorizontalBarCard title={t("survey.difficulties")} data={q2Data.items} total={q2Data.total} icon={TrendingUp} />
          </motion.div>
        )}

        {q4Data && q4Data.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h3 className={SUBSECTION_TITLE + " mb-4"}>{t("survey.q4")}</h3>
            <PieChartCard title={t("survey.deliveryDuration")} data={q4Data.items} total={q4Data.total} icon={Clock} />
          </motion.div>
        )}

        {q5Data && q5Data.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className={SUBSECTION_TITLE + " mb-4"}>{t("survey.q5")}</h3>
            <PieChartCard title={t("survey.deliveryCost")} data={q5Data.items} total={q5Data.total} icon={DollarSign} />
          </motion.div>
        )}

        {q6Data && q6Data.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h3 className={SUBSECTION_TITLE + " mb-4"}>{t("survey.q6")}</h3>
            <PieChartCard title={t("survey.satisfaction")} data={q6Data.items} total={q6Data.total} icon={Star} />
          </motion.div>
        )}
      </div>

      {q7Data && q7Data.items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-xl">
          <h3 className={SECTION_TITLE + " mb-4"}>{t("survey.q7")}</h3>
          <SplitComparison
            beliCount={q7Data.items.find(i => i.name.toLowerCase().includes("bəli") || i.name.toLowerCase().includes("beli"))?.count || 0}
            xeyrCount={q7Data.items.find(i => i.name.toLowerCase().includes("xeyr"))?.count || 0}
            total={q7Data.total}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {q8Data && q8Data.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <h3 className={SUBSECTION_TITLE + " mb-4"}>{t("survey.q8")}</h3>
            <HorizontalBarCard title={t("survey.discoveryChannels")} data={q8Data.items} total={q8Data.total} icon={Search} />
          </motion.div>
        )}

        {q9Data && q9Data.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className={SUBSECTION_TITLE + " mb-4"}>{t("survey.q9")}</h3>
            <PieChartCard title={t("survey.frequency")} data={q9Data.items} total={q9Data.total} icon={BarChart3} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
