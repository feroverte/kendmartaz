import React from "react";
import ListingDetailContent from "@/components/ListingDetailContent";
import { getListingById } from "@/app/actions/dbActions";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ListingDetailPage({ params }) {
  const resolvedParams = await params;
  const listing = await getListingById(resolvedParams.id);
  if (!listing) notFound();

  return (
    <div className="bg-[#fbfaf7] min-h-screen">
      <ListingDetailContent listing={listing} />
    </div>
  );
}