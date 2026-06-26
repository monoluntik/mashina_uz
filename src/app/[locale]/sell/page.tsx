import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SellForm from "@/components/SellForm";

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("sell");

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-blue-600 text-white py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-blue-100">{t("subtitle")}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <SellForm locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
