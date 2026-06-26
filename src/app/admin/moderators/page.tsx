import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ModeratorsClient from "@/components/admin/ModeratorsClient";

export default async function AdminModeratorsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin/dashboard");

  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Администраторы и модераторы</h1>
          <ModeratorsClient
            users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
            currentId={session.id}
          />
        </div>
      </main>
    </div>
  );
}
