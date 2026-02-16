// Generated from OpenAPI spec

export type UUID = string;
export type Instant = string; // ISO 8601 date-time

// Enums
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  CONTENT_EDITOR = 'CONTENT_EDITOR',
  GRADER = 'GRADER',
}

export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum SkillType {
  READING = 'READING',
  LISTENING = 'LISTENING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export enum QuestionType {
  MCQ_SINGLE = 'MCQ_SINGLE',
  MCQ_MULTI = 'MCQ_MULTI',
  TRUE_FALSE = 'TRUE_FALSE',
  GAP_FILL = 'GAP_FILL',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MATCHING = 'MATCHING',
  ESSAY = 'ESSAY',
  SPEAKING_RESPONSE = 'SPEAKING_RESPONSE',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  SCORING = 'SCORING',
  SCORED = 'SCORED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum SectionAttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  SCORING = 'SCORING',
  SCORED = 'SCORED',
}

export enum TestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AssetType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

// Auth
export interface LoginRequest {
  phone: string;
  pinCode: string;
}

export interface LoginResponse {
  id: UUID;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  token: string;
  missingInfo: boolean;
}

// User
export interface UserRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;
}

export interface UserResponse {
  id: UUID;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  roles: Role[];
  lastLoginAt: Instant | null;
  // Premium subscription fields (to be added by backend in future)
  startDate?: Instant | null;
  endDate?: Instant | null;
}

// Subscription
export interface SubscriptionResponse {
  isSubscribed: boolean;
  startDate: Instant | null;
  endDate: Instant | null;
}

// Test
export interface TestListResponse {
  id: UUID;
  title: string;
  description: string | null;
  cefrLevel: CefrLevel;
  timeLimitMinutes: number | null;
  sectionCount: number;
  publishedAt: Instant | null;
}

export interface TestDetailResponse {
  id: UUID;
  title: string;
  description: string | null;
  cefrLevel: CefrLevel;
  timeLimitMinutes: number | null;
  passingScore: number | null;
  instructions: string | null;
  sections: SectionResponse[];
  publishedAt: Instant | null;
}

export interface SectionResponse {
  id: UUID;
  title: string;
  skill: SkillType;
  orderIndex: number;
  instructions: string | null;
  timeLimitMinutes: number | null;
  questionCount: number;
  maxScore: number | null;
  assets: SectionAssetResponse[];
}

export interface SectionDetailResponse {
  id: UUID;
  title: string;
  skill: SkillType;
  orderIndex: number;
  instructions: string | null;
  timeLimitMinutes: number | null;
  maxScore: number | null;
  assets: SectionAssetResponse[];
  questions: QuestionResponse[];
}

export interface SectionAssetResponse {
  id: UUID;
  assetType: AssetType;
  mimeType: string;
  contextLabel: string | null;
  orderIndex: number;
}

export interface QuestionResponse {
  id: UUID;
  questionType: QuestionType;
  orderIndex: number;
  prompt: string;
  promptAudioAssetId: UUID | null;
  promptImageAssetId: UUID | null;
  maxScore: number;
  settings: Record<string, any>;
  options: OptionResponse[] | null;
}

export interface OptionResponse {
  id: UUID;
  label: string;
  content: string;
  contentImageAssetId: UUID | null;
  orderIndex: number;
  matchTarget: string | null;
}

// Attempt
export interface StartAttemptRequest {
  testId: UUID;
  sectionId?: UUID | null;
}

export interface StartAttemptResponse {
  attemptId: UUID;
  testId: UUID;
  status: AttemptStatus;
  startedAt: Instant;
  expiresAt: Instant | null;
}

export interface AttemptListResponse {
  id: UUID;
  testId: UUID;
  testTitle: string;
  cefrLevel: CefrLevel;
  status: AttemptStatus;
  startedAt: Instant;
  submittedAt: Instant | null;
  scoredAt: Instant | null;
  totalScore: number | null;
  maxTotalScore: number | null;
  scorePercentage: number | null;
  estimatedCefrLevel: CefrLevel | null;
}

export interface AttemptDetailResponse {
  id: UUID;
  testId: UUID;
  testTitle: string;
  cefrLevel: CefrLevel;
  status: AttemptStatus;
  startedAt: Instant;
  submittedAt: Instant | null;
  scoredAt: Instant | null;
  expiresAt: Instant | null;
  totalScore: number | null;
  maxTotalScore: number | null;
  scorePercentage: number | null;
  estimatedCefrLevel: CefrLevel | null;
  aiSummary: string | null;
  sections: AttemptSectionResponse[];
  responses: ResponseResponse[] | null;
}

export interface AttemptSectionResponse {
  id: UUID;
  sectionId: UUID;
  sectionTitle: string;
  skill: SkillType;
  status: SectionAttemptStatus;
  startedAt: Instant | null;
  submittedAt: Instant | null;
  scoredAt: Instant | null;
  sectionScore: number | null;
  maxSectionScore: number | null;
  aiFeedback: string | null;
}

export interface UpsertResponseRequest {
  questionId: UUID;
  answer: Record<string, any>;
}

export interface UpsertResponseResponse {
  responseId: UUID;
  questionId: UUID;
  answeredAt: Instant;
  saved: boolean;
}

export interface ResponseResponse {
  id: UUID;
  questionId: UUID;
  questionType: QuestionType;
  answer: Record<string, any>;
  answeredAt: Instant;
  isCorrect: boolean | null;
  scoreAwarded: number | null;
  maxScore: number | null;
  aiSummary: string | null;
  rubricScores: RubricScoreResponse[] | null;
}

export interface RubricScoreResponse {
  criterionId: UUID;
  criterionName: string;
  score: number;
  maxScore: number;
  feedback: string | null;
}

export interface SubmitSectionRequest {
  sectionId: UUID;
}

export interface SubmitSectionResponse {
  attemptId: UUID;
  sectionId: UUID;
  status: SectionAttemptStatus;
  submittedAt: Instant;
  objectiveScore: number | null;
  maxObjectiveScore: number | null;
}

export interface SubmitAttemptResponse {
  attemptId: UUID;
  status: AttemptStatus;
  submittedAt: Instant;
  totalObjectiveScore: number | null;
  maxObjectiveScore: number | null;
}

// Assets
export interface PresignUploadRequest {
  assetType: AssetType;
  mimeType: string;
  filename?: string | null;
  fileSizeBytes?: number | null;
  contextType: string;
  questionId?: UUID | null;
  sectionId?: UUID | null;
  attemptId?: UUID | null;
}

export interface PresignUploadResponse {
  assetId: UUID;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresAt: number;
  s3Key: string;
}

export interface PresignDownloadRequest {
  assetId?: UUID | null;
  s3Key?: string | null;
  bucket?: string | null;
}

export interface PresignDownloadResponse {
  downloadUrl: string;
  method: string;
  expiresAt: number;
}

// Pagination
export interface PagedResponse<T> {
  totalCount: number;
  page: number;
  size: number;
  items: T[];
  total: number;
  sortableFields: string[];
}

export type PagedTestListResponse = PagedResponse<TestListResponse>;
export type PagedAttemptListResponse = PagedResponse<AttemptListResponse>;
