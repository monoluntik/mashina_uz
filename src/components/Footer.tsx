import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Car, Phone, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Mashina<span className="text-blue-400">.uz</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t("tagline")}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+998 71 200 00 00</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <span>info@mashina.uz</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <a href="https://t.me/mashinauz" className="hover:text-white transition-colors">Telegram</a>
              </div>
            </div>
          </div>

          {/* Buyers */}
          <div>
            <h4 className="text-white font-semibold mb-3">{t("buyers")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/listings`} className="hover:text-white transition-colors">
                  {t("browse")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/favorites`} className="hover:text-white transition-colors">
                  {locale === "ru" ? "Избранное" : "Sevimlilar"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="text-white font-semibold mb-3">{t("sellers")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/sell`} className="hover:text-white transition-colors">
                  {t("postAd")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/inspection`} className="hover:text-white transition-colors">
                  {t("inspection")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3">
              {locale === "ru" ? "Компания" : "Kompaniya"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <span>© 2024 Mashina.uz. {t("rights")}.</span>
          <div className="flex gap-4">
            <Link href={`/${locale}/privacy`} className="hover:text-gray-300 transition-colors">
              {t("privacy")}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-gray-300 transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
