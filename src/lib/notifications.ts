import { db } from "./db";
import { notifications, pushSubscriptions } from "./db/schema";
import { notificationEvents } from "./events";
import { eq } from "drizzle-orm";
import webpush from "web-push";

// Configuration Web Push (Mobile)
let isWebPushConfigured = false;
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@miyi-dekae.tg",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    isWebPushConfigured = true;
  } catch (error) {
    console.error("Failed to set VAPID details:", error);
  }
}

// Global emitter for real-time updates within the same process
export const notificationEmitter = notificationEvents;

export type NotificationType =
  | "onboarding"
  | "reservation"
  | "system"
  | "trajet";

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown> | unknown[];
}

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
    // We don't await this to avoid blocking the main flow
    triggerPushNotification(userId, {
      title,
      body: message,
      type,
      data,
    }).catch((err) => console.error("Web Push background error:", err));

    return newNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

async function triggerPushNotification(
  userId: string,
  payload: NotificationPayload
) {
  if (!isWebPushConfigured) {
    console.warn("Web Push not configured, skipping push notification");
    return;
  }

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
          .catch(async (err) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Expired subscription - cleanup
              console.log(`Cleaning up expired subscription for user ${userId}`);
              await db
                .delete(pushSubscriptions)
                .where(eq(pushSubscriptions.endpoint, sub.endpoint))
                .execute();
            } else {
              console.error("Push delivery error:", err);
            }
          })
      )
    );
  } catch (error) {
    console.error("Failed to trigger push sequence:", error);
  }
}
