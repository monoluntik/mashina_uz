import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminListingForm from "@/components/admin/AdminListingForm";

export default async function AdminNewListingPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Добавить объявление</h1>
          <p className="text-gray-500 mb-6">Объявление сразу публикуется как активное. Поставьте галочку «Проверено» чтобы добавить бейдж.</p>
          <AdminListingForm />
        </div>
      </main>
    </div>
  );
}
