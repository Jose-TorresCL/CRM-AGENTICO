import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
  return (
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-500">CRM Operativo</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa con el correo y la contraseña de tu cuenta.
        </p>
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-sm">
        <Link
          className="font-medium text-blue-700 underline-offset-4 hover:underline"
          href="/recuperar-clave"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </section>
  );
}
