import { db } from "./db";
import { notifications } from "./db/schema";
import { EventEmitter } from "events";

// Global emitter for real-time updates within the same process
export const notificationEmitter = new EventEmitter();

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

    // Emit event to notify active SSE streams
    notificationEmitter.emit(`notification:${userId}`, newNotification);

    return newNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
