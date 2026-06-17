"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "kendmart-admin";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts";
import SurveyReport from "./SurveyReport";
import {
  Upload, Database, BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown,
  FileText, Download, Trash2, Edit3, Eye, EyeOff, Plus, X, Check,
  AlertCircle, Lightbulb, Target, Users, Star, Calendar, MapPin, Settings,
  ArrowLeft, RefreshCw, Save, Columns, Table2
} from "lucide-react";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const INSIGHT_ICONS = {
  database: Database,
  "bar-chart": BarChart3,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  users: Users,
  "map-pin": MapPin,
  calendar: Calendar,
  target: Target,
  star: Star,
  lightbulb: Lightbulb
};

const INSIGHT_COLORS = {
  opportunity: { bg: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", label: "text-emerald-800" },
  observation: { bg: "bg-blue-50 border-blue-200", icon: "text-blue-600", label: "text-blue-800" },
  important: { bg: "bg-amber-50 border-amber-200", icon: "text-amber-600", label: "text-amber-800" },
  recommendation: { bg: "bg-purple-50 border-purple-200", icon: "text-purple-600", label: "text-purple-800" }
};

const CHART_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#064e3b", "#047857", "#65a30d"];

export default function AdminResearchContent({ initialDatasets }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [datasets, setDatasets] = useState(initialDatasets);
  const [activeView, setActiveView] = useState("overview"); // overview, view, create
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [surveyLink, setSurveyLink] = useState("");

  // Manual creator states
  const [manualName, setManualName] = useState("");
  const [manualCols, setManualCols] = useState([{ name: "", type: "categorical" }]);
  const [manualRows, setManualRows] = useState([{}]);
  const [showCreator, setShowCreator] = useState(false);
  const { locale } = useLocale();
  const t = useTranslations();

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0]);
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
  };

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith(".csv")) {
      showFeedback("error", t("adminResearch.onlyCsv"));
      return;
    }
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(".csv", ""));
      const { uploadCsv } = await import("@/app/actions/dbActions");
      const result = await uploadCsv(formData);
      setDatasets(prev => [result, ...prev]);
      showFeedback("success", t("adminResearch.uploadSuccess", { name: result.name }));
      setActiveView("overview");
    } catch (err) {
      showFeedback("error", err.message || t("adminResearch.uploadFailed"));
    }
    setUploading(false);
    setUploadProgress("");
  };

  const handleDeleteDataset = async (id) => {
    if (!confirm(t("adminResearch.confirmDelete"))) return;
    try {
      const { deleteDataset } = await import("@/app/actions/dbActions");
      await deleteDataset(id);
      setDatasets(prev => prev.filter(d => d.id !== id));
      if (selectedDataset?.id === id) { setSelectedDataset(null); setActiveView("overview"); }
      showFeedback("success", t("adminResearch.datasetDeleted"));
    } catch (err) {
      showFeedback("error", err.message);
    }
  };

  const handleTogglePublic = async (dataset) => {
    try {
      const { updateDataset } = await import("@/app/actions/dbActions");
      const updated = await updateDataset(dataset.id, { public: !dataset.public });
      setDatasets(prev => prev.map(d => d.id === dataset.id ? updated : d));
      if (selectedDataset?.id === dataset.id) setSelectedDataset(updated);
      showFeedback("success", updated.public ? t("adminResearch.datasetNowPublic") : t("adminResearch.datasetNowPrivate"));
    } catch (err) {
      showFeedback("error", err.message);
    }
  };

  const handleViewDataset = (dataset) => {
    setSelectedDataset(dataset);
    setActiveView("view");
  };

  const detectChartType = (column, data) => {
    if (column.type === "numeric") {
      if (column.name.toLowerCase().includes("year") || column.name.toLowerCase().includes("date")) return "line";
      return "bar";
    }
    if (column.type === "date") return "line";
    if (column.type === "categorical") return "pie";
    return "bar";
  };

  const isSurveyDataset = useCallback((dataset) => {
    if (!dataset?.columns) return false;
    const names = dataset.columns.map(c => c.name.toLowerCase());
    return names.some(n => n.includes("orqanik") || n.includes("fermer") || n.includes("kənd") || n.includes("çətinlik") || n.includes("məmnuniyyət"));
  }, []);

  const getChartData = (dataset) => {
    if (!dataset?.columns || !dataset?.rows) return [];
    return dataset.columns.map(col => {
      const values = dataset.rows.map(r => r[col.name]).filter(v => v !== undefined && v !== null);
      const chartType = detectChartType(col, values);

      if (col.type === "numeric") {
        const nums = values.map(v => parseFloat(String(v).replace(/[,%$€£]/g, "")));
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
        return { column: col.name, type: "date", chartType, data: chartData, dataKey: col.name };
      }

      return null;
    }).filter(Boolean);
  };

  const renderChart = (chartInfo, idx) => {
    if (!chartInfo || !chartInfo.data || chartInfo.data.length === 0) return null;

    switch (chartInfo.chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartInfo.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {chartInfo.data.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartInfo.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey={chartInfo.dataKey} stroke="#059669" strokeWidth={2} dot={{ fill: "#059669" }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartInfo.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey={chartInfo.dataKey} stroke="#059669" fill="#059669" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartInfo.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey={chartInfo.dataKey} fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const exportChartAsPNG = async (chartId, title) => {
    const el = document.getElementById(chartId);
    if (!el) return;
    try {
      const canvas = await import("html2canvas");
      const c = await canvas.default(el);
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = c.toDataURL();
      link.click();
    } catch {
      showFeedback("error", t("adminResearch.html2canvasMissing"));
    }
  };

  const addManualColumn = () => {
    setManualCols(prev => [...prev, { name: "", type: "categorical" }]);
    setManualRows(prev => prev.map(r => ({ ...r, [""]: "" })));
  };

  const removeManualColumn = (idx) => {
    const colName = manualCols[idx].name;
    setManualCols(prev => prev.filter((_, i) => i !== idx));
    setManualRows(prev => prev.map(r => {
      const { [colName]: _, ...rest } = r;
      return rest;
    }));
  };

  const updateManualCol = (idx, field, value) => {
    const oldName = manualCols[idx].name;
    setManualCols(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    if (field === "name") {
      setManualRows(prev => prev.map(r => {
        const newRow = { ...r };
        if (oldName && oldName in newRow) {
          newRow[value] = newRow[oldName];
          delete newRow[oldName];
        }
        return newRow;
      }));
    }
  };

  const addManualRow = () => {
    const row = {};
    manualCols.forEach(c => { row[c.name] = ""; });
    setManualRows(prev => [...prev, row]);
  };

  const updateManualRow = (rowIdx, colName, value) => {
    setManualRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [colName]: value } : r));
  };

  const removeManualRow = (idx) => {
    setManualRows(prev => prev.filter((_, i) => i !== idx));
  };

  const saveManualDataset = async () => {
    if (!manualName.trim()) { showFeedback("error", t("adminResearch.datasetNameRequired")); return; }
    const validCols = manualCols.filter(c => c.name.trim());
    if (validCols.length === 0) { showFeedback("error", t("adminResearch.minColumnsRequired")); return; }
    try {
      const { createDataset } = await import("@/app/actions/dbActions");
      const result = await createDataset({
        name: manualName,
        description: t("adminResearch.manualDatasetDesc"),
        columns: validCols,
        rows: manualRows,
        public: false,
        insights: []
      });
      setDatasets(prev => [result, ...prev]);
      showFeedback("success", t("adminResearch.datasetCreated", { name: result.name }));
      setShowCreator(false);
      setManualName("");
      setManualCols([{ name: "", type: "categorical" }]);
      setManualRows([{}]);
      setActiveView("overview");
    } catch (err) {
      showFeedback("error", err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950 font-bold">{t("adminResearch.title")}</h1>
          <p className="text-sm text-emerald-950/50 mt-1">{t("adminResearch.description")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${ADMIN_PATH}/manage`} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-emerald-900/10 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("adminResearch.backToAdmin")}
          </Link>
          <button onClick={() => { setShowCreator(true); setActiveView("create"); }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> {t("adminResearch.createDatasetBtn")}
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${feedback.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {feedback.message}
        </div>
      )}

      {activeView === "overview" && (
        <>
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mb-8 p-10 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer ${
              dragOver ? "border-emerald-500 bg-emerald-50" : "border-emerald-900/20 hover:border-emerald-900/40 bg-white"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-sm font-semibold text-emerald-900">{uploadProgress}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">{t("adminResearch.dropCsv")}</p>
                  <p className="text-xs text-emerald-950/50 mt-1">{t("adminResearch.csvSupport")}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Datasets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset, idx) => (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-emerald-950/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Database className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleTogglePublic(dataset)} className={`p-1.5 rounded-lg transition-colors ${dataset.public ? "text-emerald-600 bg-emerald-50" : "text-amber-950/30 hover:text-amber-950/50"}`}>
                      {dataset.public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDeleteDataset(dataset.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-emerald-950 text-sm mb-1">{dataset.name}</h3>
                <p className="text-[10px] text-emerald-950/50 mb-3">
                  {t("adminResearch.datasetSummary", { records: dataset.rows?.length || 0, columns: dataset.columns?.length || 0 })}
                </p>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {dataset.columns?.slice(0, 4).map((col, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">{col.name}</span>
                  ))}
                  {(dataset.columns?.length || 0) > 4 && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">+{dataset.columns.length - 4}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleViewDataset(dataset)} className="flex-1 px-3 py-2 bg-emerald-900/5 text-emerald-900 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-900/10 transition-colors">
                    <Eye className="w-3 h-3 inline mr-1" /> {t("adminResearch.view")}
                  </button>
                  <button onClick={() => exportChartAsPNG(`chart-${dataset.id}`, dataset.name)} className="px-3 py-2 bg-emerald-900/5 text-emerald-900 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-900/10 transition-colors">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
            {datasets.length === 0 && (
              <div className="col-span-full text-center py-16 text-emerald-950/40">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{t("adminResearch.noDatasets")}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* View Dataset */}
      {activeView === "view" && selectedDataset && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => { setActiveView("overview"); setSelectedDataset(null); }} className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("adminResearch.backToDatasets")}
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif text-emerald-950 font-bold">{selectedDataset.name}</h2>
              <p className="text-xs text-emerald-950/50">{t("adminResearch.datasetSummary", { records: selectedDataset.rows?.length || 0, columns: selectedDataset.columns?.length || 0 })} · {selectedDataset.public ? t("adminResearch.public") : t("adminResearch.private")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleTogglePublic(selectedDataset)} className={`px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors ${selectedDataset.public ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {selectedDataset.public ? t("adminResearch.makePrivate") : t("adminResearch.makePublic")}
              </button>
              <button onClick={() => {
                const csv = [selectedDataset.columns.map(c => c.name).join(","), ...selectedDataset.rows.map(r => selectedDataset.columns.map(c => r[c.name] || "").join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `${selectedDataset.name}.csv`; a.click();
                URL.revokeObjectURL(url);
              }} className="px-3 py-2 bg-white border border-emerald-900/10 rounded-xl text-[10px] font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors flex items-center gap-1 uppercase tracking-wider">
                <Download className="w-3 h-3" /> {t("adminResearch.csv")}
              </button>
            </div>
          </div>

          {isSurveyDataset(selectedDataset) ? (
            <SurveyReport dataset={selectedDataset} />
          ) : (
            <>
              {/* Insights Cards */}
              {selectedDataset.insights?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950/50 mb-4">{t("adminResearch.keyInsights")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedDataset.insights.map((insight, i) => {
                      const Icon = INSIGHT_ICONS[insight.icon] || AlertCircle;
                      const colors = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.observation;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-4 rounded-xl border ${colors.bg}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] font-bold uppercase tracking-wider ${colors.label}`}>{insight.label}</p>
                              <p className="text-sm font-semibold text-emerald-950 mt-0.5">{insight.value}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Charts */}
              {selectedDataset.columns?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950/50 mb-4">{t("adminResearch.visualizations")}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {getChartData(selectedDataset).filter(Boolean).map((chart, idx) => (
                      <div key={idx} id={`chart-${selectedDataset.id}-${idx}`} className="bg-white border border-emerald-950/5 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-emerald-950">{chart.column}</h4>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium uppercase">{chart.chartType}</span>
                            <button onClick={() => exportChartAsPNG(`chart-${selectedDataset.id}-${idx}`, `${selectedDataset.name}-${chart.column}`)} className="p-1.5 text-emerald-950/30 hover:text-emerald-700 transition-colors">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {renderChart(chart, idx)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white border border-emerald-950/5 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-emerald-950/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950/50">{t("adminResearch.dataTable")}</h3>
                  <span className="text-[10px] text-emerald-950/40">{t("adminResearch.rowCount", { count: selectedDataset.rows?.length || 0 })}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-emerald-50/50">
                        {selectedDataset.columns?.map((col, i) => (
                          <th key={i} className="px-4 py-2.5 text-left font-semibold text-emerald-950/70 whitespace-nowrap">
                            {col.name} <span className="text-[9px] text-emerald-950/40 font-normal">({col.type})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDataset.rows?.slice(0, 50).map((row, i) => (
                        <tr key={i} className="border-t border-emerald-950/5 hover:bg-emerald-50/30 transition-colors">
                          {selectedDataset.columns?.map((col, j) => (
                            <td key={j} className="px-4 py-2.5 text-emerald-950/70 whitespace-nowrap">{row[col.name] || "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(selectedDataset.rows?.length || 0) > 50 && (
                    <div className="px-5 py-3 text-center text-[10px] text-emerald-950/40 border-t border-emerald-950/5">
                      {t("adminResearch.showingRows", { shown: 50, total: selectedDataset.rows.length })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Manual Creator */}
      {activeView === "create" && showCreator && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-emerald-950/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("adminResearch.createDataset")}</h2>
            <button onClick={() => { setShowCreator(false); setActiveView("overview"); }} className="p-2 text-emerald-950/30 hover:text-emerald-950/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-emerald-950/60 block mb-1.5">{t("adminResearch.datasetName")}</label>
            <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder={t("adminResearch.datasetNamePlaceholder")} className="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-950/10 rounded-xl text-sm focus:outline-none focus:border-emerald-800 transition-colors" />
          </div>

          {/* Columns */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-emerald-950/60">{t("adminResearch.columns")}</label>
              <button onClick={addManualColumn} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-semibold hover:bg-emerald-100 transition-colors">
                <Plus className="w-3 h-3" /> {t("adminResearch.addColumn")}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {manualCols.map((col, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input value={col.name} onChange={e => updateManualCol(idx, "name", e.target.value)} placeholder={t("adminResearch.columnNamePlaceholder")} className="flex-1 px-3 py-2 bg-emerald-50/50 border border-emerald-950/10 rounded-lg text-xs focus:outline-none focus:border-emerald-800 transition-colors" />
                  <select value={col.type} onChange={e => updateManualCol(idx, "type", e.target.value)} className="px-3 py-2 bg-emerald-50/50 border border-emerald-950/10 rounded-lg text-xs focus:outline-none focus:border-emerald-800 transition-colors">
                    <option value="categorical">{t("adminResearch.textType")}</option>
                    <option value="numeric">{t("adminResearch.numberType")}</option>
                    <option value="date">{t("adminResearch.dateType")}</option>
                    <option value="boolean">{t("adminResearch.yesNoType")}</option>
                  </select>
                  {manualCols.length > 1 && (
                    <button onClick={() => removeManualColumn(idx)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-emerald-950/60">{t("adminResearch.rows", { count: manualRows.length })}</label>
              <button onClick={addManualRow} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-semibold hover:bg-emerald-100 transition-colors">
                <Plus className="w-3 h-3" /> {t("adminResearch.addRow")}
              </button>
            </div>
            <div className="overflow-x-auto border border-emerald-950/10 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-emerald-50/50">
                    {manualCols.filter(c => c.name.trim()).map((col, i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-emerald-950/60">{col.name || "?"}</th>
                    ))}
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {manualRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-emerald-950/5">
                      {manualCols.filter(c => c.name.trim()).map((col, j) => (
                        <td key={j} className="px-3 py-1.5">
                          <input value={row[col.name] || ""} onChange={e => updateManualRow(idx, col.name, e.target.value)} className="w-full px-2 py-1.5 bg-transparent text-xs focus:outline-none" placeholder="-" />
                        </td>
                      ))}
                      <td className="px-3 py-1.5">
                        {manualRows.length > 1 && (
                          <button onClick={() => removeManualRow(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={saveManualDataset} className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-emerald-800 transition-colors">
              <Save className="w-4 h-4" /> {t("adminResearch.saveDataset")}
            </button>
            <button onClick={() => { setShowCreator(false); setActiveView("overview"); }} className="px-5 py-2.5 bg-white border border-emerald-900/10 text-emerald-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-emerald-50 transition-colors">
              {t("adminResearch.cancel")}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}