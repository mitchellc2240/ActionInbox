import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const auth = getAuth();
  if (!auth) return Response.json({ error: "Accounts are unavailable." }, { status: 503 });

  return request.method === "POST"
    ? auth.handler().POST(request, context)
    : auth.handler().GET(request, context);
}

export { handle as GET, handle as POST };
