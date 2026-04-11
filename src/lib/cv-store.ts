import "server-only";

import { readFile, writeFile, mkdir, access, unlink } from "fs/promises";
import path from "path";
import type { CVData } from "./types";

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const CV_JSON_PATH = path.join(DATA_DIR, "cv.json");
const CV_PDF_PATH = path.join(DATA_DIR, "cv.pdf");
const PROFILE_IMAGE_PATH = path.join(DATA_DIR, "profile-image");

const DEFAULT_CV: CVData = {
  personal: {
    fullName: "Jane Doe",
    title: "Software Engineer",
    email: "jane.doe@example.com",
    phone: "+1 555 123 4567",
    location: "Berlin, Germany",
    links: [
      { id: "link-1", name: "Website", url: "https://janedoe.dev" },
      { id: "link-2", name: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
      { id: "link-3", name: "GitHub", url: "https://github.com/janedoe" },
    ],
    summary:
      "Experienced software engineer with a passion for building elegant, scalable web applications. Specializing in TypeScript, React, and cloud-native architectures.",
  },
  experience: [
    {
      id: "exp-1",
      company: "Acme Corp",
      position: "Senior Software Engineer",
      startDate: "2022-01",
      description:
        "Led development of microservices platform serving 2M+ users. Mentored junior developers and established coding standards.",
    },
    {
      id: "exp-2",
      company: "StartupXYZ",
      position: "Full Stack Developer",
      startDate: "2019-06",
      endDate: "2021-12",
      description:
        "Built customer-facing SPA with React and Node.js backend. Implemented CI/CD pipelines and automated testing.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Technical University of Berlin",
      degree: "M.Sc.",
      field: "Computer Science",
      startDate: "2017-10",
      endDate: "2019-05",
      description: "Focus on distributed systems and software engineering.",
    },
    {
      id: "edu-2",
      institution: "University of Hamburg",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: "2014-10",
      endDate: "2017-09",
    },
  ],
  skills: [
    {
      id: "skill-1",
      category: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "Go"],
    },
    {
      id: "skill-2",
      category: "Frontend",
      items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS"],
    },
    {
      id: "skill-3",
      category: "Backend",
      items: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    },
    {
      id: "skill-4",
      category: "Tools",
      items: ["Git", "GitHub Actions", "AWS", "Terraform"],
    },
  ],
};

async function ensureDataDir(): Promise<void> {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getCVData(): Promise<CVData> {
  await ensureDataDir();
  try {
    const data = await readFile(CV_JSON_PATH, "utf-8");
    return JSON.parse(data) as CVData;
  } catch {
    await writeFile(CV_JSON_PATH, JSON.stringify(DEFAULT_CV, null, 2), "utf-8");
    return DEFAULT_CV;
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
