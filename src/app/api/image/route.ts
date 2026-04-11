import { NextResponse } from "next/server";
import { getProfileImage, deleteProfileImage } from "@/lib/cv-store";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET() {
  const result = await getProfileImage();
  if (!result) {
    return NextResponse.json(
      { error: "No profile image available" },
      { status: 404 }
    );
  }

  const ext = result.filename.split(".").pop() || "jpg";
  const contentType = MIME_TYPES[ext] || "image/jpeg";

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function DELETE() {
  await deleteProfileImage();
  return NextResponse.json({ success: true });
}
