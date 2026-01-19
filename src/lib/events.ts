import { EventEmitter } from "events";

// Single instance of EventEmitter for the whole app
// Note: In serverless environments (Vercel), this only works within the same instance.
// For production scale, replace with Redis Pub/Sub.
declare global {
  var notificationEvents: EventEmitter | undefined;
}

export const notificationEvents = global.notificationEvents || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  global.notificationEvents = notificationEvents;
}

export const NOTIFICATION_EVENT = "new_notification";

export function emitNotification(userId: string, data: any) {
  notificationEvents.emit(NOTIFICATION_EVENT, { userId, data });
}
