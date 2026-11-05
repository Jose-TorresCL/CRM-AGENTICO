"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/shared/components/ui/button";

export function SubmitButton({
  children,
  pendingText = "Guardando...",
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={pending || props.disabled} type="submit">
      {pending ? pendingText : children}
    </Button>
  );
}
