import React from "react";
import ProfileContent from "@/components/ProfileContent";
import { checkUserSession, getSavedListings } from "@/app/actions/dbActions";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await checkUserSession();
  if (!user) redirect("/login");

  const savedListingsData = await getSavedListings();

  return (
    <div className="bg-[#fbfaf7] min-h-screen">
      <ProfileContent user={user} initialSavedListings={savedListingsData} />
    </div>
  );
}