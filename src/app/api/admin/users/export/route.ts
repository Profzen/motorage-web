import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const admin = await authenticateAdmin(request, cookieToken);

    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const allUsers = await db.query.users.findMany({
      columns: {
        password: false,
        refreshToken: false,
      },
      orderBy: [desc(users.createdAt)],
    });

    let csv = "ID,Nom,Prenom,Email,Role,Statut,Telephone,Date Creation\n";

    allUsers.forEach((u) => {
      const row = [
        u.id,
        u.nom,
        u.prenom,
        u.email,
        u.role,
        u.statut,
        u.phone || "",
        u.createdAt,
      ].join(",");
      csv += row + "\n";
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=users-list-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("User Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
