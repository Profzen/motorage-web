import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (process.env.NODE_ENV !== "production") {
  if (!url) {
    console.warn(
      "[DB] TURSO_DATABASE_URL is not defined. Falling back to http://localhost:8080 (dev only)."
    );
  }
  // Warn when auth token is missing — writes/transactions will fail.
  if (!authToken) {
    console.warn(
      "[DB] TURSO_AUTH_TOKEN is not set. Read operations may work, but writes/transactions will fail."
    );
  }
}

const client = createClient({
  url: url || "http://localhost:8080",
  authToken: authToken,
});

if (process.env.NODE_ENV !== "production") {
  // Log effective endpoint (sanitized) to help diagnose 404s.
  const shownUrl = (url || "http://localhost:8080").replace(/([a-z]+):\/\//i, "$1://");
  const tokenInfo = authToken ? `present (len=${authToken.length})` : "absent";
  console.info(`[DB] libsql client initialized → url: ${shownUrl}, token: ${tokenInfo}`);
}

export const db = drizzle(client, { schema });
