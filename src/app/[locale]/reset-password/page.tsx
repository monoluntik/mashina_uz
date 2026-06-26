import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export async function generateMetadata() {
  return { title: "Новый пароль" };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <ResetPasswordForm locale={locale} token={token || ""} />
        </div>
      </main>
      <Footer />
    </>
  );
}
