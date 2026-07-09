import React from "react";
import HomepageContent from "@/components/HomepageContent";
import { getFarmers, getSettings, getArticles, getPageContent } from "@/app/actions/dbActions";
import { getServerLocale } from "@/lib/serverLocale";

export const revalidate = 0;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function Home() {
  const locale = await getServerLocale();
  const farmers = await getFarmers();
  const settings = await getSettings();
  const articles = await getArticles();
  const homePage = await getPageContent("home_page");

  let userCount = 0;
  try {
    const res = await fetch(`${API}/api/users/count`, { cache: "no-store" });
    if (res.ok) { const j = await res.json(); userCount = j.count || 0; }
  } catch {}

  return (
    <div className="bg-[#fbfaf7]">
      <HomepageContent 
        initialFarmers={farmers} 
        initialSettings={settings} 
        initialArticles={articles}
        initialPageContent={homePage}
        locale={locale}
        userCount={userCount}
      />
    </div>
  );
}
