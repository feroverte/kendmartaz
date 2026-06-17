import React from "react";
import MarketContent from "@/components/MarketContent";
import { getListings } from "@/app/actions/dbActions";

export const revalidate = 0;

export default async function MarketPage() {
  const listings = await getListings();

  return (
    <div className="bg-[#fbfaf7] min-h-screen">
      <MarketContent initialListings={listings} />
    </div>
  );
}