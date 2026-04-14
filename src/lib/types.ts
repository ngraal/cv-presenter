export type Role = "admin" | "viewer";

export type TokenFormat = "jwt" | "compact" | "mini";

export interface TokenPayload {
  name: string;
  role: Role;
  jti: string;
  iat: number;
  exp: number;
}

export interface Link {
  name: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  birthDate?: string;
  links: Link[];
  summary: string;
  infoText?: string;
  profileImage?: string;
}

export interface SectionItem {
  title: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CVSection {
  title: string;
  items: SectionItem[];
}

export interface Skill {
  category: string;
  icon?: string;
  items: string[];
}

export interface SkillSection {
  title: string;
  skills: Skill[];
}

export interface CVData {
  personal: PersonalInfo;
  sections: CVSection[];
  skillSections: SkillSection[];
}
