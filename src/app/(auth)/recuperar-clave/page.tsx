import { PasswordRecoveryForm } from "@/modules/auth/components/password-recovery-form";

type RecoveryPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function RecoveryPage({ searchParams }: RecoveryPageProps) {
  const { mode } = await searchParams;

  return (
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-500">CRM Operativo</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {mode === "update" ? "Crear nueva contraseña" : "Recuperar contraseña"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "update"
            ? "Elige una nueva contraseña para tu cuenta."
            : "Te enviaremos un enlace para restablecer tu contraseña."}
        </p>
      </div>
      <PasswordRecoveryForm isUpdating={mode === "update"} />
    </section>
  );
}
