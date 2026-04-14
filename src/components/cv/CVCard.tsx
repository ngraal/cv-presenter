import type { CVData } from "@/lib/types";
import PersonalHeader from "./PersonalHeader";
import TimelineSection from "./TimelineSection";
import SkillsSection from "./SkillsSection";
import FloatingDownloadButton from "./FloatingDownloadButton";

export default function CVCard({
  data,
  pdfFiles,
  hasImage,
}: {
  data: CVData;
  pdfFiles: string[];
  hasImage: boolean;
}) {
  return (
    <>
      <main className="min-h-screen font-body selection:bg-primary selection:text-on-primary section-gradient-1">
        <PersonalHeader data={data.personal} hasImage={hasImage} />
        {data.sections.map((section, i) => (
          <div key={i}>
            <hr className="border-t border-outline-variant/50 max-w-5xl mx-auto" />
            <TimelineSection section={section} index={i} />
          </div>
        ))}
        {data.skillSections.map((section, i) => (
          <div key={`skills-${i}`}>
            <hr className="border-t border-outline-variant/50 max-w-5xl mx-auto" />
            <SkillsSection section={section} index={data.sections.length + i} />
          </div>
        ))}
      </main>

      {pdfFiles.length > 0 && <FloatingDownloadButton pdfFiles={pdfFiles} />}
    </>
  );
}
