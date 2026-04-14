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
export type AttemptStatus = 'STARTED' | 'SUBMITTED' | 'SCORED' | 'CANCELLED';
export type Role = 'USER' | 'GRADER' | 'CONTENT_EDITOR' | 'ADMIN';

export interface AdminTest {
  id: string;
  title: string;
  description: string | null;
  cefrLevel: CefrLevel;
  timeLimitMinutes: number | null;
  passingScore: number | null;
  instructions: string | null;
  settings: Record<string, unknown>;
  status: TestStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSection {
  id: string;
  testId: string;
  title: string;
  skill: SkillType;
  orderIndex: number;
  instructions: string | null;
  timeLimitMinutes: number | null;
  settings: Record<string, unknown>;
}

export interface AdminQuestion {
  id: string;
  sectionId: string;
  questionType: QuestionType;
  orderIndex: number;
  prompt: string;
  maxScore: number;
  settings: Record<string, unknown>;
}

export interface AdminRubric {
  id: string;
  name: string;
  description: string | null;
  skill: SkillType;
  cefrLevel: CefrLevel;
  maxScore: number;
}

export interface AdminAttempt {
  id: string;
  testId: string;
  userId: string;
  status: AttemptStatus;
  totalScore: number | null;
  createdAt: string;
  submittedAt: string | null;
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
  levelDescriptors?: Record<string, unknown> | null;
}

export interface CreateRubricRequest {
  name: string;
  description?: string | null;
  skill: SkillType;
  cefrLevel: CefrLevel;
  maxScore: number;
  criteria: CreateRubricCriterionRequest[];
}

export interface ListSubmissionsQuery extends PaginationQuery {
  status?: AttemptStatus;
  testId?: string;
  userId?: string;
}

export interface OverrideScoreRequest {
  targetType: 'ATTEMPT' | 'SECTION' | 'RESPONSE';
  targetId: string;
  newScore: number;
  reason: string;
}

export interface RescoreAttemptRequest {
  sectionId?: string | null;
  reason?: string | null;
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
  assetType: string;
  mimeType: string;
  contextType?: string;
  attemptId?: string;
  questionId?: string;
}

export interface PresignDownloadRequest {
  assetId?: string;
  bucket?: string;
  s3Key?: string;
}

export interface ReorderSectionsRequest {
  sectionIds: string[];
}

export interface ReorderSectionAssetsRequest {
  assetIds: string[];
}
