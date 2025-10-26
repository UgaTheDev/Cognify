export interface Course {
  id: string;
  code: string;
  subject: string;
  catalogNumber: string;
  title: string;
  shortTitle: string;
  description: string;
  credits: number;
  component: "LEC" | "LAB" | "SEM" | "IND" | "DRS";
  repeatable: boolean;
  consentRequired: boolean;
  prerequisites: Prerequisites;
  hubRequirements: string[];
  level: "Introductory" | "Intermediate" | "Advanced" | "Graduate";
  // Hub-related properties from backend
  hub_areas?: Record<string, boolean>; // Object with hub area names as keys
  hub_requirements?: string[]; // Array of hub area names (alternative format)
}

export interface Prerequisites {
  required: string[];
  recommended: string[];
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: "Fall" | "Spring" | "Summer";
  courses: string[];
  totalCredits: number;
}
