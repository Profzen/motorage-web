import { db } from "./db";
import { trajets } from "./db/schema";
import { sql, lt, and, eq } from "drizzle-orm";

/**
 * Marks trips whose date has passed as 'terminé'
 * This is a 'passive cron' helper.
 */
export async function autoClosePastTrips() {
  try {
    const now = new Date().toISOString();
    
    await db
      .update(trajets)
      .set({ statut: "terminé" })
      .where(
        and(
          eq(trajets.statut, "ouvert"),
          lt(trajets.dateHeure, now)
        )
      );
  } catch (error) {
    console.error("Passive cleanup failed:", error);
  }
}
