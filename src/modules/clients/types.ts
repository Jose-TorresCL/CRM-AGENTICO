import type { ClientStatus, ClientType } from "@/generated/prisma/enums";

export type ClientFilters = {
  search?: string;
  estado?: ClientStatus;
  tipoCliente?: ClientType;
  comuna?: string;
};

export type ClientFormState = {
  error?: string;
  message?: string;
};
