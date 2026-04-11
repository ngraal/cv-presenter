import type { CVData } from "@/lib/types";
import PersonalHeader from "./PersonalHeader";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
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
      <main className="min-h-screen font-body selection:bg-primary selection:text-on-primary">
        <PersonalHeader data={data.personal} hasImage={hasImage} />
        <ExperienceSection items={data.experience} />
        <EducationSection items={data.education} />
        <SkillsSection items={data.skills} />
      </main>

      {hasPdf && <FloatingDownloadButton />}
    </>
  );
}
