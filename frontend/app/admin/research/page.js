import React from "react";
import { redirect } from "next/navigation";
import { checkAdminSession, getDatasets } from "@/app/actions/dbActions";
import AdminResearchContent from "@/components/AdminResearchContent";

export const revalidate = 0;

const ADMIN_PATH = process.env.ADMIN_PATH || "kendmart-admin";

export default async function AdminResearchPage() {
  const isAuthorized = await checkAdminSession();
  if (!isAuthorized) redirect(`/${ADMIN_PATH}`);

  const datasets = await getDatasets();
  return (
    <div className="bg-[#fbfaf7] min-h-screen">
      <AdminResearchContent initialDatasets={Array.isArray(datasets) ? datasets : []} />
    </div>
  );
}