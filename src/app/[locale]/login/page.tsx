import { redirect } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { getUserSession } from "@/lib/userAuth";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getUserSession();
  if (session) redirect(`/${locale}/profile`);

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Suspense>
            <LoginForm locale={locale} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
