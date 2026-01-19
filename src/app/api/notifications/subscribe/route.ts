import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return ApiErrors.badRequest("Invalid subscription object");
    }

    // Check if subscription already exists for this endpoint
    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, subscription.endpoint),
    });

    if (existing) {
        // Update user association if necessary
        await db.update(pushSubscriptions)
            .set({ userId: authPayload.userId })
            .where(eq(pushSubscriptions.id, existing.id));
    } else {
        await db.insert(pushSubscriptions).values({
            userId: authPayload.userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
        });
    }

    return successResponse({ message: "Subscribed successfully" }, undefined, 201);
  } catch (error) {
    console.error("Subscription error:", error);
    return ApiErrors.serverError();
  }
}
