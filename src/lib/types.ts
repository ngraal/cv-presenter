export type Role = "admin" | "viewer";

export type TokenFormat = "jwt" | "compact";

export interface TokenPayload {
  name: string;
  role: Role;
  jti: string;
  iat: number;
  exp: number;
}

export interface Link {
  id: string;
  name: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: Link[];
  summary: string;
  profileImage?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface CVData {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}
