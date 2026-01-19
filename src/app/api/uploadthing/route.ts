import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Expose les routes pour Uploadthing
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
