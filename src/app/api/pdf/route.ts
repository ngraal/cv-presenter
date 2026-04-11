import { NextResponse } from "next/server";
import { getPDFBuffer, getCVData, deletePDF } from "@/lib/cv-store";

export async function GET() {
  const buffer = await getPDFBuffer();
  if (!buffer) {
    return NextResponse.json(
      { error: "No PDF available" },
      { status: 404 }
    );
  }
  const cvData = await getCVData();
  const safeName = cvData.personal.fullName
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const filename = `cv_${safeName}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function DELETE() {
  await deletePDF();
  return NextResponse.json({ success: true });
}
