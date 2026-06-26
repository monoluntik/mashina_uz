import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { UserProvider } from "@/components/UserProvider";
import CookieBanner from "@/components/CookieBanner";
import CompareBar from "@/components/CompareBar";
import Toaster from "@/components/Toaster";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Mashina.uz — Автомобильный рынок Узбекистана",
    template: "%s | Mashina.uz",
  },
  description: "Купить и продать автомобиль в Узбекистане. Тысячи объявлений от частных лиц и дилеров.",
  keywords: ["автомобили", "купить авто", "продать авто", "Узбекистан", "Ташкент", "машина"],
  openGraph: {
    siteName: "Mashina.uz",
    type: "website",
    locale: "ru_RU",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ru" | "uz")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.className}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <UserProvider>
            {children}
            <CompareBar />
            <CookieBanner />
            <Toaster />
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
