import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { notificationEmitter } from "@/lib/notifications";

export const runtime = "edge";

/**
 * SSE Route for Real-time Notifications
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  const authPayload = await authenticateRequest(request, token);

  if (!authPayload) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = authPayload.userId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Ignore errors if stream is closed
        }
      };

      // Heartbeat
      const keepAlive = setInterval(() => {
        sendEvent({ type: "heartbeat" });
      }, 30000);

      // Listener for this specific user
      const listener = (notification: Record<string, unknown>) => {
        sendEvent({ type: "notification", data: notification });
      };

      notificationEmitter.on(`notification:${userId}`, listener);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        notificationEmitter.off(`notification:${userId}`, listener);
        controller.close();
      });

      sendEvent({ type: "connected", userId });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
