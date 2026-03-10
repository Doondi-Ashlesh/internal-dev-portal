import { NextRequest, NextResponse } from "next/server";

import { searchWorkspace } from "@/lib/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json(await searchWorkspace(query));
}
