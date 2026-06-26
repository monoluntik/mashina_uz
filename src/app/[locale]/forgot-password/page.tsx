import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export async function generateMetadata() {
  return { title: "Сброс пароля" };
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <ForgotPasswordForm locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
