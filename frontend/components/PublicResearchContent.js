"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts";
import {
  Database, BarChart3, Download, Users, Target, Lightbulb, Star,
  TrendingUp, Eye, FileText, Calendar, MapPin, AlertCircle, Share2,
  ChevronDown, ChevronUp
} from "lucide-react";
import SurveyReport from "./SurveyReport";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const CHART_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#064e3b", "#047857"];

const INSIGHT_ICONS = {
  database: Database, "bar-chart": BarChart3, "trending-up": TrendingUp,
  "trending-down": TrendingUp, users: Users, "map-pin": MapPin,
  calendar: Calendar, target: Target, star: Star, lightbulb: Lightbulb
};
const INSIGHT_COLORS = {
  opportunity: "border-emerald-200 bg-emerald-50",
  observation: "border-blue-200 bg-blue-50",
  important: "border-amber-200 bg-amber-50",
  recommendation: "border-purple-200 bg-purple-50"
};

export default function PublicResearchContent({ datasets, settings, userCount }) {
  const { locale } = useLocale();
  const t = useTranslations();
  const [expandedDataset, setExpandedDataset] = useState(null);

  const isSurveyDataset = (dataset) => {
    if (!dataset?.columns) return false;
    const names = dataset.columns.map(c => c.name.toLowerCase());
    return names.some(n => n.includes("orqanik") || n.includes("fermer") || n.includes("kənd") || n.includes("çətinlik") || n.includes("məmnuniyyət"));
  };

  const detectChartType = (column) => {
    if (column.type === "numeric") return "bar";
    if (column.type === "date") return "line";
    return "pie";
  };

  const getChartData = (dataset) => {
    if (!dataset?.columns || !dataset?.rows) return [];
    return dataset.columns.map(col => {
      const values = dataset.rows.map(r => r[col.name]).filter(v => v !== undefined && v !== null);
      const chartType = detectChartType(col);

      if (col.type === "numeric") {
        const chartData = dataset.rows.map((r, i) => ({
          name: `#${i + 1}`,
          [col.name]: parseFloat(String(r[col.name] || "0").replace(/[,%$€£]/g, "")) || 0
        }));
        return { column: col.name, type: "numeric", chartType, data: chartData, dataKey: col.name };
      }
      if (col.type === "categorical") {
        const freq = {};
        values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        const chartData = Object.entries(freq).map(([name, value]) => ({ name, value }));
        return { column: col.name, type: "categorical", chartType, data: chartData, dataKey: "value" };
      }
      if (col.type === "date") {
        const chartData = dataset.rows.map((r, i) => ({
          name: `#${i + 1}`,
          [col.name]: new Date(r[col.name]).toLocaleDateString()
        }));
        return { column: col.name, type: "date", chartType: "line", data: chartData, dataKey: col.name };
      }
      return null;
    }).filter(Boolean);
  };

  const renderChart = (chartInfo) => {
    if (!chartInfo?.data?.length) return null;
    if (chartInfo.chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartInfo.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {chartInfo.data.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (chartInfo.chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartInfo.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey={chartInfo.dataKey} stroke="#059669" strokeWidth={2} dot={{ fill: "#059669" }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartInfo.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey={chartInfo.dataKey} fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col gap-16">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white text-center">
          <Database className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold font-numeric">{datasets.length}</p>
          <p className="text-[10px] text-green-300 font-semibold uppercase mt-1">{t("research.datasets")}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-emerald-950/5 text-center shadow-sm">
          <BarChart3 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold font-numeric text-emerald-950">{datasets.reduce((a, d) => a + (d.rows?.length || 0), 0)}</p>
          <p className="text-[10px] text-emerald-700 font-semibold uppercase mt-1">{t("research.totalRecords")}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-emerald-950/5 text-center shadow-sm">
          <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold font-numeric text-emerald-950">{settings?.farmers_featured || "12"}</p>
          <p className="text-[10px] text-emerald-700 font-semibold uppercase mt-1">{t("research.farmersEngaged")}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-emerald-950/5 text-center shadow-sm">
          <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold font-numeric text-emerald-950">{settings?.total_impact_points || "0"}</p>
          <p className="text-[10px] text-emerald-700 font-semibold uppercase mt-1">{t("research.impactPoints")}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-emerald-950/5 text-center shadow-sm">
          <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold font-numeric text-emerald-950">{userCount}</p>
          <p className="text-[10px] text-emerald-700 font-semibold uppercase mt-1">{t("research.registeredUsers")}</p>
        </div>
      </div>

      {/* Datasets */}
      {datasets.map((dataset, idx) => (
        <motion.div
          key={dataset.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white border border-emerald-950/5 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif text-emerald-950 font-bold">{dataset.name}</h2>
              <p className="text-sm text-emerald-950/50 mt-1">
                {dataset.rows?.length || 0} {t("research.records")} · {dataset.columns?.length || 0} {t("research.metrics")}
                {dataset.description && ` · ${dataset.description}`}
              </p>
            </div>
            <button
              onClick={() => {
                const csv = [dataset.columns.map(c => c.name).join(","), ...dataset.rows.map(r => dataset.columns.map(c => r[c.name] || "").join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `${dataset.name}.csv`; a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> {t("research.downloadCsv")}
            </button>
          </div>

          {isSurveyDataset(dataset) ? (
            <SurveyReport dataset={dataset} />
          ) : (
            <>
              {/* Insights */}
              {dataset.insights?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  {dataset.insights.slice(0, 6).map((insight, i) => {
                    const Icon = INSIGHT_ICONS[insight.icon] || AlertCircle;
                    const colorClass = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.observation;
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${colorClass}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">{insight.label}</p>
                            <p className="text-sm font-semibold text-emerald-950 mt-0.5">{insight.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {getChartData(dataset).filter(Boolean).slice(0, 4).map((chart, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-950/5">
                    <h4 className="text-sm font-semibold text-emerald-950 mb-3">{chart.column}</h4>
                    {renderChart(chart)}
                  </div>
                ))}
              </div>

              {/* Data Preview */}
              <div className="overflow-x-auto rounded-xl border border-emerald-950/10">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-emerald-50/50">
                      {dataset.columns?.map((col, i) => (
                        <th key={i} className="px-4 py-2.5 text-left font-semibold text-emerald-950/70">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.rows?.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-emerald-950/5">
                        {dataset.columns?.map((col, j) => (
                          <td key={j} className="px-4 py-2 text-emerald-950/60">{row[col.name] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}