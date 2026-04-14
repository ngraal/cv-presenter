"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CVData, SectionItem, CVSection, Skill, SkillSection, Link } from "@/lib/types";

function AutoTextarea({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e);
        resize();
      }}
      rows={1}
      className={className + " resize-none overflow-hidden"}
    />
  );
}

function SkillItemsInput({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (items: string[]) => void;
  className: string;
}) {
  const [text, setText] = useState(value.join(", "));

  useEffect(() => {
    setText(value.join(", "));
  }, [value]);

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const parsed = text.split(",").map((s) => s.trim()).filter(Boolean);
        onChange(parsed);
      }}
      className={className}
    />
  );
}

export default function CVEditorForm() {
  const [data, setData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/cv")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/image", { method: "HEAD" })
      .then((res) => {
        if (res.ok) setImagePreview(`/api/image?v=${Date.now()}`);
      })
      .catch(() => {});
  }, []);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setMessage("");
    try {
      // Upload image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgRes = await fetch("/api/image/upload", {
          method: "POST",
          body: formData,
        });
        if (!imgRes.ok) {
          setMessage("Failed to upload image.");
          setSaving(false);
          return;
        }
        setImageFile(null);
      }

      const res = await fetch("/api/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("Saved successfully!");
      } else {
        setMessage("Failed to save.");
      }
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-on-surface-variant">Loading...</p>;
  if (!data) return <p className="text-error">Failed to load CV data.</p>;

  function updatePersonal(field: string, value: string) {
    setData((prev) =>
      prev ? { ...prev, personal: { ...prev.personal, [field]: value } } : prev
    );
  }

  function updateLink(index: number, field: keyof Link, value: string) {
    setData((prev) => {
      if (!prev) return prev;
      const links = [...(prev.personal.links || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, personal: { ...prev.personal, links } };
    });
  }

  function addLink() {
    setData((prev) =>
      prev
        ? {
            ...prev,
            personal: {
              ...prev.personal,
              links: [...(prev.personal.links || []), { name: "", url: "" }],
            },
          }
        : prev
    );
  }

  function removeLink(index: number) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            personal: {
              ...prev.personal,
              links: (prev.personal.links || []).filter((_, i) => i !== index),
            },
          }
        : prev
    );
  }

  function updateSectionTitle(sectionIndex: number, title: string) {
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], title };
      return { ...prev, sections };
    });
  }

  function updateSectionItem(sectionIndex: number, itemIndex: number, field: keyof SectionItem, value: string) {
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const items = [...sections[sectionIndex].items];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      sections[sectionIndex] = { ...sections[sectionIndex], items };
      return { ...prev, sections };
    });
  }

  function addSection() {
    setData((prev) =>
      prev
        ? {
            ...prev,
            sections: [
              ...prev.sections,
              { title: "", items: [] },
            ],
          }
        : prev
    );
  }

  function removeSection(sectionIndex: number) {
    setData((prev) =>
      prev
        ? { ...prev, sections: prev.sections.filter((_, i) => i !== sectionIndex) }
        : prev
    );
  }

  function addSectionItem(sectionIndex: number) {
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        items: [
          ...sections[sectionIndex].items,
          { title: "", subtitle: "", startDate: "", endDate: "", description: "" },
        ],
      };
      return { ...prev, sections };
    });
  }

  function removeSectionItem(sectionIndex: number, itemIndex: number) {
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        items: sections[sectionIndex].items.filter((_, i) => i !== itemIndex),
      };
      return { ...prev, sections };
    });
  }

  function updateSkill(sectionIndex: number, skillIndex: number, field: "category" | "icon" | "items", value: string | string[]) {
    setData((prev) => {
      if (!prev) return prev;
      const skillSections = [...prev.skillSections];
      const skills = [...skillSections[sectionIndex].skills];
      if (field === "items" && Array.isArray(value)) {
        skills[skillIndex] = { ...skills[skillIndex], items: value };
      } else {
        skills[skillIndex] = { ...skills[skillIndex], [field]: value };
      }
      skillSections[sectionIndex] = { ...skillSections[sectionIndex], skills };
      return { ...prev, skillSections };
    });
  }

  function addSkillSection() {
    setData((prev) =>
      prev
        ? {
            ...prev,
            skillSections: [...prev.skillSections, { title: "", skills: [] }],
          }
        : prev
    );
  }

  function removeSkillSection(sectionIndex: number) {
    setData((prev) =>
      prev
        ? { ...prev, skillSections: prev.skillSections.filter((_, i) => i !== sectionIndex) }
        : prev
    );
  }

  function updateSkillSectionTitle(sectionIndex: number, title: string) {
    setData((prev) => {
      if (!prev) return prev;
      const skillSections = [...prev.skillSections];
      skillSections[sectionIndex] = { ...skillSections[sectionIndex], title };
      return { ...prev, skillSections };
    });
  }

  function addSkill(sectionIndex: number) {
    setData((prev) => {
      if (!prev) return prev;
      const skillSections = [...prev.skillSections];
      skillSections[sectionIndex] = {
        ...skillSections[sectionIndex],
        skills: [...skillSections[sectionIndex].skills, { category: "", icon: "", items: [] }],
      };
      return { ...prev, skillSections };
    });
  }

  function removeSkill(sectionIndex: number, skillIndex: number) {
    setData((prev) => {
      if (!prev) return prev;
      const skillSections = [...prev.skillSections];
      skillSections[sectionIndex] = {
        ...skillSections[sectionIndex],
        skills: skillSections[sectionIndex].skills.filter((_, i) => i !== skillIndex),
      };
      return { ...prev, skillSections };
    });
  }

  const inputClass =
    "w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface bg-surface-container-low text-sm";

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <section className="bg-surface-container rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-on-surface">Personal Information</h2>
        <div className="flex gap-6">
          {/* Profile Image */}
          <div className="shrink-0 relative">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-28 h-36 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary transition flex items-center justify-center overflow-hidden cursor-pointer bg-surface-container-low"
              title="Click to change profile image"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-outline text-xs text-center px-2">Click to add photo</span>
              )}
            </button>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  fetch("/api/image", { method: "DELETE" }).catch(() => {});
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error rounded-full text-xs flex items-center justify-center hover:bg-error-dim transition shadow"
                title="Delete image"
              >
                ✕
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  ["fullName", "Full Name"],
                  ["title", "Job Title"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["location", "Location"],
                  ["birthDate", "Birth Date"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
                  <input
                    type="text"
                    value={data.personal[field] ?? ""}
                    onChange={(e) => updatePersonal(field, e.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Summary</label>
              <AutoTextarea
                value={data.personal.summary}
                onChange={(e) => updatePersonal("summary", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="bg-surface-container rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface">Links</h2>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-primary hover:text-primary-dim font-medium"
          >
            + Add
          </button>
        </div>
        {(data.personal.links || []).map((link, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Name</label>
                <input type="text" value={link.name} onChange={(e) => updateLink(i, "name", e.target.value)} className={inputClass} placeholder="e.g. LinkedIn" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">URL</label>
                <input type="text" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </div>
            <button type="button" onClick={() => removeLink(i)} className="text-error hover:text-error-dim text-sm mt-4">✕</button>
          </div>
        ))}
      </section>

      {/* Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface">Sections</h2>
          <button
            type="button"
            onClick={addSection}
            className="text-sm text-primary hover:text-primary-dim font-medium"
          >
            + Add Section
          </button>
        </div>
        {data.sections.map((section, si) => (
          <section key={si} className="bg-surface-container rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(si, e.target.value)}
                className={inputClass + " text-lg font-semibold"}
                placeholder="Section title, e.g. Experience"
              />
              <button
                type="button"
                onClick={() => removeSection(si)}
                className="text-error hover:text-error-dim text-sm shrink-0"
                title="Remove section"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => addSectionItem(si)}
                className="text-sm text-primary hover:text-primary-dim font-medium shrink-0"
              >
                + Add Item
              </button>
            </div>
            {section.items.map((item, ii) => (
              <div key={ii} className="border border-outline-variant rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Title</label>
                      <input type="text" value={item.title} onChange={(e) => updateSectionItem(si, ii, "title", e.target.value)} className={inputClass} placeholder="e.g. Company, Institution, Certificate" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Subtitle</label>
                      <input type="text" value={item.subtitle ?? ""} onChange={(e) => updateSectionItem(si, ii, "subtitle", e.target.value)} className={inputClass} placeholder="e.g. Position, Degree + Field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Start Date</label>
                      <input type="text" value={item.startDate ?? ""} onChange={(e) => updateSectionItem(si, ii, "startDate", e.target.value)} className={inputClass} placeholder="YYYY-MM or empty" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">End Date</label>
                      <input type="text" value={item.endDate ?? ""} onChange={(e) => updateSectionItem(si, ii, "endDate", e.target.value)} className={inputClass} placeholder="YYYY-MM or empty" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeSectionItem(si, ii)} className="ml-3 text-error hover:text-error-dim text-sm">✕</button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Description</label>
                  <AutoTextarea value={item.description ?? ""} onChange={(e) => updateSectionItem(si, ii, "description", e.target.value)} className={inputClass} />
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

      {/* Skill Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface">Skill Sections</h2>
          <button
            type="button"
            onClick={addSkillSection}
            className="text-sm text-primary hover:text-primary-dim font-medium"
          >
            + Add Skill Section
          </button>
        </div>
        {data.skillSections.map((skillSection, si) => (
          <section key={si} className="bg-surface-container rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={skillSection.title}
                onChange={(e) => updateSkillSectionTitle(si, e.target.value)}
                className={inputClass + " text-lg font-semibold"}
                placeholder="Section title, e.g. Technical Skills"
              />
              <button
                type="button"
                onClick={() => removeSkillSection(si)}
                className="text-error hover:text-error-dim text-sm shrink-0"
                title="Remove skill section"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => addSkill(si)}
                className="text-sm text-primary hover:text-primary-dim font-medium shrink-0"
              >
                + Add Category
              </button>
            </div>
            {skillSection.skills.map((skill, i) => (
              <div key={i} className="border border-outline-variant rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Category</label>
                        <input type="text" value={skill.category} onChange={(e) => updateSkill(si, i, "category", e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Icon</label>
                        <input type="text" value={skill.icon ?? ""} onChange={(e) => updateSkill(si, i, "icon", e.target.value)} className={inputClass + " w-36"} placeholder="e.g. terminal" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Items (comma-separated)</label>
                      <SkillItemsInput value={skill.items} onChange={(items) => updateSkill(si, i, "items", items)} className={inputClass} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeSkill(si, i)} className="text-error hover:text-error-dim text-sm">✕</button>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

      {/* Save — floating bottom-right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {message && (
          <p
            className={`text-sm bg-surface-container px-3 py-2 rounded-lg shadow ${
              message.includes("success") ? "text-tertiary" : "text-error"
            }`}
          >
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            if (!data) return;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "cv.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          title="Download cv.json"
          className="w-12 h-12 bg-surface-container border border-outline-variant text-on-surface-variant rounded-full font-medium hover:bg-surface-container-high transition shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
          </svg>
        </button>
        <label
          title="Upload cv.json"
          className="w-12 h-12 bg-surface-container border border-outline-variant text-on-surface-variant rounded-full font-medium hover:bg-surface-container-high transition shadow-lg flex items-center justify-center cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v13" />
          </svg>
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parsed = JSON.parse(reader.result as string) as CVData;
                  setData(parsed);
                  setMessage("JSON loaded — click Save to apply.");
                } catch {
                  setMessage("Invalid JSON file.");
                }
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium hover:bg-primary-dim disabled:opacity-50 transition shadow-lg shadow-primary/25"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
