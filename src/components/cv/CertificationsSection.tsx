import type { Certification } from "@/lib/types";

export default function CertificationsSection({
  items,
}: {
  items: Certification[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      id="certifications"
      className="py-20 px-8 md:px-12 lg:px-20"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
          <span className="text-secondary">03.</span> Weiterbildungen &amp;
          Zertifizierungen
        </h2>
        <div className="space-y-12">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative pl-10 border-l border-outline-variant/30"
            >
              <div
                className={`absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-surface-container-highest border-2 border-outline`}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2">
                <h3 className="text-xl font-headline font-bold text-white">
                  {item.name}
                </h3>
                {item.date && (
                  <span className="mt-2 sm:mt-0 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-medium">
                    {item.date}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-on-surface-variant text-sm max-w-2xl whitespace-pre-line">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
