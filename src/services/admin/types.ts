export type SortDirection = 'ASC' | 'DESC';

export interface PaginationQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalCount?: number;
}

export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SkillType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
export type QuestionType =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTI'
  | 'TRUE_FALSE'
  | 'GAP_FILL'
  | 'SHORT_ANSWER'
  | 'MATCHING'
  | 'ESSAY'
  | 'SPEAKING_RESPONSE';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'SCORING' | 'SCORED' | 'CANCELLED' | 'EXPIRED';
export type AttemptSourceType = 'TEST' | 'RANDOM_SECTIONS';
export type Role = 'USER' | 'GRADER' | 'CONTENT_EDITOR' | 'ADMIN';
export type AssetType = 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
export type SectionAttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'SCORING' | 'SCORED';
export type ScoringJobStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type OverrideTargetType = 'RESPONSE' | 'RUBRIC_SCORE' | 'SECTION' | 'ATTEMPT';

export interface AdminTest {
  id: string;
  title: string;
  description: string | null;
  cefrLevel: CefrLevel;
  status: TestStatus;
  version: number;
  parentId: string | null;
  timeLimitMinutes: number | null;
  passingScore: number | null;
  instructions: string | null;
  settings: Record<string, unknown>;
  publishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  sections?: AdminSection[] | null;
}

export interface AdminSectionAsset {
  id: string;
  assetType: AssetType;
  mimeType: string;
  contextLabel: string | null;
  orderIndex: number;
}

export interface AdminOption {
  id: string;
  label: string;
  content: string;
  contentImageAssetId: string | null;
  orderIndex: number;
  isCorrect: boolean;
  scoreWeight: number;
  matchTarget: string | null;
}

export interface AdminExpectedAnswer {
  id: string;
  answerKey: string | null;
  acceptedValues: string[];
  isCaseSensitive: boolean;
  isRegex: boolean;
  scoreWeight: number;
}

export interface AdminQuestionRubric {
  rubricId: string;
  rubricName: string;
  isPrimary: boolean;
}

export interface AdminQuestion {
  id: string;
  sectionId: string;
  questionType: QuestionType;
  orderIndex: number;
  prompt: string;
  promptAudioAssetId: string | null;
  promptImageAssetId: string | null;
  maxScore: number;
  settings: Record<string, unknown>;
  explanation: string | null;
  createdAt: string;
  updatedAt: string | null;
  options: AdminOption[];
  expectedAnswers: AdminExpectedAnswer[];
  rubrics: AdminQuestionRubric[];
}

export interface AdminSection {
  id: string;
  testId: string;
  title: string;
  skill: SkillType;
  orderIndex: number;
  instructions: string | null;
  timeLimitMinutes: number | null;
  maxScore: number | null;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
  questions?: AdminQuestion[] | null;
  assets?: AdminSectionAsset[] | null;
}

export interface AdminRubricCriterion {
  id: string;
  name: string;
  description: string | null;
  maxScore: number;
  weight: number;
  orderIndex: number;
  levelDescriptors: Record<string, string> | null;
}

export interface AdminRubric {
  id: string;
  name: string;
  description: string | null;
  skill: SkillType;
  cefrLevel: CefrLevel | null;
  maxScore: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  criteria: AdminRubricCriterion[];
}

export interface AdminAttempt {
  id: string;
  testId: string | null;
  sourceType: AttemptSourceType;
  testTitle: string;
  cefrLevel: CefrLevel;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  scoredAt: string | null;
  totalScore: number | null;
  maxTotalScore: number | null;
  scorePercentage: number | null;
  estimatedCefrLevel: CefrLevel | null;
}

export interface AdminAttemptSection {
  id: string;
  sectionId: string;
  sectionTitle: string;
  skill: SkillType;
  status: SectionAttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  scoredAt: string | null;
  sectionScore: number | null;
  maxSectionScore: number | null;
  aiFeedback: string | null;
}

export interface AdminRubricScore {
  id: string;
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  feedback: string | null;
}

export interface AdminAttemptResponse {
  id: string;
  questionId: string;
  questionType: QuestionType;
  answer: Record<string, unknown>;
  answeredAt: string;
  isCorrect: boolean | null;
  scoreAwarded: number | null;
  maxScore: number | null;
  aiSummary: string | null;
  rubricScores: AdminRubricScore[] | null;
}

export interface AdminScoringJob {
  id: string;
  sectionId: string | null;
  status: ScoringJobStatus;
  attemptNo: number;
  aiProvider: string | null;
  aiModel: string | null;
  processingTimeMs: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminScoreOverride {
  id: string;
  targetType: OverrideTargetType;
  targetId: string;
  previousScore: number | null;
  newScore: number;
  reason: string;
  overriddenBy: string | null;
  createdAt: string;
}

export interface AdminAttemptDetail {
  id: string;
  testId: string | null;
  testTitle: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  scoredAt: string | null;
  totalScore: number | null;
  maxTotalScore: number | null;
  scorePercentage: number | null;
  estimatedCefrLevel: string | null;
  aiSummary: string | null;
  sections: AdminAttemptSection[];
  responses: AdminAttemptResponse[];
  scoringJobs: AdminScoringJob[];
  overrides: AdminScoreOverride[];
}

export interface SpeakingAnalysisCriterionBreakdown {
  criterionName: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface SpeakingAnalysisPart {
  partNumber: number;
  partName: string;
  score: number;
  maxScore: number;
  criteriaBreakdown: SpeakingAnalysisCriterionBreakdown[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SpeakingAnalysisComparison {
  strongestPart: number;
  weakestPart: number;
  patterns: string[];
  progressionNotes: string[];
}

export interface SpeakingAnalysis {
  id: string;
  attemptId: string;
  estimatedSpeakingLevel: CefrLevel | null;
  overallSummary: string;
  partAnalyses: SpeakingAnalysisPart[];
  crossPartComparison: SpeakingAnalysisComparison;
  overallStrengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  confidence: number | null;
  generatedAt: string;
}

export interface RegenerateAnalysisResponse {
  jobId: string;
  status: ScoringJobStatus;
  message: string;
}

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  roles: Role[];
  isActive: boolean;
  region: string | null;
  city: string | null;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateTestRequest {
  title: string;
  description?: string | null;
  cefrLevel: CefrLevel;
  timeLimitMinutes?: number | null;
  passingScore?: number | null;
  instructions?: string | null;
  settings?: Record<string, unknown>;
}

export interface UpdateTestRequest {
  title?: string;
  description?: string | null;
  cefrLevel?: CefrLevel | null;
  timeLimitMinutes?: number | null;
  passingScore?: number | null;
  instructions?: string | null;
  settings?: Record<string, unknown>;
}

export interface CreateSectionRequest {
  testId: string;
  title: string;
  skill: SkillType;
  orderIndex?: number | null;
  instructions?: string | null;
  timeLimitMinutes?: number | null;
  settings?: Record<string, unknown>;
}

export interface UpdateSectionRequest {
  title?: string;
  skill?: SkillType | null;
  orderIndex?: number | null;
  instructions?: string | null;
  timeLimitMinutes?: number | null;
  settings?: Record<string, unknown>;
}

export interface CreateOptionRequest {
  label?: string | null;
  content: string;
  contentImageAssetId?: string | null;
  orderIndex?: number;
  isCorrect?: boolean;
  scoreWeight?: number | null;
  matchTarget?: string | null;
}

export interface CreateExpectedAnswerRequest {
  answerKey?: string | null;
  acceptedValues: string[];
  isCaseSensitive?: boolean;
  isRegex?: boolean;
  scoreWeight?: number | null;
}

export interface CreateQuestionRequest {
  sectionId: string;
  questionType: QuestionType;
  orderIndex?: number;
  prompt: string;
  promptAudioAssetId?: string | null;
  promptImageAssetId?: string | null;
  maxScore?: number;
  settings?: Record<string, unknown>;
  explanation?: string | null;
  options?: CreateOptionRequest[];
  expectedAnswers?: CreateExpectedAnswerRequest[];
  rubricId?: string | null;
}

export interface UpdateQuestionRequest {
  questionType?: QuestionType;
  orderIndex?: number | null;
  prompt?: string;
  promptAudioAssetId?: string | null;
  promptImageAssetId?: string | null;
  maxScore?: number;
  settings?: Record<string, unknown>;
  explanation?: string | null;
}

export interface CreateRubricCriterionRequest {
  name: string;
  description?: string | null;
  maxScore: number;
  weight?: number;
  orderIndex?: number;
  levelDescriptors?: Record<string, string> | null;
}

export interface CreateRubricRequest {
  name: string;
  description?: string | null;
  skill: SkillType;
  cefrLevel?: CefrLevel | null;
  maxScore: number;
  criteria: CreateRubricCriterionRequest[];
}

export interface ListSubmissionsQuery extends PaginationQuery {
  status?: AttemptStatus;
  testId?: string;
  userId?: string;
}

export interface OverrideScoreRequest {
  targetType: OverrideTargetType;
  targetId: string;
  newScore: number;
  reason: string;
}

export interface RescoreAttemptRequest {
  sectionId?: string | null;
  reason: string;
}

export interface ListUsersQuery extends PaginationQuery {
  role?: Role;
  search?: string;
  isActive?: boolean;
}

export interface GrantAccessRequest {
  startDate: string;
  endDate: string;
}

export interface UpdateRolesRequest {
  roles: Role[];
}

export interface PresignUploadRequest {
  assetType: AssetType;
  mimeType: string;
  filename?: string | null;
  fileSizeBytes?: number | null;
  contextType: 'stimuli' | 'speaking_response';
  questionId?: string | null;
  sectionId?: string | null;
  attemptId?: string | null;
}

export interface PresignUploadResponse {
  assetId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresAt: number;
  s3Key: string;
}

export interface PresignDownloadRequest {
  assetId?: string;
  bucket?: string;
  s3Key?: string;
}

export interface PresignDownloadResponse {
  downloadUrl: string;
  method: string;
  expiresAt: number;
}

export interface ReorderSectionsRequest {
  sectionIds: string[];
}

export interface AddSectionAssetRequest {
  assetId: string;
  contextLabel?: string | null;
  orderIndex?: number;
}

export interface ReorderSectionAssetsRequest {
  assetIds: string[];
}
