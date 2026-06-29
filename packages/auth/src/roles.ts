import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  organization: ["owner", "admin", "member"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  organization: ["member"],
});

export const admin = ac.newRole({
  organization: ["admin"],
});

export const owner = ac.newRole({
  organization: ["owner"],
});
