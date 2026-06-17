import React from "react";
import HomepageContent from "@/components/HomepageContent";
import { getFarmers, getSettings, getArticles, getPageContent } from "@/app/actions/dbActions";
import { getServerLocale } from "@/lib/serverLocale";

export const revalidate = 0;

export default async function Home() {
  const locale = await getServerLocale();
  const farmers = await getFarmers();
  const settings = await getSettings();
  const articles = await getArticles();
  const homePage = await getPageContent("home_page");

  return (
    <div className="bg-[#fbfaf7]">
      <HomepageContent 
        initialFarmers={farmers} 
        initialSettings={settings} 
        initialArticles={articles}
        initialPageContent={homePage}
        locale={locale}
      />
    </div>
  );
}
