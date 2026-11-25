/** Stable IDs for offline / guest mode (no Better Auth session). */
export const LOCAL_GUEST_USER_ID = "clara_local_guest_user";
export const LOCAL_GUEST_APP_USER_ID = "clara_local_guest_app_user";
export const LOCAL_GUEST_FAMILY_ID = "clara_local_guest_family";
export const LOCAL_GUEST_EMAIL = "local@clara.bank";

export function isAuthRequired(): boolean {
  return process.env.CLARA_REQUIRE_AUTH === "true";
}
