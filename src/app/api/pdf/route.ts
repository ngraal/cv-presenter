import { NextRequest, NextResponse } from "next/server";
import { getPDFByName, deletePDFByName, listPDFs } from "@/lib/cv-store";

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("file");

  if (!fileName) {
    const files = await listPDFs();
    return NextResponse.json(files);
  }

  const buffer = await getPDFByName(fileName);
  if (!buffer) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }
  const filename = `${fileName}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("file");
  if (!fileName) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }
  await deletePDFByName(fileName);
  return NextResponse.json({ success: true });
}
