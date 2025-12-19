
export enum NoteCategory {
  STUDY = 'Study',
  WORK = 'Work',
  PERSONAL = 'Personal',
  IDEAS = 'Ideas',
  REFERENCE = 'Reference'
}

export interface CornellData {
  notes: string;
  cues: string[];
  summary: string;
}

export interface ValidationResult {
  accuracyScore: number;
  missingPoints: string[];
  inconsistencies: string[];
  verificationNote: string;
  factCheckDetails: { fact: string; status: 'verified' | 'uncertain' | 'correction' }[];
}

export interface Connection {
  id: string;
  title: string;
  relation: string;
}

export interface Note {
  id: string;
  title: string;
  rawInput: string;
  category: NoteCategory;
  tags: string[];
  cornell: CornellData;
  validation: ValidationResult;
  connections: Connection[];
  masteryScore: number; // 0-100
  lastReviewed: number;
  isSeed: boolean; // Is this a note the AI seeded for the user to learn?
  createdAt: number;
  updatedAt: number;
}

export type AppView = 'notebook' | 'graph' | 'dashboard';
