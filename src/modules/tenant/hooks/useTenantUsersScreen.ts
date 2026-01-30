import { useTenantUsersLogic } from "./useTenantUsersLogic";
// import type { AsyncStatus } from "@/shared/types/api";

export function useTenantUsersScreen() {
  const { status, vm, actions } = useTenantUsersLogic();

  return { status, vm, actions };
}
