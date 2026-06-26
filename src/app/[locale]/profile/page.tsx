import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <ProfileClient locale={locale} initialTab={tab || "listings"} />
        </div>
      </main>
      <Footer />
    </>
  );
}
