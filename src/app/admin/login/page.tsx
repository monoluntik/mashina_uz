import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-white mb-1">
            Mashina<span className="text-blue-400">.uz</span>
          </div>
          <p className="text-gray-400 text-sm">Панель администратора</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
