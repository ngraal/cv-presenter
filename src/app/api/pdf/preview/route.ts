import { NextResponse } from "next/server";
import { getPDFBuffer } from "@/lib/cv-store";

export async function GET() {
  const buffer = await getPDFBuffer();
  if (!buffer) {
    return NextResponse.json(
      { error: "No PDF available" },
      { status: 404 }
    );
  }
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
