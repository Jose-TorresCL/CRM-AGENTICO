import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { getUserRoles } from "@/modules/auth/services/get-user-roles";
import { clientReadRoles, hasAnyRole } from "@/server/auth/authorization";
import { getAuthenticatedUser } from "@/server/auth/session";

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
  const canReadCrm = hasAnyRole(roles, clientReadRoles);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <Link className="font-semibold" href="/">CRM Operativo</Link>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            {canReadCrm ? (
              <nav aria-label="Navegación principal" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link className="text-blue-700 underline" href="/">Resumen</Link>
                <Link className="text-blue-700 underline" href="/clientes">Clientes</Link>
                <Link className="text-blue-700 underline" href="/oportunidades">Oportunidades</Link>
                <Link className="text-blue-700 underline" href="/cotizaciones">Cotizaciones</Link>
                <Link className="text-blue-700 underline" href="/obras">Obras iniciales</Link>
                <Link className="text-blue-700 underline" href="/pipeline">Pipeline</Link>
                <Link className="text-blue-700 underline" href="/actividades">Actividades</Link>
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
