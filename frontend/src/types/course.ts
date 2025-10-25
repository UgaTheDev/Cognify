export interface Course {
  id: string;
  code: string;
  subject: string;
  catalogNumber: string;
  title: string;
  shortTitle: string;
  description: string;
  credits: number;
  component: 'LEC' | 'LAB' | 'SEM' | 'IND' | 'DRS';
  repeatable: boolean;
  consentRequired: boolean;
  prerequisites: Prerequisites;
  hubRequirements: string[];
  level: 'Introductory' | 'Intermediate' | 'Advanced' | 'Graduate';
}

export interface Prerequisites {
  required: string[];
  recommended: string[];
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: 'Fall' | 'Spring' | 'Summer';
  courses: string[];
  totalCredits: number;
}
