import type { Skill } from "@/lib/types";

const CATEGORY_STYLES: Record<
  string,
  { icon: string; iconColor: string }
> = {
  languages: { icon: "terminal", iconColor: "text-primary" },
  frontend: { icon: "layers", iconColor: "text-secondary" },
  backend: { icon: "database", iconColor: "text-tertiary" },
  tools: { icon: "settings_suggest", iconColor: "text-primary-fixed-dim" },
};

const FALLBACK_STYLES = [
  { icon: "terminal", iconColor: "text-primary" },
  { icon: "layers", iconColor: "text-secondary" },
  { icon: "database", iconColor: "text-tertiary" },
  { icon: "settings_suggest", iconColor: "text-primary-fixed-dim" },
];

function getCategoryStyle(category: string, index: number) {
  const key = category.toLowerCase();
  for (const [k, style] of Object.entries(CATEGORY_STYLES)) {
    if (key.includes(k)) return style;
  }
  return FALLBACK_STYLES[index % FALLBACK_STYLES.length];
}

export default function SkillsSection({ items }: { items: Skill[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="skills"
      className="py-20 px-8 md:px-12 lg:px-20"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center gap-3">
          <span className="text-secondary">04.</span> Technische Fähigkeiten
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((skill, index) => {
            const style = getCategoryStyle(skill.category, index);
            return (
              <div
                key={skill.id}
                className="bg-surface-container-low p-6 rounded-xl border-t border-outline-variant/10"
              >
                <span
                  className={`material-symbols-outlined ${style.iconColor} mb-4 text-2xl`}
                >
                  {style.icon}
                </span>
                <h3 className="text-white font-headline font-bold text-lg mb-3">
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
