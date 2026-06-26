import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { isActive: true, status: "active" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const staticPages = ["", "/listings", "/sell", "/inspection", "/about", "/contact"].flatMap(
    (path) =>
      (["ru", "uz"] as const).map((locale) => ({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: path === "" ? 1.0 : 0.8,
      }))
  );

  const listingPages = listings.flatMap((l) =>
    (["ru", "uz"] as const).map((locale) => ({
      url: `${BASE}/${locale}/listings/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [...staticPages, ...listingPages];
}
