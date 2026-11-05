import "server-only";
import { listAssignableUsers } from "./list-assignable-users";

export async function getAssignableUserOptions() {
  const users = await listAssignableUsers();

  return users.map(({ id, roles }) => ({
    id,
    label: `${id.slice(0, 8)}…${roles.length ? ` (${roles.map(({ role }) => role).join(", ")})` : ""}`,
  }));
}
