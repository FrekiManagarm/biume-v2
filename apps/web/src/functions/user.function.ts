import { db } from "@biume/db";
import { user as userSchema } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { ensureSession } from "#/functions/auth.function";

export const updateUserNotificationsSchema = z.object({
  emailNotifications: z.boolean(),
});

export const updateUserNotifications = createServerFn({ method: "POST" })
  .validator(updateUserNotificationsSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const [updatedUser] = await db
      .update(userSchema)
      .set({
        emailNotifications: data.emailNotifications,
        updatedAt: new Date(),
      })
      .where(eq(userSchema.id, session.user.id))
      .returning();

    if (!updatedUser) {
      throw new Error("Impossible de mettre à jour les notifications.");
    }

    return updatedUser;
  });
