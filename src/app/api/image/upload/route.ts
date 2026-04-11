import { NextRequest, NextResponse } from "next/server";
import { saveProfileImage } from "@/lib/cv-store";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No image file provided" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File must be JPEG, PNG, or WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be less than 5MB" },
      { status: 400 }
    );
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const arrayBuffer = await file.arrayBuffer();
  await saveProfileImage(Buffer.from(arrayBuffer), ext);

  return NextResponse.json({ success: true });
}
