import { NextRequest, NextResponse } from "next/server";

import { verifyGithubWebhook } from "@/lib/github";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256");
  const payload = await request.text();
  const verified = await verifyGithubWebhook(signature, payload);

  return NextResponse.json({
    accepted: verified,
    message: verified ? "Webhook received by scaffold." : "Invalid webhook signature."
  }, { status: verified ? 202 : 401 });
}
