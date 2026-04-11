import type { Education } from "@/lib/types";
import MarkdownText from "./MarkdownText";

export default function EducationSection({ items }: { items: Education[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="education"
      className="py-20 px-8 md:px-12 lg:px-20"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
          <span className="text-secondary">02.</span> Ausbildung
        </h2>
        <div className="space-y-12">
          {items.map((item, index) => {
            const isCurrent = !item.endDate;
            return (
              <div
                key={item.id}
                className="relative pl-10 border-l border-outline-variant/30"
              >
                <div
                  className={`absolute -left-2.25 top-1 w-4 h-4 rounded-full ${
                    isCurrent
                      ? "bg-tertiary ring-4 ring-tertiary/10"
                      : index === 0
                        ? "bg-primary ring-4 ring-primary/10"
                        : "bg-surface-container-highest border-2 border-outline"
                  }`}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-white">
                      {item.institution}
                    </h3>
                    <p className="text-base text-primary-dim font-medium">
                      {item.degree} {item.field}
                    </p>
                  </div>
                  <span
                    className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-tertiary/10 text-tertiary border border-tertiary/20"
                        : "bg-surface-container-high text-on-surface-variant font-medium"
                    }`}
                  >
                    {item.startDate} — {item.endDate || "Present"}
                  </span>
                </div>
                {item.description && (
                  <MarkdownText className="text-on-surface-variant text-sm max-w-2xl">
                    {item.description}
                  </MarkdownText>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
