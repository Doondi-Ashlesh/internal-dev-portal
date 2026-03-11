import { NextRequest, NextResponse } from "next/server";

import { ingestGithubWebhook } from "@/lib/github";

export async function POST(request: NextRequest) {
  const deliveryId = request.headers.get("x-github-delivery") ?? "";
  const eventName = request.headers.get("x-github-event") ?? "";
  const signature = request.headers.get("x-hub-signature-256");

  if (!deliveryId || !eventName) {
    return NextResponse.json(
      {
        accepted: false,
        message: "Missing required GitHub webhook headers."
      },
      { status: 400 }
    );
  }

  const payload = await request.text();
  const result = await ingestGithubWebhook({
    deliveryId,
    eventName,
    signature,
    payload
  });

  return NextResponse.json(result.body, { status: result.status });
}