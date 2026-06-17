import React from "react";
import Link from "next/link";
import { getArticleById } from "@/app/actions/dbActions";
import { Calendar, ArrowLeft, BookOpen, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getServerLocale, serverT, localizeText } from "@/lib/serverLocale";

export const revalidate = 0;

export default async function ArticleDetailPage({ params }) {
  const locale = await getServerLocale();
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const dateLocale = locale === "az" ? "az-AZ" : "en-US";
  const wordCount = article.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const readingTime = Math.max(Math.round(wordCount / 200), 1);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-950/60 hover:text-emerald-950 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {serverT(locale, "blog.backToArticles")}
      </Link>

      <div className="flex flex-col gap-6 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-900/5 px-4.5 py-1.5 rounded-full w-max flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> {serverT(locale, "blog.environmentalInsight")}
        </span>
        <h1 className="text-3xl md:text-5xl font-serif text-emerald-950 font-bold leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-emerald-950/60 border-y border-emerald-950/10 py-4 font-numeric font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(article.createdAt).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readingTime} {serverT(locale, "blog.minRead")}
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full bg-emerald-900/10 rounded-3xl overflow-hidden mb-12 shadow-sm">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <article className="prose prose-emerald max-w-none prose-p:text-emerald-950/80 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base md:prose-p:text-lg prose-p:font-light prose-h2:font-serif prose-h2:text-emerald-950 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      <div className="mt-16 p-8 rounded-3xl bg-[#f3f1eb] border border-emerald-950/5 text-center flex flex-col items-center gap-4">
        <span className="text-2xl">🌱</span>
        <h3 className="text-xl font-serif text-emerald-950 font-bold">{serverT(locale, "blog.helpFarmersTitle")}</h3>
        <p className="text-sm text-emerald-950/70 max-w-md leading-relaxed font-light">
          {serverT(locale, "blog.helpFarmersDesc")}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors mt-2"
        >
          {serverT(locale, "blog.viewLocalFarmers")}
        </Link>
      </div>

    </div>
  );
}
