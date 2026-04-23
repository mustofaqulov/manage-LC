import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { showToast } from '../utils/configs/toastConfig';
import { AdminInputField, AdminSelectField, AdminTextareaField } from '../components/admin/AdminFormFields';
import { AdminBadge, AdminButton, AdminCard, AdminSpinner, AdminStatCard } from '../components/admin/AdminUiKit';
import { apiClient, extractApiErrorMessage } from '../services/api';
import { adminUsersApi } from '../services/admin/adminUsersApi';
import {
  useAdminTestsQuery,
  useAdminUsersQuery,
  useArchiveAdminTestMutation,
  useBlockAdminUserMutation,
  useCreateAdminTestVersionMutation,
  useCreateAdminTestMutation,
  useDeleteAdminTestMutation,
  useDeleteAdminUserMutation,
  useGrantAdminUserAccessMutation,
  usePublishAdminTestMutation,
  useRemoveAdminUserAccessMutation,
  useUnblockAdminUserMutation,
  useUpdateAdminTestMutation,
  useUpdateAdminUserRolesMutation,
} from '../services/admin/hooks';
import type { AdminTest, AdminUser, PagedResponse, Role, TestStatus } from '../services/admin/types';

const ADMIN_SESSION_KEY = 'admin_session';
const AVATAR_BASE = (import.meta.env.VITE_AVATAR_API_URL as string) || 'https://manage-avatar-production.up.railway.app';
const PAGE_SIZE = 20;

type AdminTab = 'avatars' | 'users' | 'exams' | 'exam-create' | 'question-structure' | 'admin-operations';
type RoleFilter = 'ALL' | 'USER' | 'GRADER' | 'CONTENT_EDITOR' | 'ADMIN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type TestStatusFilter = 'ALL' | TestStatus;
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface AdminOperationDefinition {
  id: string;
  group: 'Questions' | 'Rubrics' | 'Submissions' | 'Tests' | 'Sections' | 'Users';
  label: string;
  method: HttpMethod;
  path: string;
  description: string;
  defaultQuery?: Record<string, string>;
  defaultBody?: Record<string, unknown>;
}

type QuestionTypeOption =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTI'
  | 'TRUE_FALSE'
  | 'GAP_FILL'
  | 'SHORT_ANSWER'
  | 'MATCHING'
  | 'ESSAY'
  | 'SPEAKING_RESPONSE';

type CefrLevelOption = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface CreateExamFormState {
  title: string;
  description: string;
  cefrLevel: CefrLevelOption;
  timeLimitMinutes: string;
  passingScore: string;
  instructions: string;
}

interface EditExamFormState {
  title: string;
  description: string;
  timeLimitMinutes: string;
  passingScore: string;
  instructions: string;
}

const ROLE_OPTIONS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'ALL', label: 'Barcha rollar' },
  { value: 'USER', label: 'USER' },
  { value: 'GRADER', label: 'GRADER' },
  { value: 'CONTENT_EDITOR', label: 'CONTENT_EDITOR' },
  { value: 'ADMIN', label: 'ADMIN' },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'ACTIVE', label: 'Faol' },
  { value: 'INACTIVE', label: 'Nofaol' },
];

const TEST_STATUS_OPTIONS: Array<{ value: TestStatusFilter; label: string }> = [
  { value: 'ALL', label: 'Barcha status' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'PUBLISHED', label: 'PUBLISHED' },
  { value: 'ARCHIVED', label: 'ARCHIVED' },
];

const EDITABLE_ROLE_OPTIONS = ['USER', 'GRADER', 'CONTENT_EDITOR', 'ADMIN'] as const;

const QUESTION_TYPE_OPTIONS: Array<{ value: QuestionTypeOption; label: string }> = [
  { value: 'MCQ_SINGLE', label: 'MCQ Single' },
  { value: 'MCQ_MULTI', label: 'MCQ Multi' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'GAP_FILL', label: 'Gap Fill' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'ESSAY', label: 'Essay' },
  { value: 'SPEAKING_RESPONSE', label: 'Speaking Response' },
];

const CEFR_LEVEL_OPTIONS: Array<{ value: CefrLevelOption; label: string }> = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper-Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficiency' },
];

const DEFAULT_EXAM_FORM: CreateExamFormState = {
  title: '',
  description: '',
  cefrLevel: 'B2',
  timeLimitMinutes: '30',
  passingScore: '60',
  instructions: '',
};

const ALL_ADMIN_OPERATIONS: AdminOperationDefinition[] = [
  {
    id: 'createQuestion',
    group: 'Questions',
    label: 'Create Question',
    method: 'post',
    path: '/admin/questions',
    description: 'Create a new question',
    defaultBody: {
      sectionId: '',
      questionType: 'MCQ_SINGLE',
      prompt: 'Sample prompt',
      maxScore: 1,
      settings: {},
    },
  },
  {
    id: 'updateQuestion',
    group: 'Questions',
    label: 'Update Question',
    method: 'put',
    path: '/admin/questions/{questionId}',
    description: 'Update existing question',
    defaultBody: {
      prompt: 'Updated prompt',
      maxScore: 1,
      settings: {},
    },
  },
  {
    id: 'deleteQuestion',
    group: 'Questions',
    label: 'Delete Question',
    method: 'delete',
    path: '/admin/questions/{questionId}',
    description: 'Delete question by id',
  },

  {
    id: 'listRubrics',
    group: 'Rubrics',
    label: 'List Rubrics',
    method: 'get',
    path: '/admin/rubrics',
    description: 'List rubric pages',
    defaultQuery: { page: '0', size: '20' },
  },
  {
    id: 'createRubric',
    group: 'Rubrics',
    label: 'Create Rubric',
    method: 'post',
    path: '/admin/rubrics',
    description: 'Create scoring rubric',
    defaultBody: {
      name: 'New rubric',
      description: null,
      skill: 'SPEAKING',
      cefrLevel: 'B2',
      maxScore: 30,
      criteria: [{ name: 'Fluency', description: null, maxScore: 10, weight: 1, orderIndex: 0, levelDescriptors: null }],
    },
  },
  {
    id: 'getRubric',
    group: 'Rubrics',
    label: 'Get Rubric',
    method: 'get',
    path: '/admin/rubrics/{rubricId}',
    description: 'Get rubric details',
  },
  {
    id: 'deleteRubric',
    group: 'Rubrics',
    label: 'Delete Rubric',
    method: 'delete',
    path: '/admin/rubrics/{rubricId}',
    description: 'Delete rubric',
  },

  {
    id: 'listSubmissions',
    group: 'Submissions',
    label: 'List Submissions',
    method: 'get',
    path: '/admin/submissions',
    description: 'List attempts for scoring',
    defaultQuery: { page: '0', size: '20', status: '', testId: '', userId: '' },
  },
  {
    id: 'getSubmissionDetail',
    group: 'Submissions',
    label: 'Get Submission Detail',
    method: 'get',
    path: '/admin/submissions/{attemptId}',
    description: 'Get submission details',
  },
  {
    id: 'overrideScore',
    group: 'Submissions',
    label: 'Override Score',
    method: 'post',
    path: '/admin/submissions/{attemptId}/override',
    description: 'Manual score override',
    defaultBody: {
      targetType: 'ATTEMPT',
      targetId: '',
      newScore: 0,
      reason: 'Manual override',
    },
  },
  {
    id: 'rescoreSubmission',
    group: 'Submissions',
    label: 'Rescore Submission',
    method: 'post',
    path: '/admin/submissions/{attemptId}/rescore',
    description: 'Trigger rescore',
    defaultBody: {
      sectionId: null,
      reason: 'Re-evaluate by admin',
    },
  },
  {
    id: 'getSpeakingAnalysis',
    group: 'Submissions',
    label: 'Get Speaking Analysis',
    method: 'get',
    path: '/admin/submissions/{attemptId}/speaking-analysis',
    description: 'Get analysis payload',
  },
  {
    id: 'regenerateSpeakingAnalysis',
    group: 'Submissions',
    label: 'Regenerate Speaking Analysis',
    method: 'post',
    path: '/admin/submissions/{attemptId}/speaking-analysis/regenerate',
    description: 'Regenerate analysis',
  },

  {
    id: 'listTests',
    group: 'Tests',
    label: 'List Tests',
    method: 'get',
    path: '/admin/tests',
    description: 'List tests by status',
    defaultQuery: { page: '0', size: '20', status: '' },
  },
  {
    id: 'createTest',
    group: 'Tests',
    label: 'Create Test',
    method: 'post',
    path: '/admin/tests',
    description: 'Create test',
    defaultBody: {
      title: 'New test',
      description: null,
      cefrLevel: 'B2',
      timeLimitMinutes: 30,
      passingScore: 60,
      instructions: null,
      settings: {},
    },
  },
  {
    id: 'getTest',
    group: 'Tests',
    label: 'Get Test',
    method: 'get',
    path: '/admin/tests/{testId}',
    description: 'Get test details',
  },
  {
    id: 'updateTest',
    group: 'Tests',
    label: 'Update Test',
    method: 'put',
    path: '/admin/tests/{testId}',
    description: 'Update test',
    defaultBody: {
      title: 'Updated test',
      description: null,
      timeLimitMinutes: 30,
      passingScore: 60,
      instructions: null,
      settings: {},
    },
  },
  {
    id: 'deleteTest',
    group: 'Tests',
    label: 'Delete Test',
    method: 'delete',
    path: '/admin/tests/{testId}',
    description: 'Delete test',
  },
  {
    id: 'archiveTest',
    group: 'Tests',
    label: 'Archive Test',
    method: 'post',
    path: '/admin/tests/{testId}/archive',
    description: 'Archive test',
  },
  {
    id: 'newTestVersion',
    group: 'Tests',
    label: 'Create New Version',
    method: 'post',
    path: '/admin/tests/{testId}/new-version',
    description: 'Create version from test',
  },
  {
    id: 'publishTest',
    group: 'Tests',
    label: 'Publish Test',
    method: 'post',
    path: '/admin/tests/{testId}/publish',
    description: 'Publish test',
  },
  {
    id: 'reorderSections',
    group: 'Tests',
    label: 'Reorder Sections',
    method: 'post',
    path: '/admin/tests/{testId}/sections/reorder',
    description: 'Reorder section ids',
    defaultBody: {
      sectionIds: [''],
    },
  },

  {
    id: 'createSection',
    group: 'Sections',
    label: 'Create Section',
    method: 'post',
    path: '/admin/tests/sections',
    description: 'Create test section',
    defaultBody: {
      testId: '',
      title: 'Part 1',
      skill: 'SPEAKING',
      orderIndex: 0,
      instructions: null,
      timeLimitMinutes: 10,
      settings: {},
    },
  },
  {
    id: 'updateSection',
    group: 'Sections',
    label: 'Update Section',
    method: 'put',
    path: '/admin/tests/sections/{sectionId}',
    description: 'Update section',
    defaultBody: {
      title: 'Updated section',
      orderIndex: 0,
      instructions: null,
      timeLimitMinutes: 10,
      settings: {},
    },
  },
  {
    id: 'deleteSection',
    group: 'Sections',
    label: 'Delete Section',
    method: 'delete',
    path: '/admin/tests/sections/{sectionId}',
    description: 'Delete section',
  },
  {
    id: 'addSectionAsset',
    group: 'Sections',
    label: 'Add Section Asset',
    method: 'post',
    path: '/admin/tests/sections/{sectionId}/assets',
    description: 'Attach asset to section',
    defaultBody: {
      assetId: '',
      contextLabel: null,
      orderIndex: 0,
    },
  },
  {
    id: 'reorderSectionAssets',
    group: 'Sections',
    label: 'Reorder Section Assets',
    method: 'post',
    path: '/admin/tests/sections/{sectionId}/assets/reorder',
    description: 'Reorder section asset ids',
    defaultBody: {
      assetIds: [''],
    },
  },
  {
    id: 'removeSectionAsset',
    group: 'Sections',
    label: 'Remove Section Asset',
    method: 'delete',
    path: '/admin/tests/sections/{sectionId}/assets/{assetId}',
    description: 'Detach asset from section',
  },

  {
    id: 'listUsers',
    group: 'Users',
    label: 'List Users',
    method: 'get',
    path: '/admin/users',
    description: 'List users by filters',
    defaultQuery: { page: '0', size: '20', search: '', role: '', isActive: '' },
  },
  {
    id: 'getUser',
    group: 'Users',
    label: 'Get User',
    method: 'get',
    path: '/admin/users/{id}',
    description: 'Get user details',
  },
  {
    id: 'deleteUser',
    group: 'Users',
    label: 'Delete User',
    method: 'delete',
    path: '/admin/users/{id}',
    description: 'Delete user',
  },
  {
    id: 'blockUser',
    group: 'Users',
    label: 'Block User',
    method: 'post',
    path: '/admin/users/{id}/block',
    description: 'Block user access',
  },
  {
    id: 'unblockUser',
    group: 'Users',
    label: 'Unblock User',
    method: 'post',
    path: '/admin/users/{id}/unblock',
    description: 'Unblock user',
  },
  {
    id: 'grantAccessUser',
    group: 'Users',
    label: 'Grant Access',
    method: 'post',
    path: '/admin/users/{id}/grant-access',
    description: 'Grant premium dates',
    defaultBody: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'removeAccessUser',
    group: 'Users',
    label: 'Remove Access',
    method: 'post',
    path: '/admin/users/{id}/remove-access',
    description: 'Remove premium access',
  },
  {
    id: 'updateUserRoles',
    group: 'Users',
    label: 'Update User Roles',
    method: 'put',
    path: '/admin/users/{id}/roles',
    description: 'Set user roles',
    defaultBody: {
      roles: ['USER'],
    },
  },
];

interface AvatarRecord {
  user_id: string;
  avatar_url: string;
  updated_at: string;
}

type AdminUserRecord = AdminUser;
type PagedAdminUserResponse = PagedResponse<AdminUserRecord> & { totalCount?: number };
type AdminTestRecord = AdminTest;
type PagedAdminTestResponse = PagedResponse<AdminTestRecord> & { totalCount?: number };

interface AdminAvatarsPanelProps {
  avatars: AvatarRecord[];
  loading: boolean;
  deleting: string | null;
  error: string;
  onDelete: (userId: string) => void;
  onRefresh: () => void;
  userByUserId: Record<string, AdminUser>;
}

interface AdminUsersPanelProps {
  avatarUrlByUserId: Record<string, string>;
}

interface UserActionState {
  userId: string;
  action: 'premium' | 'removePremium' | 'block' | 'unblock' | 'edit' | 'delete';
}

interface TestActionState {
  testId: string;
  action: 'edit' | 'delete' | 'publish' | 'archive' | 'newVersion';
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('uz-UZ');
};

const formatFullName = (user: AdminUserRecord) => {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return fullName || '-';
};

const getUserInitials = (user: AdminUserRecord) => {
  const fullName = formatFullName(user);
  if (fullName !== '-') {
    const parts = fullName.split(' ').filter(Boolean);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }

  const phone = (user.phone || '').replace(/\D/g, '');
  return phone.slice(-2) || 'U';
};

const toIsoDateTime = (value: string, endOfDay = false) => {
  return endOfDay ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`;
};

const toDateInputValue = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const isPremiumUser = (user: AdminUserRecord) => {
  if (!user.endDate) return false;
  const endTime = Date.parse(user.endDate);
  if (Number.isNaN(endTime)) return false;
  return endTime > Date.now();
};

const getTestStatusBadgeTone = (status: TestStatus) => {
  if (status === 'PUBLISHED') return 'success' as const;
  if (status === 'DRAFT') return 'orange' as const;
  return 'neutral' as const;
};

const toEditExamFormState = (exam: AdminTestRecord): EditExamFormState => {
  return {
    title: exam.title ?? '',
    description: exam.description ?? '',
    timeLimitMinutes: exam.timeLimitMinutes == null ? '' : String(exam.timeLimitMinutes),
    passingScore: exam.passingScore == null ? '' : String(exam.passingScore),
    instructions: exam.instructions ?? '',
  };
};

// ── Login ────────────────────────────────────────────────────────────────────

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'islam' && password === 'islam2006') {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      onLogin();
    } else {
      setError("Login yoki parol noto'g'ri");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        <AdminCard rounded="2xl" tone="surface" className="p-8 bg-white/[0.04] border-white/10">
          <h1 className="text-xl font-black text-white mb-1">Admin Panel</h1>
          <p className="text-white/40 text-sm mb-8">ManageLC Control Center</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminInputField
              label="Login"
              value={login}
              onChange={(value) => {
                setLogin(value);
                setError('');
              }}
              autoFocus
              labelClassName="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2"
              inputClassName="px-4 py-3 rounded-xl placeholder-white/20"
            />
            <AdminInputField
              label="Parol"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setError('');
              }}
              labelClassName="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2"
              inputClassName="px-4 py-3 rounded-xl placeholder-white/20"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <AdminButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              className="rounded-xl bg-orange-500 text-white hover:bg-orange-400"
            >
              Kirish
            </AdminButton>
          </form>
        </AdminCard>
      </div>
    </div>
  );
};

const SidebarButton: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition ${
        active
          ? 'bg-orange-500/15 border border-orange-500/30 text-orange-300'
          : 'border border-transparent text-white/60 hover:text-white/85 hover:bg-white/[0.04]'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const EnhancedPagination: React.FC<{
  page: number;
  totalPages: number;
  from: number;
  to: number;
  totalCount: number;
  onPageChange: (next: number) => void;
}> = ({ page, totalPages, from, to, totalCount, onPageChange }) => {
  const current = page + 1;
  const pages: number[] = [];

  const add = (value: number) => {
    if (value >= 1 && value <= totalPages && !pages.includes(value)) pages.push(value);
  };

  add(1);
  add(current - 1);
  add(current);
  add(current + 1);
  add(totalPages);

  const sorted = [...pages].sort((a, b) => a - b);
  const navButtonClass = 'px-2.5 py-1.5 rounded-lg border border-white/10 text-white/65 hover:text-white hover:border-white/20 disabled:opacity-35 disabled:cursor-not-allowed text-xs';

  return (
    <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div className="text-white/50 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2">
        Ko'rsatilmoqda: <span className="text-white/80">{from}-{to}</span> / <span className="text-white font-semibold">{totalCount}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => onPageChange(0)} disabled={page === 0} className={navButtonClass}>
          {'<<'}
        </button>
        <button onClick={() => onPageChange(Math.max(page - 1, 0))} disabled={page === 0} className={navButtonClass}>
          Oldingi
        </button>

        {sorted.map((p, idx) => {
          const prev = sorted[idx - 1];
          const showGap = prev && p - prev > 1;
          const active = p === current;

          return (
            <React.Fragment key={p}>
              {showGap && <span className="text-white/30 px-1">...</span>}
              <button
                onClick={() => onPageChange(p - 1)}
                className={`min-w-8 px-2.5 py-1.5 rounded-lg text-xs border transition ${
                  active
                    ? 'border-orange-500/40 bg-orange-500/15 text-orange-300 font-bold'
                    : 'border-white/10 text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
          disabled={page + 1 >= totalPages}
          className={navButtonClass}
        >
          Keyingi
        </button>
        <button onClick={() => onPageChange(totalPages - 1)} disabled={page + 1 >= totalPages} className={navButtonClass}>
          {'>>'}
        </button>
      </div>
    </div>
  );
};

const CreateExamPanel: React.FC = () => {
  const [form, setForm] = useState<CreateExamFormState>({ ...DEFAULT_EXAM_FORM });
  const [resultText, setResultText] = useState('');
  const createTestMutation = useCreateAdminTestMutation();
  const isSubmitting = createTestMutation.isPending;

  const updateField = <K extends keyof CreateExamFormState>(
    field: K,
    value: CreateExamFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ ...DEFAULT_EXAM_FORM });
    setResultText('');
  };

  const buildPayload = () => {
    const title = form.title.trim();
    if (!title) {
      throw new Error('Exam nomi majburiy');
    }

    const parseOptionalNumber = (
      rawValue: string,
      fieldName: string,
      options: { integer?: boolean; min?: number } = {},
    ) => {
      const trimmed = rawValue.trim();
      if (!trimmed) return null;

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        throw new Error(`${fieldName} son bo'lishi kerak`);
      }

      if (options.integer && !Number.isInteger(parsed)) {
        throw new Error(`${fieldName} butun son bo'lishi kerak`);
      }

      if (typeof options.min === 'number' && parsed < options.min) {
        throw new Error(`${fieldName} ${options.min} dan kichik bo'lmasligi kerak`);
      }

      return parsed;
    };

    const toNullableText = (value: string) => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    return {
      title,
      description: toNullableText(form.description),
      cefrLevel: form.cefrLevel,
      timeLimitMinutes: parseOptionalNumber(form.timeLimitMinutes, 'Vaqt limiti', { integer: true, min: 1 }),
      passingScore: parseOptionalNumber(form.passingScore, 'Passing score', { min: 0 }),
      instructions: toNullableText(form.instructions),
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payload = buildPayload();
      const response = await createTestMutation.mutateAsync(payload);
      setResultText(JSON.stringify(response, null, 2));
      showToast.success('Exam muvaffaqiyatli yaratildi');
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown } })?.response?.data;
      showToast.error(extractApiErrorMessage(error, 'Exam yaratishda xatolik yuz berdi'));
      setResultText(JSON.stringify(responseData ?? { message: extractApiErrorMessage(error) }, null, 2));
    }
  };

  return (
    <AdminCard rounded="2xl" className="p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-white font-black text-lg">Exam qo'shish</h3>
        <p className="text-white/45 text-xs mt-1">OpenAPI dagi `CreateTestRequest` asosida form</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AdminInputField
            label="Exam nomi"
            value={form.title}
            onChange={(value) => updateField('title', value)}
            placeholder="Masalan: IELTS Speaking Mock Test 1"
            required
            disabled={isSubmitting}
          />

          <AdminSelectField
            label="CEFR Level"
            value={form.cefrLevel}
            options={CEFR_LEVEL_OPTIONS}
            onChange={(value) => updateField('cefrLevel', value as CefrLevelOption)}
            required
            disabled={isSubmitting}
          />

          <AdminInputField
            label="Time limit (minute)"
            value={form.timeLimitMinutes}
            onChange={(value) => updateField('timeLimitMinutes', value)}
            type="number"
            min={1}
            step={1}
            hint="Bo'sh qoldirilsa backend default ishlatiladi"
            disabled={isSubmitting}
          />

          <AdminInputField
            label="Passing score"
            value={form.passingScore}
            onChange={(value) => updateField('passingScore', value)}
            type="number"
            min={0}
            step="any"
            hint="Masalan: 60 yoki 75.5"
            disabled={isSubmitting}
          />
        </div>

        <AdminTextareaField
          label="Description"
          value={form.description}
          onChange={(value) => updateField('description', value)}
          placeholder="Exam haqida qisqa izoh"
          rows={3}
          disabled={isSubmitting}
        />

        <AdminTextareaField
          label="Instructions"
          value={form.instructions}
          onChange={(value) => updateField('instructions', value)}
          placeholder="Foydalanuvchiga ko'rsatish uchun yo'riqnoma"
          rows={4}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-end gap-2">
          <AdminButton
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            variant="ghost"
            size="sm"
          >
            Tozalash
          </AdminButton>
          <AdminButton
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="sm"
          >
            {isSubmitting ? 'Yaratilmoqda...' : 'Exam yaratish'}
          </AdminButton>
        </div>
      </form>

      {resultText ? (
        <AdminCard tone="dark" padding="sm" className="mt-4 overflow-x-auto bg-[#0a0a0a]">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">So'nggi javob</p>
          <pre className="text-[12px] leading-5 text-white/85 whitespace-pre-wrap">{resultText}</pre>
        </AdminCard>
      ) : null}
    </AdminCard>
  );
};

const AdminExamsPanel: React.FC = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<TestStatusFilter>('ALL');
  const [actionState, setActionState] = useState<TestActionState | null>(null);
  const [editingExam, setEditingExam] = useState<AdminTestRecord | null>(null);
  const [editForm, setEditForm] = useState<EditExamFormState>({
    title: '',
    description: '',
    timeLimitMinutes: '',
    passingScore: '',
    instructions: '',
  });

  const updateTestMutation = useUpdateAdminTestMutation();
  const deleteTestMutation = useDeleteAdminTestMutation();
  const publishTestMutation = usePublishAdminTestMutation();
  const archiveTestMutation = useArchiveAdminTestMutation();
  const createVersionMutation = useCreateAdminTestVersionMutation();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useAdminTestsQuery({
    page,
    size: PAGE_SIZE,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const testsPageData = (data ?? { items: [] }) as PagedAdminTestResponse;
  const tests = Array.isArray(testsPageData.items) ? testsPageData.items : [];
  const apiPageSize =
    typeof testsPageData.size === 'number' && testsPageData.size > 0
      ? testsPageData.size
      : PAGE_SIZE;

  const totalRaw =
    testsPageData.totalCount ?? testsPageData.total ?? (page * apiPageSize + tests.length);
  const normalizedTotal =
    typeof totalRaw === 'number'
      ? totalRaw
      : Number(totalRaw);
  const totalCount = Number.isFinite(normalizedTotal) ? normalizedTotal : tests.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / apiPageSize));

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  const errorStatus = (error as { response?: { status?: number; data?: { message?: string } } } | null)?.response?.status;
  const errorMessage = (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
  const from = totalCount === 0 ? 0 : page * apiPageSize + 1;
  const to = totalCount === 0 ? 0 : Math.min((page + 1) * apiPageSize, totalCount);

  const isTestActionLoading = (testId: string, action: TestActionState['action']) => {
    return actionState?.testId === testId && actionState?.action === action;
  };

  const runTestAction = async (
    testId: string,
    action: TestActionState['action'],
    fn: () => Promise<void>,
    successMessage: string,
  ) => {
    setActionState({ testId, action });
    try {
      await fn();
      showToast.success(successMessage);
      await refetch();
    } catch (err) {
      showToast.error(extractApiErrorMessage(err, 'Exam amali bajarilmadi'));
    } finally {
      setActionState(null);
    }
  };

  const updateEditField = <K extends keyof EditExamFormState>(
    field: K,
    value: EditExamFormState[K],
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const openEditModal = (exam: AdminTestRecord) => {
    setEditingExam(exam);
    setEditForm(toEditExamFormState(exam));
  };

  const handleSaveEdit = async () => {
    if (!editingExam) return;

    const title = editForm.title.trim();
    if (!title) {
      showToast.error('Exam nomi majburiy');
      return;
    }

    const parseOptionalNumber = (
      rawValue: string,
      fieldName: string,
      options: { integer?: boolean; min?: number } = {},
    ) => {
      const trimmed = rawValue.trim();
      if (!trimmed) return null;

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        throw new Error(`${fieldName} son bo'lishi kerak`);
      }

      if (options.integer && !Number.isInteger(parsed)) {
        throw new Error(`${fieldName} butun son bo'lishi kerak`);
      }

      if (typeof options.min === 'number' && parsed < options.min) {
        throw new Error(`${fieldName} ${options.min} dan kichik bo'lmasligi kerak`);
      }

      return parsed;
    };

    const toNullableText = (value: string) => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    try {
      const payload = {
        title,
        description: toNullableText(editForm.description),
        timeLimitMinutes: parseOptionalNumber(editForm.timeLimitMinutes, 'Vaqt limiti', { integer: true, min: 1 }),
        passingScore: parseOptionalNumber(editForm.passingScore, 'Passing score', { min: 0 }),
        instructions: toNullableText(editForm.instructions),
      };

      await runTestAction(
        editingExam.id,
        'edit',
        async () => {
          await updateTestMutation.mutateAsync({
            testId: editingExam.id,
            payload,
          });
        },
        'Exam yangilandi',
      );
      setEditingExam(null);
    } catch (err) {
      if (err instanceof Error) {
        showToast.error(err.message);
      } else {
        showToast.error('Examni yangilashda xatolik yuz berdi');
      }
    }
  };

  const handleDelete = async (exam: AdminTestRecord) => {
    if (!window.confirm(`"${exam.title}" examini o'chirishni tasdiqlaysizmi?`)) return;

    await runTestAction(
      exam.id,
      'delete',
      async () => {
        await deleteTestMutation.mutateAsync(exam.id);
      },
      'Exam o\'chirildi',
    );
  };

  const handlePublish = async (exam: AdminTestRecord) => {
    await runTestAction(
      exam.id,
      'publish',
      async () => {
        await publishTestMutation.mutateAsync(exam.id);
      },
      'Exam publish qilindi',
    );
  };

  const handleArchive = async (exam: AdminTestRecord) => {
    await runTestAction(
      exam.id,
      'archive',
      async () => {
        await archiveTestMutation.mutateAsync(exam.id);
      },
      'Exam archive qilindi',
    );
  };

  const handleCreateVersion = async (exam: AdminTestRecord) => {
    await runTestAction(
      exam.id,
      'newVersion',
      async () => {
        await createVersionMutation.mutateAsync(exam.id);
      },
      'Yangi exam versiyasi yaratildi',
    );
  };

  return (
    <div>
      <AdminCard className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3 items-center">
          <AdminSelectField
            label="Status"
            hideLabel
            value={statusFilter}
            options={TEST_STATUS_OPTIONS}
            onChange={(value) => {
              setStatusFilter(value as TestStatusFilter);
              setPage(0);
            }}
            placeholder="Status tanlang"
          />

          <p className="text-white/45 text-xs md:text-sm">
            Barcha examlar ro'yxati. Bu yerda edit, delete, publish, archive va new version amallari bor.
          </p>

          <AdminButton
            onClick={() => refetch()}
            variant="secondary"
            size="sm"
          >
            {isFetching ? <AdminSpinner size="sm" tone="neutral" /> : 'Yangilash'}
          </AdminButton>
        </div>
      </AdminCard>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <AdminSpinner size="md" tone="primary" />
        </div>
      )}

      {!isLoading && error && (
        <AdminCard className="px-5 py-4 text-red-400 text-sm border-red-500/20 bg-red-500/5">
          {errorStatus === 403
            ? 'Bu amal uchun ADMIN huquqi kerak.'
            : errorStatus === 401
              ? 'Siz tizimga qayta kirishingiz kerak.'
              : errorMessage || 'Examlar ro\'yxatini olishda xatolik.'}
        </AdminCard>
      )}

      {!isLoading && !error && tests.length === 0 && (
        <AdminCard tone="muted" className="text-center py-20 text-white/30">
          <p>Hali examlar topilmadi</p>
        </AdminCard>
      )}

      {!isLoading && !error && tests.length > 0 && (
        <>
          <AdminCard className="overflow-hidden" padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.07] text-white/60 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Exam</th>
                    <th className="text-left px-4 py-3">Level</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Version</th>
                    <th className="text-left px-4 py-3">Time</th>
                    <th className="text-left px-4 py-3">Passing</th>
                    <th className="text-left px-4 py-3">Yangilangan</th>
                    <th className="text-left px-4 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((exam) => (
                    <tr key={exam.id} className="border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.025]">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{exam.title}</p>
                        <p className="text-white/35 text-[11px] font-mono">{exam.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-3 text-white/75">{exam.cefrLevel}</td>
                      <td className="px-4 py-3">
                        <AdminBadge tone={getTestStatusBadgeTone(exam.status)}>
                          {exam.status}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3 text-white/70">v{exam.version}</td>
                      <td className="px-4 py-3 text-white/65">{exam.timeLimitMinutes ?? '-'}</td>
                      <td className="px-4 py-3 text-white/65">{exam.passingScore ?? '-'}</td>
                      <td className="px-4 py-3 text-white/55">{formatDate(exam.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5 min-w-[340px]">
                          <AdminButton
                            onClick={() => openEditModal(exam)}
                            disabled={isTestActionLoading(exam.id, 'edit')}
                            variant="info"
                            size="chip"
                          >
                            {isTestActionLoading(exam.id, 'edit') ? '...' : 'Edit'}
                          </AdminButton>

                          {exam.status !== 'PUBLISHED' && (
                            <AdminButton
                              onClick={() => handlePublish(exam)}
                              disabled={isTestActionLoading(exam.id, 'publish')}
                              variant="success"
                              size="chip"
                            >
                              {isTestActionLoading(exam.id, 'publish') ? '...' : 'Publish'}
                            </AdminButton>
                          )}

                          {exam.status !== 'ARCHIVED' && (
                            <AdminButton
                              onClick={() => handleArchive(exam)}
                              disabled={isTestActionLoading(exam.id, 'archive')}
                              variant="warning"
                              size="chip"
                            >
                              {isTestActionLoading(exam.id, 'archive') ? '...' : 'Archive'}
                            </AdminButton>
                          )}

                          <AdminButton
                            onClick={() => handleCreateVersion(exam)}
                            disabled={isTestActionLoading(exam.id, 'newVersion')}
                            variant="secondary"
                            size="chip"
                          >
                            {isTestActionLoading(exam.id, 'newVersion') ? '...' : 'New version'}
                          </AdminButton>

                          <AdminButton
                            onClick={() => handleDelete(exam)}
                            disabled={isTestActionLoading(exam.id, 'delete')}
                            variant="rose"
                            size="chip"
                          >
                            {isTestActionLoading(exam.id, 'delete') ? '...' : 'Delete'}
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <EnhancedPagination
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </>
      )}

      {editingExam && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditingExam(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <h3 className="text-white font-black text-lg">Exam edit</h3>
            <p className="text-white/45 text-xs mt-1 mb-4">{editingExam.id.slice(0, 8)}...</p>

            <div className="space-y-4">
              <AdminInputField
                label="Exam nomi"
                value={editForm.title}
                onChange={(value) => updateEditField('title', value)}
                required
              />

              <AdminTextareaField
                label="Description"
                value={editForm.description}
                onChange={(value) => updateEditField('description', value)}
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminInputField
                  label="Time limit (minute)"
                  type="number"
                  min={1}
                  step={1}
                  value={editForm.timeLimitMinutes}
                  onChange={(value) => updateEditField('timeLimitMinutes', value)}
                />
                <AdminInputField
                  label="Passing score"
                  type="number"
                  min={0}
                  step="any"
                  value={editForm.passingScore}
                  onChange={(value) => updateEditField('passingScore', value)}
                />
              </div>

              <AdminTextareaField
                label="Instructions"
                value={editForm.instructions}
                onChange={(value) => updateEditField('instructions', value)}
                rows={4}
              />

              <div className="flex justify-end gap-2 pt-1">
                <AdminButton
                  onClick={() => setEditingExam(null)}
                  variant="ghost"
                  size="sm"
                >
                  Bekor qilish
                </AdminButton>
                <AdminButton
                  onClick={handleSaveEdit}
                  disabled={isTestActionLoading(editingExam.id, 'edit')}
                  variant="primary"
                  size="sm"
                >
                  {isTestActionLoading(editingExam.id, 'edit') ? 'Saqlanmoqda...' : 'Saqlash'}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateQuestionStructurePanel: React.FC = () => {
  const [questionType, setQuestionType] = useState<QuestionTypeOption>('MCQ_SINGLE');

  const requestTemplate = useMemo(() => {
    return {
      sectionId: '<UUID>',
      questionType,
      orderIndex: 1,
      prompt: 'Savol matni',
      promptAudioAssetId: null,
      promptImageAssetId: null,
      maxScore: 1,
      settings: {
        prepTimeSec: 30,
        recordTimeSec: 60,
      },
      explanation: null,
      options: [
        {
          label: 'A',
          content: 'Variant A',
          contentImageAssetId: null,
          orderIndex: 0,
          isCorrect: true,
          scoreWeight: 1,
          matchTarget: null,
        },
      ],
      expectedAnswers: [
        {
          answerKey: null,
          acceptedValues: ['sample'],
          isCaseSensitive: false,
          isRegex: false,
          scoreWeight: 1,
        },
      ],
      rubricId: null,
    };
  }, [questionType]);

  return (
    <AdminCard rounded="2xl" className="p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white font-black text-lg">Exam savol yaratish struktura</h3>
          <p className="text-white/45 text-xs mt-1">OpenAPI `CreateQuestionRequest` ga mos</p>
        </div>
        <div className="w-full md:w-64">
          <AdminSelectField
            label="Question Type"
            hideLabel
            value={questionType}
            options={QUESTION_TYPE_OPTIONS}
            onChange={(value) => setQuestionType(value as QuestionTypeOption)}
            placeholder="Savol turini tanlang"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard tone="dark" padding="sm">
          <p className="text-white/55 text-xs uppercase tracking-wider mb-2">Endpoint</p>
          <p className="text-orange-300 text-sm font-mono">POST /admin/questions</p>
          <p className="text-white/45 text-xs mt-2">Majburiy maydonlar: `sectionId`, `questionType`, `prompt`</p>
        </AdminCard>
        <AdminCard tone="dark" padding="sm">
          <p className="text-white/55 text-xs uppercase tracking-wider mb-2">Qo'llab-quvvatlanadigan turlar</p>
          <div className="flex flex-wrap gap-1.5">
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <AdminBadge
                key={option.value}
                tone={option.value === questionType ? 'orange' : 'neutral'}
                className={option.value === questionType ? '' : 'text-white/65 border-white/15 bg-white/[0.03]'}
              >
                {option.value}
              </AdminBadge>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard tone="dark" padding="sm" className="mt-4 overflow-x-auto bg-[#0a0a0a]">
        <pre className="text-[12px] leading-5 text-white/85 whitespace-pre-wrap">{JSON.stringify(requestTemplate, null, 2)}</pre>
      </AdminCard>
    </AdminCard>
  );
};

const AdminOperationsPanel: React.FC = () => {
  const [selectedOperationId, setSelectedOperationId] = useState(ALL_ADMIN_OPERATIONS[0].id);
  const [pathParamsText, setPathParamsText] = useState('{}');
  const [queryText, setQueryText] = useState(JSON.stringify(ALL_ADMIN_OPERATIONS[0].defaultQuery ?? {}, null, 2));
  const [bodyText, setBodyText] = useState(JSON.stringify(ALL_ADMIN_OPERATIONS[0].defaultBody ?? {}, null, 2));
  const [running, setRunning] = useState(false);
  const [resultText, setResultText] = useState('');

  const operation = useMemo(() => {
    return ALL_ADMIN_OPERATIONS.find((item) => item.id === selectedOperationId) ?? ALL_ADMIN_OPERATIONS[0];
  }, [selectedOperationId]);

  useEffect(() => {
    setPathParamsText('{}');
    setQueryText(JSON.stringify(operation.defaultQuery ?? {}, null, 2));
    setBodyText(JSON.stringify(operation.defaultBody ?? {}, null, 2));
  }, [operation]);

  const executeOperation = async () => {
    setRunning(true);
    setResultText('');
    try {
      const parsedPathParams = JSON.parse(pathParamsText || '{}') as Record<string, string>;
      const parsedQuery = JSON.parse(queryText || '{}') as Record<string, string>;
      const parsedBody = JSON.parse(bodyText || '{}') as Record<string, unknown>;

      let resolvedPath = operation.path;
      Object.entries(parsedPathParams).forEach(([key, value]) => {
        resolvedPath = resolvedPath.replace(`{${key}}`, String(value));
      });

      const query = Object.fromEntries(
        Object.entries(parsedQuery).filter(([, value]) => value !== '' && value !== null && value !== undefined),
      );

      const config = {
        url: resolvedPath,
        method: operation.method,
        params: operation.method === 'get' ? query : undefined,
        data: operation.method !== 'get' && operation.method !== 'delete' ? parsedBody : undefined,
      } as const;

      const response = await apiClient.request(config);
      setResultText(JSON.stringify(response.data, null, 2));
      showToast.success('Admin operation muvaffaqiyatli bajarildi');
    } catch (error) {
      const err = error as { response?: { status?: number; data?: unknown }; message?: string };
      const payload = {
        status: err.response?.status,
        data: err.response?.data,
        message: extractApiErrorMessage(error, err.message),
      };
      setResultText(JSON.stringify(payload, null, 2));
      showToast.error('Admin operation xatolik bilan tugadi');
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminCard rounded="2xl" className="p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-white font-black text-lg">Backend admin amallari</h3>
        <p className="text-white/45 text-xs mt-1">OpenAPI dagi barcha `/admin/*` endpointlarni test qilish paneli</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <AdminCard tone="dark" padding="sm" className="max-h-[620px] overflow-auto">
          <div className="space-y-4">
            {Array.from(new Set(ALL_ADMIN_OPERATIONS.map((item) => item.group))).map((group) => (
              <div key={group}>
                <p className="text-white/45 text-[11px] uppercase tracking-wider mb-1.5">{group}</p>
                <div className="space-y-1">
                  {ALL_ADMIN_OPERATIONS.filter((item) => item.group === group).map((item) => (
                    <AdminButton
                      key={item.id}
                      onClick={() => setSelectedOperationId(item.id)}
                      variant={selectedOperationId === item.id ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full justify-start text-left px-2.5 py-2 rounded-lg"
                    >
                      <span className="font-semibold uppercase mr-1">{item.method}</span>
                      {item.label}
                    </AdminButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <div className="space-y-3">
          <AdminCard tone="dark" padding="sm">
            <p className="text-white/50 text-xs uppercase tracking-wider">Tanlangan amal</p>
            <p className="text-white mt-1 font-semibold">{operation.label}</p>
            <p className="text-orange-300 font-mono text-sm mt-1">{operation.method.toUpperCase()} {operation.path}</p>
            <p className="text-white/45 text-xs mt-1">{operation.description}</p>
          </AdminCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AdminTextareaField
              label="Path params JSON"
              value={pathParamsText}
              onChange={setPathParamsText}
              rows={4}
              textareaClassName="min-h-[90px] bg-[#0e0e0e] text-xs font-mono"
            />
            <AdminTextareaField
              label="Query JSON"
              value={queryText}
              onChange={setQueryText}
              rows={4}
              textareaClassName="min-h-[90px] bg-[#0e0e0e] text-xs font-mono"
            />
          </div>

          <AdminTextareaField
            label="Body JSON"
            value={bodyText}
            onChange={setBodyText}
            rows={7}
            textareaClassName="min-h-[170px] bg-[#0e0e0e] text-xs font-mono"
          />

          <div className="flex items-center gap-2">
            <AdminButton
              onClick={executeOperation}
              disabled={running}
              variant="primary"
              size="sm"
            >
              {running ? 'Bajarilmoqda...' : 'Operationni bajarish'}
            </AdminButton>
          </div>

          <AdminTextareaField
            label="Javob"
            value={resultText}
            onChange={setResultText}
            rows={9}
            readOnly
            textareaClassName="min-h-[220px] bg-[#090909] text-xs font-mono text-white/85"
          />
        </div>
      </div>
    </AdminCard>
  );
};

const AdminAvatarsPanel: React.FC<AdminAvatarsPanelProps> = ({
  avatars,
  loading,
  deleting,
  error,
  onDelete,
  onRefresh,
  userByUserId,
}) => {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-white/45 text-sm">Jami avatar: {avatars.length}</p>
        <AdminButton
          onClick={onRefresh}
          variant="secondary"
          size="sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yangilash
        </AdminButton>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <AdminSpinner size="md" tone="primary" />
        </div>
      )}

      {error && (
        <AdminCard className="px-5 py-4 text-red-400 text-sm border-red-500/20 bg-red-500/5">
          {error}
          {error.includes('ADMIN') && (
            <p className="text-white/35 text-xs mt-1">
              Joriy token ADMIN huquqiga ega emas. Avval ADMIN akkaunt bilan login qiling.
            </p>
          )}
        </AdminCard>
      )}

      {!loading && !error && avatars.length === 0 && (
        <AdminCard tone="muted" className="text-center py-20 text-white/30">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Hali hech qanday rasm yuklanmagan</p>
        </AdminCard>
      )}

      {!loading && avatars.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {avatars.map((avatar) => (
            <AdminCard key={avatar.user_id} tone="muted" padding="none" className="overflow-hidden">
              <div className="aspect-square bg-white/[0.03] relative">
                <img
                  src={avatar.avatar_url}
                  alt={avatar.user_id}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="p-2.5">
                {(() => {
                  const u = userByUserId[avatar.user_id];
                  const name = u ? formatFullName(u) : null;
                  const phone = u?.phone ?? null;
                  return (
                    <>
                      {name && name !== '-' && (
                        <p className="text-white/80 text-[11px] font-semibold truncate leading-tight" title={name}>
                          {name}
                        </p>
                      )}
                      {phone && (
                        <p className="text-white/45 text-[10px] truncate mt-0.5" title={phone}>
                          {phone}
                        </p>
                      )}
                      {!u && (
                        <p className="text-white/30 text-[10px] font-mono truncate" title={avatar.user_id}>
                          {avatar.user_id.slice(0, 8)}...
                        </p>
                      )}
                    </>
                  );
                })()}
                <p className="text-white/25 text-[10px] mt-0.5">{formatDate(avatar.updated_at)}</p>

                <AdminButton
                  onClick={() => onDelete(avatar.user_id)}
                  disabled={deleting === avatar.user_id}
                  variant="danger"
                  size="chip"
                  fullWidth
                  className="mt-2"
                >
                  {deleting === avatar.user_id ? (
                    <AdminSpinner size="sm" tone="neutral" />
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  O'chirish
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminUsersPanel: React.FC<AdminUsersPanelProps> = ({ avatarUrlByUserId }) => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [actionState, setActionState] = useState<UserActionState | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    premium: 0,
    regular: 0,
    loading: true,
    error: '',
  });
  const blockUserMutation = useBlockAdminUserMutation();
  const unblockUserMutation = useUnblockAdminUserMutation();
  const grantAccessMutation = useGrantAdminUserAccessMutation();
  const removeAccessMutation = useRemoveAdminUserAccessMutation();
  const deleteUserMutation = useDeleteAdminUserMutation();
  const updateRolesMutation = useUpdateAdminUserRolesMutation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  const fetchUserStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      let pageIndex = 0;
      const size = 200;
      let totalCount = 0;
      let premiumCount = 0;
      let regularCount = 0;

      while (pageIndex < 200) {
        const response = (await adminUsersApi.list({
          page: pageIndex,
          size,
        })) as PagedAdminUserResponse;

        const items = Array.isArray(response?.items) ? response.items : [];

        if (pageIndex === 0) {
          if (typeof response?.totalCount === 'number') totalCount = response.totalCount;
          else if (typeof response?.total === 'number') totalCount = response.total;
        }

        for (const user of items) {
          if (isPremiumUser(user)) premiumCount += 1;
          else regularCount += 1;
        }

        const knownTotal = totalCount > 0 ? totalCount : premiumCount + regularCount;
        if (items.length === 0 || (pageIndex + 1) * size >= knownTotal) break;
        pageIndex += 1;
      }

      const total = totalCount > 0 ? totalCount : premiumCount + regularCount;
      setStats({
        total,
        premium: premiumCount,
        regular: regularCount,
        loading: false,
        error: '',
      });
    } catch {
      setStats((prev) => ({ ...prev, loading: false, error: "Statistikani yuklab bo'lmadi" }));
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useAdminUsersQuery({
    isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    page,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    search: search || undefined,
    size: PAGE_SIZE,
  });

  const usersPageData = (data ?? { items: [] }) as PagedAdminUserResponse;
  const users = Array.isArray(usersPageData.items) ? usersPageData.items : [];
  const apiPageSize =
    typeof usersPageData.size === 'number' && usersPageData.size > 0
      ? usersPageData.size
      : PAGE_SIZE;

  const totalRaw =
    usersPageData.totalCount ?? usersPageData.total ?? (page * apiPageSize + users.length);
  const normalizedTotal =
    typeof totalRaw === 'number'
      ? totalRaw
      : Number(totalRaw);
  const totalCount = Number.isFinite(normalizedTotal) ? normalizedTotal : users.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / apiPageSize));

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  const errorStatus = (error as { response?: { status?: number; data?: { message?: string } } } | null)?.response?.status;
  const errorMessage = (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
  const from = totalCount === 0 ? 0 : page * apiPageSize + 1;
  const to = totalCount === 0 ? 0 : Math.min((page + 1) * apiPageSize, totalCount);

  const isUserActionLoading = (
    userId: string,
    action: UserActionState['action'],
  ) => {
    return actionState?.userId === userId && actionState?.action === action;
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([refetch(), fetchUserStats()]);
  }, [refetch, fetchUserStats]);

  const runUserAction = async (
    userId: string,
    action: UserActionState['action'],
    fn: () => Promise<void>,
  ) => {
    setActionState({ userId, action });
    try {
      await fn();
      await refreshAll();
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Amalni bajarishda xatolik yuz berdi'));
    } finally {
      setActionState(null);
    }
  };

  const handleBlock = async (user: AdminUserRecord) => {
    await runUserAction(user.id, 'block', async () => {
      await blockUserMutation.mutateAsync(user.id);
      showToast.success('User block qilindi');
    });
  };

  const handleUnblock = async (user: AdminUserRecord) => {
    await runUserAction(user.id, 'unblock', async () => {
      await unblockUserMutation.mutateAsync(user.id);
      showToast.success('User unblock qilindi');
    });
  };

  const handleGrantPremium = async (user: AdminUserRecord) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    await runUserAction(user.id, 'premium', async () => {
      await grantAccessMutation.mutateAsync({
        userId: user.id,
        payload: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      showToast.success('Premium access berildi (1 oy)');
    });
  };

  const handleRemovePremium = async (user: AdminUserRecord) => {
    await runUserAction(user.id, 'removePremium', async () => {
      await removeAccessMutation.mutateAsync(user.id);
      showToast.success('Premium access olib tashlandi');
    });
  };

  const handleDeleteUser = async (user: AdminUserRecord) => {
    await runUserAction(user.id, 'delete', async () => {
      await deleteUserMutation.mutateAsync(user.id);
      showToast.success('User o\'chirildi');
      setShowDeleteConfirmId(null);
    });
  };

  const openEditModal = (user: AdminUserRecord) => {
    setEditingUser(user);
    setEditRoles(user.roles.length ? [...user.roles] : ['USER']);
    setEditStartDate(toDateInputValue(user.startDate));
    setEditEndDate(toDateInputValue(user.endDate));
  };

  const toggleEditRole = (role: string) => {
    setEditRoles((prev) => {
      if (prev.includes(role)) {
        const next = prev.filter((r) => r !== role);
        return next.length ? next : ['USER'];
      }
      return [...prev, role];
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    await runUserAction(editingUser.id, 'edit', async () => {
      await updateRolesMutation.mutateAsync({
        userId: editingUser.id,
        payload: { roles: editRoles as Role[] },
      });

      if (editStartDate && editEndDate) {
        await grantAccessMutation.mutateAsync({
          userId: editingUser.id,
          payload: {
            startDate: toIsoDateTime(editStartDate, false),
            endDate: toIsoDateTime(editEndDate, true),
          },
        });
      } else {
        await removeAccessMutation.mutateAsync(editingUser.id);
      }

      showToast.success('User ma\'lumotlari yangilandi');
      setEditingUser(null);
    });
  };

  return (
    <div>
      <AdminCard className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <AdminInputField
            label="Qidiruv"
            hideLabel
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Telefon, ism, email qidirish"
            inputClassName="placeholder-white/30"
          />

          <AdminSelectField
            label="Role Filter"
            hideLabel
            value={roleFilter}
            options={ROLE_OPTIONS}
            onChange={(value) => {
              setRoleFilter(value as RoleFilter);
              setPage(0);
            }}
            placeholder="Role"
          />

          <AdminSelectField
            label="Status Filter"
            hideLabel
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(value) => {
              setStatusFilter(value as StatusFilter);
              setPage(0);
            }}
            placeholder="Status"
          />

          <AdminButton
            onClick={() => {
              refetch();
              fetchUserStats();
            }}
            variant="secondary"
            size="sm"
            className="text-sm"
          >
            {isFetching ? (
              <AdminSpinner size="sm" tone="neutral" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Yangilash
          </AdminButton>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <AdminStatCard
          title="Premium"
          value={stats.premium}
          caption="Faol premium userlar"
          valueClassName="text-orange-300"
          loading={stats.loading}
        />
        <AdminStatCard
          title="Oddiy"
          value={stats.regular}
          caption="Premium bo'lmagan userlar"
          loading={stats.loading}
        />
        <AdminStatCard
          title="Jami"
          value={stats.total}
          caption="Umumiy foydalanuvchilar soni"
          valueClassName="text-emerald-300"
          loading={stats.loading}
        />
      </div>

      {stats.error && (
        <AdminCard className="px-4 py-3 text-amber-300 text-xs mb-4 border-amber-500/20 bg-amber-500/5">
          {stats.error}
        </AdminCard>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <AdminSpinner size="md" tone="primary" />
        </div>
      )}

      {!isLoading && error && (
        <AdminCard className="px-5 py-4 text-red-400 text-sm border-red-500/20 bg-red-500/5">
          {errorStatus === 403
            ? 'Bu amal uchun ADMIN huquqi kerak.'
            : errorStatus === 401
              ? 'Siz tizimga qayta kirishingiz kerak.'
              : errorMessage || 'Foydalanuvchilar ro\'yxatini olishda xatolik.'}
        </AdminCard>
      )}

      {!isLoading && !error && users.length === 0 && (
        <AdminCard tone="muted" className="text-center py-20 text-white/30">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5V4H2v16h5m10 0v-2a3 3 0 00-3-3H10a3 3 0 00-3 3v2m10 0H7m5-9a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          <p>Foydalanuvchi topilmadi</p>
        </AdminCard>
      )}

      {!isLoading && !error && users.length > 0 && (
        <>
          <AdminCard className="overflow-hidden" padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.07] text-white/60 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Avatar</th>
                    <th className="text-left px-4 py-3">Ism</th>
                    <th className="text-left px-4 py-3">Telefon</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Tarif</th>
                    <th className="text-left px-4 py-3">Holat</th>
                    <th className="text-left px-4 py-3">Hudud</th>
                    <th className="text-left px-4 py-3">Oxirgi kirish</th>
                    <th className="text-left px-4 py-3">Yaratilgan</th>
                    <th className="text-left px-4 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.025]">
                      <td className="px-4 py-3">
                        <div className="relative w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] overflow-hidden flex items-center justify-center">
                          <span className="text-[11px] font-bold text-white/65">
                            {getUserInitials(user).toUpperCase()}
                          </span>
                          {avatarUrlByUserId[user.id] && (
                            <img
                              src={avatarUrlByUserId[user.id]}
                              alt={user.phone || user.id}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{formatFullName(user)}</p>
                        <p className="text-white/35 text-[11px] font-mono">{user.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-3 text-white/75">{user.phone || '-'}</td>
                      <td className="px-4 py-3 text-white/65">{user.email || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.map((role) => (
                            <AdminBadge key={`${user.id}-${role}`} tone="orange">
                              {role}
                            </AdminBadge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge tone={isPremiumUser(user) ? 'premium' : 'neutral'}>
                          {isPremiumUser(user) ? 'PREMIUM' : 'ODDIY'}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge tone={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3 text-white/65">{`${user.region || '-'} / ${user.city || '-'}`}</td>
                      <td className="px-4 py-3 text-white/55">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-4 py-3 text-white/55">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5 min-w-[290px]">
                          <AdminButton
                            onClick={() => openEditModal(user)}
                            variant="info"
                            size="chip"
                          >
                            Edit
                          </AdminButton>

                          {isPremiumUser(user) ? (
                            <AdminButton
                              onClick={() => handleRemovePremium(user)}
                              disabled={isUserActionLoading(user.id, 'removePremium')}
                              variant="warning"
                              size="chip"
                            >
                              {isUserActionLoading(user.id, 'removePremium') ? '...' : 'Premiumni olish'}
                            </AdminButton>
                          ) : (
                            <AdminButton
                              onClick={() => handleGrantPremium(user)}
                              disabled={isUserActionLoading(user.id, 'premium')}
                              variant="warning"
                              size="chip"
                            >
                              {isUserActionLoading(user.id, 'premium') ? '...' : 'Premium berish'}
                            </AdminButton>
                          )}

                          {user.isActive ? (
                            <AdminButton
                              onClick={() => handleBlock(user)}
                              disabled={isUserActionLoading(user.id, 'block')}
                              variant="danger"
                              size="chip"
                            >
                              {isUserActionLoading(user.id, 'block') ? '...' : 'Block'}
                            </AdminButton>
                          ) : (
                            <AdminButton
                              onClick={() => handleUnblock(user)}
                              disabled={isUserActionLoading(user.id, 'unblock')}
                              variant="success"
                              size="chip"
                            >
                              {isUserActionLoading(user.id, 'unblock') ? '...' : 'Unblock'}
                            </AdminButton>
                          )}

                          <AdminButton
                            onClick={() => setShowDeleteConfirmId(user.id)}
                            disabled={isUserActionLoading(user.id, 'delete')}
                            variant="rose"
                            size="chip"
                          >
                            {isUserActionLoading(user.id, 'delete') ? '...' : 'O\'chirish'}
                          </AdminButton>
                        </div>

                        {showDeleteConfirmId === user.id && (
                          <div className="mt-2 p-2 rounded-md border border-rose-500/25 bg-rose-500/10">
                            <p className="text-[10px] text-rose-200 mb-2">Userni butunlay o'chirishni tasdiqlaysizmi?</p>
                            <div className="flex gap-2">
                              <AdminButton
                                onClick={() => handleDeleteUser(user)}
                                variant="rose"
                                size="chip"
                                className="bg-rose-500/20 text-rose-200 border-rose-500/35"
                              >
                                Ha, o'chir
                              </AdminButton>
                              <AdminButton
                                onClick={() => setShowDeleteConfirmId(null)}
                                variant="ghost"
                                size="chip"
                                className="bg-white/5"
                              >
                                Bekor qilish
                              </AdminButton>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <EnhancedPagination
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditingUser(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <h3 className="text-white font-black text-lg">User edit</h3>
            <p className="text-white/45 text-xs mt-1 mb-4">{editingUser.phone} • {editingUser.id.slice(0, 8)}...</p>

            <div className="space-y-4">
              <div>
                <p className="text-white/55 text-xs mb-2">Rollar</p>
                <div className="flex flex-wrap gap-2">
                  {EDITABLE_ROLE_OPTIONS.map((role) => {
                    const active = editRoles.includes(role);
                    return (
                      <AdminButton
                        key={role}
                        type="button"
                        onClick={() => toggleEditRole(role)}
                        variant={active ? 'primary' : 'ghost'}
                        size="chip"
                        className="px-2.5 py-1.5 text-[11px]"
                      >
                        {role}
                      </AdminButton>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminInputField
                  label="Premium start"
                  type="date"
                  value={editStartDate}
                  onChange={setEditStartDate}
                />
                <AdminInputField
                  label="Premium end"
                  type="date"
                  value={editEndDate}
                  onChange={setEditEndDate}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <AdminButton
                  onClick={() => setEditingUser(null)}
                  variant="ghost"
                  size="sm"
                >
                  Bekor qilish
                </AdminButton>
                <AdminButton
                  onClick={handleSaveEdit}
                  disabled={isUserActionLoading(editingUser.id, 'edit')}
                  variant="primary"
                  size="sm"
                >
                  {isUserActionLoading(editingUser.id, 'edit') ? 'Saqlanmoqda...' : 'Saqlash'}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('avatars');
  const [avatars, setAvatars] = useState<AvatarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [avatarUsers, setAvatarUsers] = useState<AdminUser[]>([]);
  const token = localStorage.getItem('auth_token') ?? '';

  const avatarUrlByUserId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const avatar of avatars) {
      if (avatar.user_id && avatar.avatar_url) {
        map[avatar.user_id] = avatar.avatar_url;
      }
    }
    return map;
  }, [avatars]);

  const userByUserId = useMemo(() => {
    const map: Record<string, AdminUser> = {};
    for (const u of avatarUsers) {
      map[u.id] = u;
    }
    return map;
  }, [avatarUsers]);

  const fetchAvatars = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [avatarRes, usersRes] = await Promise.all([
        fetch(`${AVATAR_BASE}/admin/avatars`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        adminUsersApi.list({ page: 0, size: 200 }).catch(() => null),
      ]);

      if (!avatarRes.ok) {
        if (avatarRes.status === 403) setError('Bu amal uchun ADMIN huquqi kerak');
        else setError(`Xatolik: ${avatarRes.status}`);
        return;
      }

      const data = await avatarRes.json();
      setAvatars(data.avatars ?? []);
      if (usersRes) setAvatarUsers(usersRes.items ?? []);
    } catch {
      setError("Server bilan bog'lanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const handleDelete = async (userId: string) => {
    if (!confirm("Bu foydalanuvchi rasmini o'chirasizmi?")) return;

    setDeleting(userId);
    try {
      const res = await fetch(`${AVATAR_BASE}/admin/avatars/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAvatars((prev) => prev.filter((avatar) => avatar.user_id !== userId));
      } else {
        alert("O'chirib bo'lmadi");
      }
    } catch {
      alert('Xatolik yuz berdi');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="min-h-screen">
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col border-r border-white/[0.08] bg-[#080808]">
          <div className="px-4 py-4 border-b border-white/[0.08]">
            <p className="text-white font-black">Admin Panel</p>
            <p className="text-white/35 text-xs">ManageLC Control Center</p>
          </div>

          <nav className="p-3 space-y-1.5">
            <SidebarButton
              active={activeTab === 'avatars'}
              onClick={() => setActiveTab('avatars')}
              label="Avatarlar"
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            />
            <SidebarButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              label="Foydalanuvchilar"
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-2a3 3 0 00-3-3H10a3 3 0 00-3 3v2m10 0H7m5-9a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              )}
            />
            <SidebarButton
              active={activeTab === 'exams'}
              onClick={() => setActiveTab('exams')}
              label="Barcha examlar"
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              )}
            />
            <SidebarButton
              active={activeTab === 'exam-create'}
              onClick={() => setActiveTab('exam-create')}
              label="Exam qo'shish"
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6m13 8H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
                </svg>
              )}
            />
            <SidebarButton
              active={activeTab === 'question-structure'}
              onClick={() => setActiveTab('question-structure')}
              label="Savol struktura"
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              )}
            />
            <SidebarButton
              active={activeTab === 'admin-operations'}
              onClick={() => setActiveTab('admin-operations')}
              label="Backend amallar"
              icon={(
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              )}
            />
          </nav>

          <div className="mt-auto p-3 text-[11px] text-white/35 border-t border-white/[0.08]">
            OpenAPI asosida admin users integratsiyasi
          </div>
        </aside>

        <div className="min-h-screen md:pl-64 flex flex-col">
          <div className="border-b border-white/[0.08] px-4 md:px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-sm md:text-base font-black text-white">
                {activeTab === 'avatars'
                  ? 'Avatar boshqaruvi'
                  : activeTab === 'users'
                    ? 'Foydalanuvchilar ro\'yxati'
                    : activeTab === 'exams'
                      ? 'Barcha examlar'
                    : activeTab === 'exam-create'
                      ? 'Yangi exam qo\'shish'
                    : activeTab === 'question-structure'
                      ? 'Exam savol strukturasi'
                      : 'Backend admin amallari'}
              </h1>
              <p className="text-white/35 text-[11px] md:text-xs">ManageLC admin tools</p>
            </div>

            <AdminButton onClick={onLogout} variant="secondary" size="sm" className="text-white/50 hover:text-white/80">
              Chiqish
            </AdminButton>
          </div>

          <div className="md:hidden border-b border-white/[0.08] px-4 py-3 flex items-center gap-2 overflow-x-auto">
            <SidebarButton
              active={activeTab === 'avatars'}
              onClick={() => setActiveTab('avatars')}
              label="Avatarlar"
              icon={<span className="w-2 h-2 rounded-full bg-current" />}
            />
            <SidebarButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              label="Users"
              icon={<span className="w-2 h-2 rounded-full bg-current" />}
            />
            <SidebarButton
              active={activeTab === 'exams'}
              onClick={() => setActiveTab('exams')}
              label="Exams"
              icon={<span className="w-2 h-2 rounded-full bg-current" />}
            />
            <SidebarButton
              active={activeTab === 'exam-create'}
              onClick={() => setActiveTab('exam-create')}
              label="Exam"
              icon={<span className="w-2 h-2 rounded-full bg-current" />}
            />
            <SidebarButton
              active={activeTab === 'question-structure'}
              onClick={() => setActiveTab('question-structure')}
              label="Question"
              icon={<span className="w-2 h-2 rounded-full bg-current" />}
            />
            <SidebarButton
              active={activeTab === 'admin-operations'}
              onClick={() => setActiveTab('admin-operations')}
              label="Ops"
              icon={<span className="w-2 h-2 rounded-full bg-current" />}
            />
          </div>

          <div className="p-4 md:p-6 max-w-7xl w-full mx-auto">
            {activeTab === 'avatars' ? (
              <AdminAvatarsPanel
                avatars={avatars}
                loading={loading}
                deleting={deleting}
                error={error}
                onDelete={handleDelete}
                onRefresh={fetchAvatars}
                userByUserId={userByUserId}
              />
            ) : activeTab === 'users' ? (
              <AdminUsersPanel avatarUrlByUserId={avatarUrlByUserId} />
            ) : activeTab === 'exams' ? (
              <AdminExamsPanel />
            ) : activeTab === 'exam-create' ? (
              <CreateExamPanel />
            ) : activeTab === 'question-structure' ? (
              <CreateQuestionStructurePanel />
            ) : (
              <AdminOperationsPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────

const Admin: React.FC = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;
