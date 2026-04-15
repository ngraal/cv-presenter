import type { PersonalInfo } from "@/lib/types";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format-date";

const BRAND_ICONS: Record<string, ReactNode> = {
  github: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  xing: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L3.169 13.9c-.09.185-.089.381 0 .529.087.142.25.223.464.223h3.455c.518 0 .766-.348.945-.667l2.405-4.439c-.014-.02-2.37-4.106-2.37-4.106-.163-.305-.434-.66-.96-.66H3.648v-.04z" />
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

function getLinkIcon(name: string): ReactNode {
  const key = name.toLowerCase();
  for (const [k, icon] of Object.entries(BRAND_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return (
    <span className="material-symbols-outlined text-sm">link</span>
  );
}

export default function PersonalHeader({
  data,
  hasImage,
}: {
  data: PersonalInfo;
  hasImage: boolean;
}) {
  return (
    <section
      id="hero"
      className="flex flex-col justify-center items-center px-8 md:px-12 lg:px-20 relative overflow-hidden py-16 md:py-24"
    >
      <div className="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16">
        {/* Avatar Column */}
        {hasImage && (
          <div className="shrink-0">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-primary/20 shadow-2xl">
              <img
                className="w-full h-full object-cover"
                src="/api/image"
                alt={data.fullName}
              />
            </div>
          </div>
        )}

        {/* Content Column */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-2 leading-tight">
            {data.fullName}
          </h1>
          <p className="text-secondary text-xl md:text-2xl font-bold font-headline mb-6">
            {data.title}
          </p>

          {data.summary && (
            <p className="text-on-surface-variant text-lg font-light leading-relaxed max-w-2xl mb-6">
              {data.summary}
            </p>
          )}

          <div className="flex flex-col items-center md:items-start gap-6 mb-8">
            <div className="flex flex-wrap justify-center md:justify-start gap-y-3 gap-x-8 text-sm">
              {data.birthDate && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-lg">
                    cake
                  </span>
                  <span>{formatDate(data.birthDate)}</span>
                </div>
              )}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-lg">
                    mail
                  </span>
                  <span>{data.email}</span>
                </a>
              )}
              {data.phone && (
                <a 
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg">
                    call
                  </span>
                  <span>{data.phone}</span>
                </a>
              )}
              {data.location && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(data.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-lg">
                    location_on
                  </span>
                  <span>{data.location}</span>
                </a>
              )}
            </div>
          </div>

          {data.links && data.links.length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {data.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-surface-container-highest border border-outline-variant/20 px-4 py-2 rounded-md font-bold text-white text-xs hover:border-primary/50 transition-all"
                >
                  {getLinkIcon(link.name)}
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
