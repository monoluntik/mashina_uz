import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesClient from "@/components/FavoritesClient";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FavoritesClient locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
