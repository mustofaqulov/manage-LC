
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

export enum ExamStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  PREPARING = 'PREPARING',
  RECORDING = 'RECORDING',
  FINISHED = 'FINISHED'
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
  status: ExamStatus;
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Scoring types
export interface ExamScore {
  totalScore: number;
  fluency: number;
  pronunciation: number;
  vocabulary: number;
  grammar: number;
  feedback: string;
}

export interface RecordingData {
  id: string;
  blob: Blob;
  questionId: string;
  duration: number;
  timestamp: Date;
}
