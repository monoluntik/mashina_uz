import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/types";
import { User, Phone, Calendar, ShieldCheck } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
  if (!user) return { title: "Продавец" };
  return { title: `${user.name} — объявления продавца` };
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isRu = locale === "ru";

  const seller = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, name: true, phone: true, createdAt: true },
  });
  if (!seller) notFound();

  const rawListings = await prisma.listing.findMany({
    where: { userId: seller.id, status: "active", isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const listings: Listing[] = rawListings.map((l) => ({
    ...l,
    images: JSON.parse(l.images || "[]"),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const joinedDate = new Date(seller.createdAt).toLocaleDateString(
    isRu ? "ru-RU" : "uz-UZ",
    { month: "long", year: "numeric" }
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Seller card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{seller.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {isRu ? `На сайте с ${joinedDate}` : `Saytda ${joinedDate} dan`}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {isRu ? `${listings.length} объявл.` : `${listings.length} e'lon`}
                </span>
              </div>
            </div>
            {seller.phone && (
              <a
                href={`tel:${seller.phone}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {seller.phone}
              </a>
            )}
          </div>

          {/* Listings */}
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {isRu ? "Объявления продавца" : "Sotuvchi e'lonlari"}
            <span className="ml-2 text-base font-normal text-gray-400">({listings.length})</span>
          </h2>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {isRu ? "У этого продавца нет активных объявлений" : "Bu sotuvchining faol e'lonlari yo'q"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
