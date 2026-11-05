import { logoutAction } from "@/modules/auth/actions";
import { Button } from "@/shared/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button size="sm" variant="outline" type="submit">
        Cerrar sesión
      </Button>
    </form>
  );
}
