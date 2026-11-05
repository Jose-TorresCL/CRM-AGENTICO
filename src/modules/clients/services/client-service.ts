import "server-only";
import {
  getClientById,
  listClients,
  createClient,
  updateClient,
  getClientCommunes,
} from "../repositories/client-repository";
import type { ClientFilters } from "../types";
import type { ClientInput } from "../schemas/client-schemas";
import { AppError } from "@/server/errors/app-error";

export async function searchClients(filters: ClientFilters) {
  return listClients(filters);
}

export async function findClient(id: string) {
  const client = await getClientById(id);

  if (!client) {
    throw new AppError("No se encontró el cliente.", 404);
  }

  return client;
}

export async function saveClient(input: ClientInput) {
  return createClient(input);
}

export async function editClient(id: string, input: ClientInput) {
  const existing = await getClientById(id);

  if (!existing) {
    throw new AppError("No se encontró el cliente.", 404);
  }

  return updateClient(id, input);
}

export async function listClientCommunes() {
  return getClientCommunes();
}
