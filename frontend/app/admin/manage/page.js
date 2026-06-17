import React from "react";
import { redirect } from "next/navigation";
import { 
  checkAdminSession, 
  getFarmers, 
  getRequests, 
  getSettings, 
  getArticles, 
  getImpactMaps,
  getPageContent,
  getListings 
} from "@/app/actions/dbActions";
import AdminDashboardContent from "@/components/AdminDashboardContent";

export const revalidate = 0; // Dynamic server page

const ADMIN_PATH = process.env.ADMIN_PATH || "kendmart-admin";

export default async function AdminManagePage() {
  const isAuthorized = await checkAdminSession();

  if (!isAuthorized) {
    redirect(`/${ADMIN_PATH}`);
  }

  // Prefetch data
  const farmers = await getFarmers();
  const requests = await getRequests();
  const settings = await getSettings();
  const articles = await getArticles();
  const impactMaps = await getImpactMaps();
  const listings = await getListings();
  
  // Page contents
  const missionPage = await getPageContent("mission_page");
  const whyLocalPage = await getPageContent("why_local_page");
  const researchPage = await getPageContent("research_page");
  const homePage = await getPageContent("home_page");
  const dashboardPage = await getPageContent("dashboard_page");

  return (
    <div className="bg-[#fbfaf7] min-h-screen">
      <AdminDashboardContent
        initialFarmers={farmers}
        initialRequests={requests}
        initialSettings={settings}
        initialArticles={articles}
        initialImpactMaps={impactMaps}
        initialListings={listings}
        initialMissionPage={missionPage}
        initialWhyLocalPage={whyLocalPage}
        initialResearchPage={researchPage}
        initialHomePage={homePage}
        initialDashboardPage={dashboardPage}
      />
    </div>
  );
}
