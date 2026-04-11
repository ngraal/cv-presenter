import { NextRequest, NextResponse } from "next/server";
import { getCVData, saveCVData } from "@/lib/cv-store";
import type { CVData } from "@/lib/types";

export async function GET() {
  const data = await getCVData();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as CVData;

  if (!body.personal || !body.experience || !body.education || !body.skills) {
    return NextResponse.json(
      { error: "Invalid CV data structure" },
      { status: 400 }
    );
  }

  await saveCVData(body);
  return NextResponse.json({ success: true });
}
