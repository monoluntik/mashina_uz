import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";
import { getUserSession } from "@/lib/userAuth";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getUserSession();
  if (session) redirect(`/${locale}/profile`);

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <RegisterForm locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
