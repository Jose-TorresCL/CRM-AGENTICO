"use client";

import { Button, type ButtonProps } from "@/shared/components/ui/button";

export function ConfirmSubmitButton({
  confirmation,
  onClick,
  ...props
}: ButtonProps & { confirmation: string }) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !window.confirm(confirmation)) {
          event.preventDefault();
        }
      }}
      type="submit"
    />
  );
}
