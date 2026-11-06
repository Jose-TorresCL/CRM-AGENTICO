import "server-only";
import { AppError } from "@/server/errors/app-error";
import { getWorkById, listWorks } from "../repositories/work-repository";

export async function searchWorks() {
  return listWorks();
}

export async function findWork(id: string) {
  const work = await getWorkById(id);

  if (!work) {
    throw new AppError("No se encontró la obra.", 404);
  }

  return work;
}
