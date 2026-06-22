"use client";
import React, { useState, useCallback } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { submitReview } from "@/app/actions/dbActions";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function StarRating({ value, onChange, size = "md", interactive = true }) {
  const sizeClass = size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${sizeClass} ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-emerald-900/20"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ initialData, locale, isLoggedIn }) {
  const t = useTranslations();
  const [reviews, setReviews] = useState(initialData?.reviews || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [page, setPage] = useState(initialData?.page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [loading, setLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  const loadReviews = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews?page=${p}&limit=6`, { cache: "no-store" });
      const data = await res.json();
      if (p === 1) {
        setReviews(data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(data.reviews || [])]);
      }
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const result = await submitReview(rating, text.trim());
      if (result.success) {
        setSubmitMsg("success");
        setRating(0);
        setText("");
        loadReviews(1);
      } else {
        setSubmitMsg("error");
      }
    } catch (e) {
      setSubmitMsg("error");
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <section className="max-w-3xl mx-auto px-6 py-20 border-t border-emerald-900/10" id="reviews">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full">
          {t("reviews.title")}
        </span>
        <h1 className="text-3xl md:text-4xl font-serif text-emerald-950 font-bold mt-6 mb-4">
          {t("reviews.title")}
        </h1>
        <p className="text-emerald-950/70 leading-relaxed font-light">
          {t("reviews.subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-950">{avgRating}</div>
          <StarRating value={Math.round(parseFloat(avgRating))} interactive={false} />
          <div className="text-xs text-emerald-950/50 mt-1">{t("reviews.averageRating")}</div>
        </div>
        <div className="w-px h-12 bg-emerald-900/10" />
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-950">{total}</div>
          <div className="text-xs text-emerald-950/50 mt-1">{t("reviews.totalReviews")}</div>
        </div>
      </div>

      {/* Submit Review */}
      <div className="bg-white rounded-2xl border border-emerald-950/5 shadow-sm p-6 mb-10">
        <h3 className="text-lg font-serif text-emerald-950 font-semibold mb-4">{t("reviews.writeReview")}</h3>
        {!isLoggedIn ? (
          <div className="text-center py-6">
            <p className="text-sm text-emerald-950/60 mb-3">{t("reviews.loginRequired")}</p>
            <Link href="/login" className="inline-block px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors">
              {t("reviews.signIn")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-950/60 mb-2">{t("reviews.yourRating")}</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-950/60 mb-2">{t("reviews.yourReview")}</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 400))}
                maxLength={400}
                rows={4}
                className="w-full p-3 bg-[#fcfbfa] border border-emerald-950/15 rounded-xl text-sm resize-none"
                placeholder={t("reviews.charLimit")}
              />
              <div className="text-right text-[10px] text-emerald-950/40 mt-1">{text.length}/400</div>
            </div>
            {submitMsg === "success" && (
              <p className="text-sm text-green-600">{t("reviews.submitted")}</p>
            )}
            {submitMsg === "error" && (
              <p className="text-sm text-red-500">{t("reviews.submitFailed")}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !rating || !text.trim()}
              className="self-start px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/40 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submitting ? t("reviews.loading") : t("reviews.submit")}
            </button>
          </form>
        )}
      </div>

      {/* Reviews List */}
      {loading && page === 1 ? (
        <p className="text-center text-emerald-950/40 py-8">{t("reviews.loading")}</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-emerald-950/40 py-8">{t("reviews.noReviews")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-emerald-950/5 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-800">
                    {r.userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">{r.userName}</p>
                    <p className="text-[10px] text-emerald-950/40">
                      {t("reviews.on")} {new Date(r.createdAt).toLocaleDateString(locale === "az" ? "az-AZ" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <StarRating value={r.rating} interactive={false} />
              </div>
              <p className="text-sm text-emerald-950/70 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {page < totalPages && (
        <div className="text-center mt-8">
          <button
            onClick={() => loadReviews(page + 1)}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? t("reviews.loading") : t("reviews.loadMore")}
          </button>
        </div>
      )}
    </section>
  );
}