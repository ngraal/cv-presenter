import "server-only";

import { readFile, writeFile, mkdir, access, unlink, readdir } from "fs/promises";
import path from "path";
import type { CVData } from "./types";

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const CV_JSON_PATH = path.join(DATA_DIR, "cv.json");
const CV_PDF_PATH = path.join(DATA_DIR, "cv.pdf");
const PROFILE_IMAGE_PATH = path.join(DATA_DIR, "profile-image");

async function ensureDataDir(): Promise<void> {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getCVData(): Promise<CVData | null> {
  await ensureDataDir();
  try {
    const data = await readFile(CV_JSON_PATH, "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(data) as any;

    // New format — return directly
    if (parsed.sections && parsed.skillSections) {
      return parsed as CVData;
    }

    // Migrate: new sections but old flat skills array
    if (parsed.sections && parsed.skills && !parsed.skillSections) {
      return {
        ...parsed,
        skillSections: [{ title: "Skills", skills: parsed.skills }],
        skills: undefined,
      } as unknown as CVData;
    }

    // Migrate legacy format (experience/education/certifications) → sections
    const sections: CVData["sections"] = [];
    if (parsed.experience?.length) {
      sections.push({
        title: "Experience",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: parsed.experience.map((e: any) => ({
          title: e.company,
          subtitle: e.position,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
        })),
      });
    }
    if (parsed.education?.length) {
      sections.push({
        title: "Education",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: parsed.education.map((e: any) => ({
          title: e.institution,
          subtitle: [e.degree, e.field].filter(Boolean).join(" "),
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
        })),
      });
    }
    if (parsed.certifications?.length) {
      sections.push({
        title: "Certifications",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: parsed.certifications.map((c: any) => ({
          title: c.name,
          endDate: c.date,
          description: c.description,
        })),
      });
    }

    if (sections.length === 0 && !parsed.skills?.length) {
      return null;
    }

    return {
      personal: parsed.personal ?? { fullName: "", title: "", email: "", phone: "", location: "", links: [], summary: "" },
      sections,
      skillSections: parsed.skills?.length ? [{ title: "Skills", skills: parsed.skills }] : [],
    };
  } catch (error) {
    console.error("[cv-store] Failed to read cv.json from", CV_JSON_PATH, error);
    return null;
  }
}

export async function saveCVData(data: CVData): Promise<void> {
  await ensureDataDir();
  await writeFile(CV_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getPDFBuffer(): Promise<Buffer | null> {
  try {
    return await readFile(CV_PDF_PATH);
  } catch {
    return null;
  }
}

export async function savePDF(buffer: Buffer): Promise<void> {
  await ensureDataDir();
  await writeFile(CV_PDF_PATH, buffer);
}

export async function hasPDF(): Promise<boolean> {
  try {
    await access(CV_PDF_PATH);
    return true;
  } catch {
    return false;
  }
}

export async function saveProfileImage(
  buffer: Buffer,
  extension: string
): Promise<string> {
  await ensureDataDir();
  const filename = `profile-image.${extension}`;
  const filePath = path.join(DATA_DIR, filename);
  await writeFile(filePath, buffer);
  return filename;
}

export async function getProfileImage(): Promise<{
  buffer: Buffer;
  filename: string;
} | null> {
  const extensions = ["jpg", "jpeg", "png", "webp"];
  for (const ext of extensions) {
    const filePath = path.join(DATA_DIR, `profile-image.${ext}`);
    try {
      const buffer = await readFile(filePath);
      return { buffer, filename: `profile-image.${ext}` };
    } catch {
      continue;
    }
  }
  return null;
}

export async function hasProfileImage(): Promise<boolean> {
  return (await getProfileImage()) !== null;
}

export async function deletePDF(): Promise<void> {
  try {
    await unlink(CV_PDF_PATH);
  } catch {
    // file doesn't exist, ignore
  }
}

export async function deletePDFByName(name: string): Promise<void> {
  const safe = path.basename(name);
  const filePath = path.join(DATA_DIR, `${safe}.pdf`);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DATA_DIR))) return;
  try {
    await unlink(filePath);
  } catch {
    // file doesn't exist, ignore
  }
}

export async function savePDFByName(
  name: string,
  buffer: Buffer
): Promise<void> {
  await ensureDataDir();
  const safe = path.basename(name);
  const filePath = path.join(DATA_DIR, `${safe}.pdf`);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DATA_DIR))) return;
  await writeFile(filePath, buffer);
}

export async function listPDFs(): Promise<string[]> {
  try {
    const entries = await readdir(DATA_DIR);
    return entries
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .map((f) => f.replace(/\.pdf$/i, ""));
  } catch {
    return [];
  }
}

export async function getPDFByName(
  name: string
): Promise<Buffer | null> {
  const safe = path.basename(name);
  const filePath = path.join(DATA_DIR, `${safe}.pdf`);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DATA_DIR))) return null;
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export async function deleteProfileImage(): Promise<void> {
  const extensions = ["jpg", "jpeg", "png", "webp"];
  for (const ext of extensions) {
    try {
      await unlink(path.join(DATA_DIR, `profile-image.${ext}`));
    } catch {
      continue;
    }
  }
}
