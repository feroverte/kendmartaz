import React from "react";
import Link from "next/link";
import { getArticles, getPageContent } from "@/app/actions/dbActions";
import { Calendar, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { getServerLocale, serverT, localizeText } from "@/lib/serverLocale";

export const revalidate = 0;

export default async function BlogListPage() {
  const locale = await getServerLocale();
  const articles = await getArticles();
  const extData = await getPageContent("external_articles");
  const externalArticles = (extData && Array.isArray(extData.articles)) ? extData.articles : [];

  const dateLocale = locale === "az" ? "az-AZ" : "en-US";

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-28">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-900/5 px-4 py-1.5 rounded-full flex items-center gap-1.5 justify-center w-max mx-auto">
          <BookOpen className="w-3.5 h-3.5" /> {serverT(locale, "blog.educationalHub")}
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 font-bold mt-4 mb-6">
          {serverT(locale, "blog.title")}
        </h1>
        <p className="text-emerald-950/70 font-light text-base leading-relaxed">
          {serverT(locale, "blog.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Internal Articles (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {articles.length === 0 ? (
            <div className="text-center py-16 text-emerald-950/40 font-light">{serverT(locale, "blog.noArticles")}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <div 
                  key={article.id} 
                  className="bg-white border border-emerald-950/5 rounded-3xl overflow-hidden shadow-sm hover-lift flex flex-col justify-between"
                >
                  <div className="h-52 w-full bg-emerald-900/10 relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 flex-grow flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-950/50 font-medium font-numeric">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(article.createdAt).toLocaleDateString(dateLocale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </div>
                    
                    <h3 className="text-xl font-serif text-emerald-950 font-bold hover:text-emerald-850 transition-colors">
                      <Link href={`/blog/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-emerald-950/75 leading-relaxed font-light">
                      {article.summary}
                    </p>
                  </div>

                  <div className="p-6 border-t border-emerald-950/5 bg-[#fcfbfa]/50">
                    <Link
                      href={`/blog/${article.id}`}
                      className="text-xs uppercase tracking-wider font-bold text-emerald-900 hover:text-emerald-700 flex items-center gap-1.5"
                    >
                      {serverT(locale, "blog.readFull")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: External Articles (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950/60 mb-4 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" /> {serverT(locale, "blog.externalResources")}
            </h3>
            {externalArticles.length === 0 ? (
              <p className="text-sm text-emerald-950/40 py-4">{serverT(locale, "blog.noExternal")}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {externalArticles.map((art) => (
                  <a
                    key={art.id}
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 rounded-2xl bg-white border border-emerald-950/5 hover:border-emerald-900/20 hover:shadow-sm transition-all"
                  >
                    {art.imageUrl && (
                      <img src={art.imageUrl} alt={localizeText(art.title, locale)} className="w-full h-28 object-cover rounded-xl mb-3 border" />
                    )}
                    <h4 className="text-base font-serif text-emerald-950 font-bold mb-1">{localizeText(art.title, locale)}</h4>
                    <p className="text-xs text-emerald-950/70 leading-relaxed line-clamp-3">{localizeText(art.description, locale)}</p>
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-2">
                      {serverT(locale, "blog.readMore")} <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
