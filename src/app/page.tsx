import { cookies } from "next/headers";
import type { Metadata } from "next";
import { verifyToken } from "@/lib/jwt";
import { getCVData, hasPDF, hasProfileImage } from "@/lib/cv-store";
import TokenEntryForm from "@/components/auth/TokenEntryForm";
import CVCard from "@/components/cv/CVCard";

export async function generateMetadata(): Promise<Metadata> {
  const cvData = await getCVData();
  return {
    title: `CV | ${cvData.personal.fullName}`,
  };
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cv-presenter-token")?.value;

  if (!token) {
    return <TokenEntryForm />;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return <TokenEntryForm />;
  }

  const [cvData, pdfAvailable, imageAvailable] = await Promise.all([
    getCVData(),
    hasPDF(),
    hasProfileImage(),
  ]);

  return (
    <CVCard data={cvData} hasPdf={pdfAvailable} hasImage={imageAvailable} />
  );
}
