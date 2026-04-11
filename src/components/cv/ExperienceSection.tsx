import type { Experience } from "@/lib/types";

export default function ExperienceSection({ items }: { items: Experience[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="experience"
      className="py-20 px-8 md:px-12 lg:px-20 section-gradient-2"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
          <span className="text-secondary">01.</span> Berufserfahrung
        </h2>
        <div className="space-y-6">
          {items.map((item, index) => {
            const isCurrent = !item.endDate;
            return (
              <div
                key={item.id}
                className={`glass-card p-6 md:p-8 rounded-xl ${isCurrent ? "border-l-4 border-tertiary" : ""}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div>
                    <h3
                      className={`${index === 0 ? "text-2xl" : "text-xl"} font-headline font-bold text-white`}
                    >
                      {item.company}
                    </h3>
                    <p
                      className={`${isCurrent ? "text-primary" : "text-primary-fixed-dim"} font-medium text-base`}
                    >
                      {item.position}
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
                  <p className="text-on-surface-variant text-base leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
