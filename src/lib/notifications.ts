import { db } from "./db";
import { notifications, pushSubscriptions } from "./db/schema";
import { notificationEvents } from "./events";
import { eq } from "drizzle-orm";
import webpush from "web-push";

// Configuration Web Push (Mobile)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:alex@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Global emitter for real-time updates within the same process
export const notificationEmitter = notificationEvents;

export type NotificationType =
  | "onboarding"
  | "reservation"
  | "system"
  | "trajet";

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | unknown[];
}) {
  try {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      })
      .returning();

    // 1. Emit event to notify active SSE streams (Foreground / Web)
    notificationEmitter.emit(`notification:${userId}`, newNotification);

    // 2. Trigger Web Push (Background / Mobile)
    await triggerPushNotification(userId, {
      title,
      body: message,
      type,
      data,
    });

    return newNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

async function triggerPushNotification(userId: string, payload: any) {
  try {
    const userSubscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    });

    if (userSubscriptions.length === 0) return;

    const pushPayload = JSON.stringify(payload);

    await Promise.all(
      userSubscriptions.map((sub) =>
        webpush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            pushPayload
          )
          .catch((err) => {
            if (err.statusCode === 410) {
              // Expired subscription - cleanup
              db.delete(pushSubscriptions)
                .where(eq(pushSubscriptions.endpoint, sub.endpoint))
                .execute();
            }
            console.error("Push error:", err);
          })
      )
    );
  } catch (error) {
    console.error("Failed to trigger push:", error);
  }
}
