
export enum ExamMode {
  RANDOM = 'RANDOM',
  FULL = 'FULL',
  CUSTOM = 'CUSTOM'
}

export enum ExamPart {
  PART_1_1 = 'PART_1_1',
  PART_1_2 = 'PART_1_2',
  PART_2 = 'PART_2',
  PART_3 = 'PART_3'
}

export interface Question {
  id: string;
  topic: string;
  text?: string;
  images?: string[];
  prepTime: number; // in seconds
  recordTime: number; // in seconds
  benefits?: string[];
  drawbacks?: string[];
}

export interface ExamSession {
  id: string;
  mode: ExamMode;
  parts: ExamPart[];
  questions: Record<ExamPart, Question[]>;
  currentPartIndex: number;
  currentQuestionIndex: number;
  status: 'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'FINISHED';
}

export interface User {
  id: string;
  phone: string;
  isSubscribed: boolean;
  subscriptionExpiry?: string;
}

export interface ExamHistoryItem {
  id: string;
  date: string;
  mode: ExamMode;
  score?: number;
  recordingsCount: number;
}
