import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Définition pour les images de véhicules
  vehiculeImage: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) throw new Error("Non autorisé : Token manquant");

      const user = await verifyJWT(token);
      if (!user) throw new Error("Non autorisé : Token invalide");

      // Ce qui est retourné ici sera accessible dans onUploadComplete en tant que `metadata`
      return { userId: user.sub || (user.id as string) };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "Upload de véhicule terminé pour l'utilisateur:",
        metadata.userId
      );
      console.log("URL du fichier:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Définition pour les photos de profil
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) throw new Error("Non autorisé : Token manquant");

      const user = await verifyJWT(token);
      if (!user) throw new Error("Non autorisé : Token invalide");

      return { userId: (user.sub || user.id) as string };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "Upload d'avatar terminé pour l'utilisateur:",
        metadata.userId
      );
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
