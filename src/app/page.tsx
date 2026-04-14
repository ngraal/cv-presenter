import { cookies } from "next/headers";
import type { Metadata } from "next";
import { verifyToken } from "@/lib/jwt";
import { getCVData, listPDFs, hasProfileImage } from "@/lib/cv-store";
import LandingPage from "@/components/auth/LandingPage";
import CVCard from "@/components/cv/CVCard";

export async function generateMetadata(): Promise<Metadata> {
  const cvData = await getCVData();
  if (!cvData) return { title: "CV Presenter — No Data" };
  return {
    title: `CV | ${cvData.personal.fullName}`,
  };
}

export default async function HomePage() {
  const cvData = await getCVData();
  const cookieStore = await cookies();
  const token = cookieStore.get("cv-presenter-token")?.value;

  if (!cvData) {
    return (
      <main className="min-h-screen flex items-center justify-center section-gradient-1 px-6">
        <div className="bg-surface-container rounded-2xl p-10 max-w-md text-center space-y-4">
          <span className="material-symbols-outlined text-error text-5xl">error</span>
          <h1 className="font-headline text-2xl font-bold text-on-surface">No CV Data Found</h1>
          <p className="text-on-surface-variant text-sm">
            Place a <code className="text-primary">cv.json</code> file in the data directory and restart the application.
          </p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <LandingPage
        fullName={cvData.personal.fullName}
        title={cvData.personal.title}
        email={cvData.personal.email}
      />
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return (
      <LandingPage
        fullName={cvData.personal.fullName}
        title={cvData.personal.title}
        email={cvData.personal.email}
      />
    );
  }

  const [pdfFiles, imageAvailable] = await Promise.all([
    listPDFs(),
    hasProfileImage(),
  ]);

  return (
    <CVCard data={cvData} pdfFiles={pdfFiles} hasImage={imageAvailable} />
  );
}
