import { NextRequest, NextResponse } from "next/server";

import { searchWorkspace } from "@/lib/search";
import { WorkspaceDataUnavailableError } from "@/server/workspace";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    return NextResponse.json(await searchWorkspace(query));
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return NextResponse.json(
        {
          error: "workspace_data_unavailable"
        },
        { status: 503 }
      );
    }

    throw error;
  }
}
