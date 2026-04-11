import type { CVData } from "@/lib/types";
import PersonalHeader from "./PersonalHeader";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import CertificationsSection from "./CertificationsSection";
import SkillsSection from "./SkillsSection";
import FloatingDownloadButton from "./FloatingDownloadButton";

export default function CVCard({
  data,
  hasPdf,
  hasImage,
}: {
  data: CVData;
  hasPdf: boolean;
  hasImage: boolean;
}) {
  return (
    <>
      <main className="min-h-screen font-body selection:bg-primary selection:text-on-primary section-gradient-1">
        <PersonalHeader data={data.personal} hasImage={hasImage} />
        <hr className="border-t border-outline-variant/20 max-w-5xl mx-auto" />
        <ExperienceSection items={data.experience} />
        <hr className="border-t border-outline-variant/20 max-w-5xl mx-auto" />
        <EducationSection items={data.education} />
        <hr className="border-t border-outline-variant/20 max-w-5xl mx-auto" />
        <CertificationsSection items={data.certifications} />
        <hr className="border-t border-outline-variant/20 max-w-5xl mx-auto" />
        <SkillsSection items={data.skills} />
      </main>

      {hasPdf && <FloatingDownloadButton />}
    </>
  );
}
