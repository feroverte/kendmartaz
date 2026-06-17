import React from "react";
import { redirect } from "next/navigation";
import { checkAdminSession } from "@/app/actions/dbActions";
import AdminLoginForm from "@/components/AdminLoginForm";
import { ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";

export const revalidate = 0;

const ADMIN_PATH = process.env.ADMIN_PATH || "kendmart-admin";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("kendmart_locale")?.value || "en";
  const isAuthorized = await checkAdminSession();

  if (isAuthorized) {
    redirect(`/${ADMIN_PATH}/manage`);
  }

  const pageText = locale === "az" ? {
    title: "Admin İş Məkanı",
    desc: "Fermerləri, sorğuları, məqalə nəşrlərini və parametrləri idarə etmək üçün inzibati məlumatları daxil edin.",
  } : {
    title: "Admin Workspace",
    desc: "Enter administrative credentials to manage farmers, requests, article publications, and settings offsets.",
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-emerald-950/5 rounded-3xl p-8 shadow-sm">
        
        <div className="text-center flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif text-emerald-950 font-bold">{pageText.title}</h1>
          <p className="text-xs text-emerald-950/50 leading-relaxed font-light">
            {pageText.desc}
          </p>
        </div>

        {/* Client side login form */}
        <AdminLoginForm />

      </div>
    </div>
  );
}
