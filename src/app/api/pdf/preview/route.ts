import { NextRequest, NextResponse } from "next/server";
import { getPDFByName } from "@/lib/cv-store";

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("file");
  if (!fileName) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }
  const buffer = await getPDFByName(fileName);
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
