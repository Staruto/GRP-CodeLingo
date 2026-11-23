import type { CurrentUser } from "../lib/practice";

export const devProfile = {
  id: 1,
  username: "alex",
  displayName: "Alex",
  timeZone: "Asia/Shanghai",
  role: "user",
} satisfies CurrentUser;
