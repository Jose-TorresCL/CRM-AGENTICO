import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { getAuthenticatedUser } from "@/server/auth/session";
import { getUserRoles } from "@/modules/auth/services/get-user-roles";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }
  const roles = await getUserRoles(user.id);
  const canReadCommercial = roles.some((role) =>
    ["owner", "sales", "operations", "finance", "viewer"].includes(role),
  );
  const canReadActivities = roles.some((role) =>
    ["owner", "sales", "operations", "finance", "viewer"].includes(role),
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="font-semibold">CRM Operativo</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            {canReadCommercial ? (
              <nav aria-label="Navegación principal" className="flex flex-wrap gap-4 text-sm">
                <Link className="text-slate-700 hover:text-blue-700" href="/">Dashboard</Link>
                <Link className="text-slate-700 hover:text-blue-700" href="/clientes">Clientes</Link>
                <Link className="text-slate-700 hover:text-blue-700" href="/oportunidades">Oportunidades</Link>
                <Link className="text-slate-700 hover:text-blue-700" href="/pipeline">Pipeline</Link>
                {canReadActivities ? (
                  <Link className="text-slate-700 hover:text-blue-700" href="/actividades">Actividades</Link>
                ) : null}
              </nav>
            ) : null}
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
