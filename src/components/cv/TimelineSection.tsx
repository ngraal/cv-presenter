import type { CVSection } from "@/lib/types";
import { formatDate } from "@/lib/format-date";
import MarkdownText from "./MarkdownText";


export default function TimelineSection({
  section,
  index,
}: {
  section: CVSection;
  index: number;
}) {
  if (section.items.length === 0) return null;

  const num = String(index + 1).padStart(2, "0");

  return (
    <section className="py-20 px-8 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
          <span className="text-secondary">{num}.</span> {section.title}
        </h2>
        <div className="space-y-12">
          {section.items.map((item, itemIndex) => {
            const hasStart = !!item.startDate;
            const hasEnd = !!item.endDate;
            const isCurrent = hasStart && !hasEnd;

            return (
              <div
                key={itemIndex}
                className="relative pl-10 border-l border-outline-variant"
              >
                <div
                  className={`absolute -left-2.25 w-4 h-4 rounded-full ${
                    isCurrent
                      ? "bg-tertiary ring-4 ring-tertiary/10"
                      : itemIndex === 0 && hasStart
                        ? "bg-primary ring-4 ring-primary/10"
                        : "bg-surface-container-highest border-2 border-outline"
                  }`}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-white">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p
                        className={`${
                          isCurrent ? "text-primary" : "text-primary-fixed-dim"
                        } font-medium text-base`}
                      >
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  {(hasStart || hasEnd) && (
                    <span
                      className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-[10px] font-bold ${
                        isCurrent
                          ? "bg-tertiary/10 text-tertiary border border-tertiary/20"
                          : "bg-surface-container-high text-on-surface-variant font-medium"
                      }`}
                    >
                      {hasStart && formatDate(item.startDate!)}
                      {hasStart && hasEnd && ` — ${formatDate(item.endDate!)}`}
                      {!hasStart && hasEnd && formatDate(item.endDate!)}
                    </span>
                  )}
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
