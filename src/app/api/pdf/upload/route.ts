import { NextRequest, NextResponse } from "next/server";
import { savePDF } from "@/lib/cv-store";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("pdf") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No PDF file provided" },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "File must be a PDF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be less than 10MB" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  await savePDF(Buffer.from(arrayBuffer));

  return NextResponse.json({ success: true });
}
