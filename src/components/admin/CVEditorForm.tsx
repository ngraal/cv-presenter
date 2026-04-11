"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { CVData, Experience, Education, Skill, Link } from "@/lib/types";

export default function CVEditorForm() {
  const [data, setData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/cv")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setMessage("");
    try {
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

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!data) return <p className="text-red-600">Failed to load CV data.</p>;

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
              links: [...(prev.personal.links || []), { id: uuidv4(), name: "", url: "" }],
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

  function updateExperience(index: number, field: keyof Experience, value: string) {
    setData((prev) => {
      if (!prev) return prev;
      const items = [...prev.experience];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, experience: items };
    });
  }

  function addExperience() {
    setData((prev) =>
      prev
        ? {
            ...prev,
            experience: [
              ...prev.experience,
              { id: uuidv4(), company: "", position: "", startDate: "", description: "" },
            ],
          }
        : prev
    );
  }

  function removeExperience(index: number) {
    setData((prev) =>
      prev
        ? { ...prev, experience: prev.experience.filter((_, i) => i !== index) }
        : prev
    );
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    setData((prev) => {
      if (!prev) return prev;
      const items = [...prev.education];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, education: items };
    });
  }

  function addEducation() {
    setData((prev) =>
      prev
        ? {
            ...prev,
            education: [
              ...prev.education,
              { id: uuidv4(), institution: "", degree: "", field: "", startDate: "" },
            ],
          }
        : prev
    );
  }

  function removeEducation(index: number) {
    setData((prev) =>
      prev
        ? { ...prev, education: prev.education.filter((_, i) => i !== index) }
        : prev
    );
  }

  function updateSkill(index: number, field: "category" | "items", value: string) {
    setData((prev) => {
      if (!prev) return prev;
      const items = [...prev.skills];
      if (field === "items") {
        items[index] = { ...items[index], items: value.split(",").map((s) => s.trim()).filter(Boolean) };
      } else {
        items[index] = { ...items[index], [field]: value };
      }
      return { ...prev, skills: items };
    });
  }

  function addSkill() {
    setData((prev) =>
      prev
        ? {
            ...prev,
            skills: [...prev.skills, { id: uuidv4(), category: "", items: [] }],
          }
        : prev
    );
  }

  function removeSkill(index: number) {
    setData((prev) =>
      prev
        ? { ...prev, skills: prev.skills.filter((_, i) => i !== index) }
        : prev
    );
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm";

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              ["fullName", "Full Name"],
              ["title", "Job Title"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea
            value={data.personal.summary}
            onChange={(e) => updatePersonal("summary", e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
      </section>

      {/* Links */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Links</h2>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add
          </button>
        </div>
        {(data.personal.links || []).map((link, i) => (
          <div key={link.id} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input type="text" value={link.name} onChange={(e) => updateLink(i, "name", e.target.value)} className={inputClass} placeholder="e.g. LinkedIn" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                <input type="text" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </div>
            <button type="button" onClick={() => removeLink(i)} className="text-red-500 hover:text-red-700 text-sm mt-4">✕</button>
          </div>
        ))}
      </section>

      {/* Experience */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add
          </button>
        </div>
        {data.experience.map((exp, i) => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                  <input type="text" value={exp.position} onChange={(e) => updateExperience(i, "position", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                  <input type="text" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input type="text" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className={inputClass} placeholder="YYYY-MM" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input type="text" value={exp.endDate ?? ""} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className={inputClass} placeholder="YYYY-MM or empty" />
                </div>
              </div>
              <button type="button" onClick={() => removeExperience(i)} className="ml-3 text-red-500 hover:text-red-700 text-sm">✕</button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={2} className={inputClass} />
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add
          </button>
        </div>
        {data.education.map((edu, i) => (
          <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Institution</label>
                  <input type="text" value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Degree</label>
                  <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Field</label>
                  <input type="text" value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input type="text" value={edu.startDate} onChange={(e) => updateEducation(i, "startDate", e.target.value)} className={inputClass} placeholder="YYYY-MM" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input type="text" value={edu.endDate ?? ""} onChange={(e) => updateEducation(i, "endDate", e.target.value)} className={inputClass} placeholder="YYYY-MM or empty" />
                </div>
              </div>
              <button type="button" onClick={() => removeEducation(i)} className="ml-3 text-red-500 hover:text-red-700 text-sm">✕</button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea value={edu.description ?? ""} onChange={(e) => updateEducation(i, "description", e.target.value)} rows={2} className={inputClass} />
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
          <button
            type="button"
            onClick={addSkill}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add
          </button>
        </div>
        {data.skills.map((skill, i) => (
          <div key={skill.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <input type="text" value={skill.category} onChange={(e) => updateSkill(i, "category", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Items (comma-separated)</label>
                  <input type="text" value={skill.items.join(", ")} onChange={(e) => updateSkill(i, "items", e.target.value)} className={inputClass} />
                </div>
              </div>
              <button type="button" onClick={() => removeSkill(i)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
            </div>
          </div>
        ))}
      </section>

      {/* Save — floating bottom-right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {message && (
          <p
            className={`text-sm bg-white px-3 py-2 rounded-lg shadow ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-600/25"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
