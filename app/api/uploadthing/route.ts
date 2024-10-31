// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});