import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { ac, admin, member, owner } from "@biume/auth/roles";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac: ac,
      roles: {
        member,
        admin,
        owner,
      },
    }),
    inferAdditionalFields({
      organization: {
        onBoardingComplete: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
        description: {
          type: "string",
          defaultValue: "",
          required: false,
        },
        ai: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
        email: {
          type: "string",
          defaultValue: "",
          required: false,
        },
        locked: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
        lang: {
          type: "string",
          defaultValue: "fr",
          required: false,
        },
        onBoardingExplications: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
      },
      user: {
        image: {
          type: "string",
          defaultValue: "",
          required: false,
        },
        lang: {
          type: "string",
          defaultValue: "fr",
          required: false,
        },
        phoneNumber: {
          type: "string",
          defaultValue: "",
          required: false,
        },
        smsNotifications: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
        emailNotifications: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
      },
    }),
  ],
});

export const {
  useSession,
  signIn,
  signOut,
  resetPassword,
  requestPasswordReset,
  organization,
  useListOrganizations,
  useActiveOrganization,
  changePassword,
  linkSocial,
  sendVerificationEmail,
  getSession,
  verifyEmail,
  changeEmail,
  deleteUser,
  updateSession,
  updateUser,
} = authClient;
