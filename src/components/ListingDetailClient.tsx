"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useUser } from "@/components/UserProvider";
import LoanCalculator from "@/components/LoanCalculator";

interface Props {
  listingId: number;
  price: number;
  locale: string;
}

export default function ListingDetailClient({ listingId, price, locale }: Props) {
  const { push } = useRecentlyViewed();
  const { user } = useUser();

  useEffect(() => {
    push(listingId);
    // Also sync to DB if logged in
    if (user) {
      fetch("/api/user/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      }).catch(() => {});
    }
  }, [listingId, user?.id]);

  return <LoanCalculator carPrice={price} locale={locale} />;
}
