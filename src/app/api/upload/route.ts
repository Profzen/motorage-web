import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { ApiErrors, successResponse } from "@/lib/api-response";

/**
 * @openapi
 * /upload:
 *   post:
 *     tags:
 *       - Media
 *     summary: Uploader une image (Local)
 *     description: Enregistre une image localement sur le serveur.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fichier uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Aucun fichier fourni
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return ApiErrors.badRequest("Aucun fichier fourni");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Path: public/uploads/year/month/file-name
    const date = new Date();
    const relativePath = `uploads/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    const uploadDir = join(process.cwd(), "public", relativePath);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = join(uploadDir, fileName);
    const fileUrl = `/${relativePath}/${fileName}`;

    await writeFile(filePath, buffer);

    return successResponse({
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return ApiErrors.serverError("Erreur lors de l'upload du fichier");
  }
}
