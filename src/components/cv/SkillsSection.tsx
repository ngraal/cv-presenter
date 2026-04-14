import type { SkillSection } from "@/lib/types";

const ICON_COLORS = ["text-primary", "text-secondary", "text-tertiary", "text-primary-fixed-dim"];

export default function SkillsSection({
  section,
  index,
}: {
  section: SkillSection;
  index: number;
}) {
  if (section.skills.length === 0) return null;

  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      className="py-20 px-8 md:px-12 lg:px-20"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
          <span className="text-secondary">{num}.</span> {section.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {section.skills.map((skill, skillIndex) => {
            const iconColor = ICON_COLORS[skillIndex % ICON_COLORS.length];
            return (
              <div
                key={skillIndex}
                className="bg-surface-container-low p-6 rounded-xl border-t border-outline-variant/10"
              >
                <h3 className="flex items-center gap-2 text-white font-headline font-bold text-lg mb-3">
                  {skill.icon && (
                    <span
                      className={`material-symbols-outlined ${iconColor} text-2xl`}
                    >
                      {skill.icon}
                    </span>
                  )}
                  {skill.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 bg-surface-container-highest text-on-surface rounded text-xs border-l-2 border-tertiary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
