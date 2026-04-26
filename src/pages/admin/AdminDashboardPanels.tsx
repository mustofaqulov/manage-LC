import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminInputField, AdminSelectField, AdminTextareaField } from '../../components/admin/AdminFormFields';
import { AdminBadge, AdminButton, AdminCard, AdminSpinner } from '../../components/admin/AdminUiKit';
import { showToast } from '../../utils/configs/toastConfig';
import { extractApiErrorMessage } from '../../services/api';
import { adminAssetsApi } from '../../services/admin/adminAssetsApi';
import { adminQuestionsApi } from '../../services/admin/adminQuestionsApi';
import { adminRubricsApi } from '../../services/admin/adminRubricsApi';
import { adminSectionsApi } from '../../services/admin/adminSectionsApi';
import { adminSubmissionsApi } from '../../services/admin/adminSubmissionsApi';
import { adminTestsApi } from '../../services/admin/adminTestsApi';
import type {
  AdminAttempt,
  AdminQuestion,
  AdminRubric,
  AdminSection,
  AdminSectionAsset,
  AdminTest,
  AssetType,
  AttemptStatus,
  CefrLevel,
  CreateExpectedAnswerRequest,
  CreateOptionRequest,
  CreateQuestionRequest,
  CreateRubricRequest,
  CreateSectionRequest,
  PagedResponse,
  QuestionType,
  ReorderSectionAssetsRequest,
  ReorderSectionsRequest,
  RescoreAttemptRequest,
  SkillType,
  SpeakingAnalysis,
  UpdateQuestionRequest,
  UpdateSectionRequest,
} from '../../services/admin/types';

const PAGE_SIZE = 20;

const TEST_STATUS_OPTIONS = [
  { value: '', label: 'Barcha status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

const CEFR_OPTIONS: Array<{ value: CefrLevel; label: string }> = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
];

const SKILL_OPTIONS: Array<{ value: SkillType; label: string }> = [
  { value: 'READING', label: 'Reading' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
];

const QUESTION_TYPE_OPTIONS: Array<{ value: QuestionType; label: string }> = [
  { value: 'MCQ_SINGLE', label: 'MCQ Single' },
  { value: 'MCQ_MULTI', label: 'MCQ Multi' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'GAP_FILL', label: 'Gap Fill' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'ESSAY', label: 'Essay' },
  { value: 'SPEAKING_RESPONSE', label: 'Speaking Response' },
];

const ATTEMPT_STATUS_OPTIONS: Array<{ value: '' | AttemptStatus; label: string }> = [
  { value: '', label: 'Barcha status' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'SCORING', label: 'Scoring' },
  { value: 'SCORED', label: 'Scored' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
];

const ASSET_TYPE_OPTIONS: Array<{ value: AssetType; label: string }> = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'DOCUMENT', label: 'Document' },
];

const OVERRIDE_TARGET_OPTIONS = [
  { value: 'ATTEMPT', label: 'Attempt total' },
  { value: 'SECTION', label: 'Section' },
  { value: 'RESPONSE', label: 'Response' },
  { value: 'RUBRIC_SCORE', label: 'Rubric score' },
] as const;

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('uz-UZ');
};

const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error('Son maydoni noto‘g‘ri');
  }
  return parsed;
};

const parseJsonInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return {};
  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  return parsed;
};

const stringifyJson = (value: unknown) => JSON.stringify(value ?? {}, null, 2);

const badgeToneByStatus = (status: string) => {
  if (status === 'PUBLISHED' || status === 'SCORED' || status === 'SUCCEEDED') return 'success' as const;
  if (status === 'DRAFT' || status === 'PENDING' || status === 'SCORING' || status === 'RUNNING') return 'orange' as const;
  if (status === 'ARCHIVED' || status === 'CANCELLED' || status === 'FAILED' || status === 'EXPIRED') return 'danger' as const;
  return 'neutral' as const;
};

const PanelError: React.FC<{ message: string }> = ({ message }) => (
  <AdminCard className="px-5 py-4 text-red-400 text-sm border-red-500/20 bg-red-500/5">{message}</AdminCard>
);

const PaginationBar: React.FC<{
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

  return (
    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-white/50 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2">
        Ko‘rsatilmoqda: <span className="text-white/80">{from}-{to}</span> / <span className="text-white">{totalCount}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton size="chip" onClick={() => onPageChange(Math.max(page - 1, 0))} disabled={page === 0}>
          Oldingi
        </AdminButton>
        {sorted.map((item) => (
          <AdminButton
            key={item}
            size="chip"
            variant={item === current ? 'primary' : 'secondary'}
            onClick={() => onPageChange(item - 1)}
          >
            {item}
          </AdminButton>
        ))}
        <AdminButton
          size="chip"
          onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
          disabled={page + 1 >= totalPages}
        >
          Keyingi
        </AdminButton>
      </div>
    </div>
  );
};

interface SectionFormState {
  title: string;
  skill: SkillType;
  timeLimitMinutes: string;
  instructions: string;
  settingsText: string;
}

interface QuestionDraftOption {
  label: string;
  content: string;
  matchTarget: string;
  scoreWeight: string;
  isCorrect: boolean;
}

interface QuestionDraftAnswer {
  answerKey: string;
  acceptedValuesText: string;
  scoreWeight: string;
  isCaseSensitive: boolean;
  isRegex: boolean;
}

interface QuestionFormState {
  questionType: QuestionType;
  orderIndex: string;
  prompt: string;
  promptAudioAssetId: string;
  promptImageAssetId: string;
  maxScore: string;
  explanation: string;
  settingsText: string;
  rubricId: string;
  options: QuestionDraftOption[];
  answers: QuestionDraftAnswer[];
}

const supportsOptions = (questionType: QuestionType) =>
  questionType === 'MCQ_SINGLE' ||
  questionType === 'MCQ_MULTI' ||
  questionType === 'TRUE_FALSE' ||
  questionType === 'MATCHING';

const supportsExpectedAnswers = (questionType: QuestionType) =>
  questionType === 'GAP_FILL' || questionType === 'SHORT_ANSWER';

const supportsRubrics = (questionType: QuestionType) =>
  questionType === 'ESSAY' || questionType === 'SPEAKING_RESPONSE';

const createDefaultOption = (index: number): QuestionDraftOption => ({
  label: String.fromCharCode(65 + index),
  content: '',
  matchTarget: '',
  scoreWeight: '1',
  isCorrect: index === 0,
});

const createDefaultAnswer = (): QuestionDraftAnswer => ({
  answerKey: '',
  acceptedValuesText: '',
  scoreWeight: '1',
  isCaseSensitive: false,
  isRegex: false,
});

const createDefaultQuestionForm = (): QuestionFormState => ({
  questionType: 'MCQ_SINGLE',
  orderIndex: '',
  prompt: '',
  promptAudioAssetId: '',
  promptImageAssetId: '',
  maxScore: '1',
  explanation: '',
  settingsText: '{}',
  rubricId: '',
  options: [createDefaultOption(0), createDefaultOption(1)],
  answers: [createDefaultAnswer()],
});

const AssetManager: React.FC<{
  sectionId: string;
  assets: AdminSectionAsset[];
  readOnly: boolean;
  onRefresh: () => Promise<void>;
}> = ({ sectionId, assets, readOnly, onRefresh }) => {
  const [assetType, setAssetType] = useState<AssetType>('AUDIO');
  const [contextLabel, setContextLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const moveAsset = async (assetId: string, direction: 'up' | 'down') => {
    const currentIndex = assets.findIndex((item) => item.id === assetId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= assets.length) return;

    const reordered = [...assets];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

    try {
      const payload: ReorderSectionAssetsRequest = {
        assetIds: reordered.map((item) => item.id),
      };
      await adminSectionsApi.reorderAssets(sectionId, payload);
      await onRefresh();
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Assetlarni joyini almashtirib bo‘lmadi'));
    }
  };

  const removeAsset = async (assetId: string) => {
    if (!window.confirm('Assetni sectiondan olib tashlaysizmi?')) return;

    try {
      await adminSectionsApi.removeAsset(sectionId, assetId);
      await onRefresh();
      showToast.success('Asset olib tashlandi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Assetni olib tashlab bo‘lmadi'));
    }
  };

  const uploadAsset = async () => {
    if (!file) {
      showToast.error('Fayl tanlang');
      return;
    }

    setBusy(true);
    try {
      const presign = await adminAssetsApi.presignUpload({
        assetType,
        mimeType: file.type || 'application/octet-stream',
        filename: file.name,
        fileSizeBytes: file.size,
        contextType: 'stimuli',
        sectionId,
      });

      await adminAssetsApi.uploadToPresignedUrl(presign.uploadUrl, file, presign.headers);
      await adminSectionsApi.addAsset(sectionId, {
        assetId: presign.assetId,
        contextLabel: contextLabel.trim() || null,
      });

      setContextLabel('');
      setFile(null);
      await onRefresh();
      showToast.success('Asset yuklandi va bo‘limga biriktirildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Asset yuklashda xatolik'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminCard tone="dark" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-white font-semibold">Section assetlar</p>
          <p className="text-white/40 text-xs">Audio, image va document materiallar shu yerda boshqariladi.</p>
        </div>
        <AdminBadge tone="neutral">{assets.length} ta</AdminBadge>
      </div>

      {assets.length === 0 ? (
        <div className="text-white/35 text-sm">Hali asset biriktirilmagan.</div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset, index) => (
            <div
              key={asset.id}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <AdminBadge tone="neutral">{asset.assetType}</AdminBadge>
                  <span className="text-white/80 text-sm">{asset.contextLabel || 'Nom berilmagan asset'}</span>
                </div>
                <p className="text-white/35 text-xs mt-1">{asset.id}</p>
              </div>

              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <AdminButton size="chip" onClick={() => moveAsset(asset.id, 'up')} disabled={index === 0}>
                    Yuqoriga
                  </AdminButton>
                  <AdminButton size="chip" onClick={() => moveAsset(asset.id, 'down')} disabled={index === assets.length - 1}>
                    Pastga
                  </AdminButton>
                  <AdminButton size="chip" variant="rose" onClick={() => removeAsset(asset.id)}>
                    Olib tashlash
                  </AdminButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="grid gap-3 lg:grid-cols-[180px_1fr_1fr_auto]">
          <AdminSelectField
            label="Asset turi"
            value={assetType}
            options={ASSET_TYPE_OPTIONS}
            onChange={(value) => setAssetType(value as AssetType)}
          />
          <AdminInputField
            label="Izoh"
            value={contextLabel}
            onChange={setContextLabel}
            placeholder="Masalan: Audio 1"
          />
          <div>
            <label className="block text-white/55 text-xs mb-1.5">Fayl</label>
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full text-sm rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-white"
            />
          </div>
          <div className="flex items-end">
            <AdminButton onClick={uploadAsset} disabled={busy} variant="primary" size="sm">
              {busy ? 'Yuklanmoqda...' : 'Yuklash'}
            </AdminButton>
          </div>
        </div>
      )}
    </AdminCard>
  );
};

const QuestionEditorCard: React.FC<{
  question: AdminQuestion;
  questionIndex: number;
  questionCount: number;
  readOnly: boolean;
  onRefresh: () => Promise<void>;
  onMove: (questionId: string, direction: 'up' | 'down') => Promise<void>;
}> = ({ question, questionIndex, questionCount, readOnly, onRefresh, onMove }) => {
  const [prompt, setPrompt] = useState(question.prompt);
  const [orderIndex, setOrderIndex] = useState(String(question.orderIndex));
  const [maxScore, setMaxScore] = useState(String(question.maxScore ?? 1));
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const [settingsText, setSettingsText] = useState(stringifyJson(question.settings));
  const [promptAudioAssetId, setPromptAudioAssetId] = useState(question.promptAudioAssetId ?? '');
  const [promptImageAssetId, setPromptImageAssetId] = useState(question.promptImageAssetId ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrompt(question.prompt);
    setOrderIndex(String(question.orderIndex));
    setMaxScore(String(question.maxScore ?? 1));
    setExplanation(question.explanation ?? '');
    setSettingsText(stringifyJson(question.settings));
    setPromptAudioAssetId(question.promptAudioAssetId ?? '');
    setPromptImageAssetId(question.promptImageAssetId ?? '');
  }, [question]);

  const saveQuestion = async () => {
    setSaving(true);
    try {
      const payload: UpdateQuestionRequest = {
        orderIndex: parseOptionalNumber(orderIndex) ?? question.orderIndex,
        prompt: prompt.trim(),
        promptAudioAssetId: promptAudioAssetId.trim() || null,
        promptImageAssetId: promptImageAssetId.trim() || null,
        maxScore: parseOptionalNumber(maxScore) ?? 1,
        explanation: explanation.trim() || null,
        settings: parseJsonInput(settingsText),
      };
      await adminQuestionsApi.update(question.id, payload);
      await onRefresh();
      showToast.success('Savol yangilandi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Savolni yangilab bo‘lmadi'));
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async () => {
    if (!window.confirm('Savolni o‘chirasizmi?')) return;

    try {
      await adminQuestionsApi.remove(question.id);
      await onRefresh();
      showToast.success('Savol o‘chirildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Savolni o‘chirib bo‘lmadi'));
    }
  };

  return (
    <AdminCard tone="dark" className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <AdminBadge tone="orange">{question.questionType}</AdminBadge>
          <AdminBadge tone="neutral">#{question.orderIndex}</AdminBadge>
          <span className="text-white/70 text-sm">ID: {question.id.slice(0, 8)}...</span>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <AdminButton size="chip" onClick={() => onMove(question.id, 'up')} disabled={questionIndex === 0}>
              Yuqoriga
            </AdminButton>
            <AdminButton size="chip" onClick={() => onMove(question.id, 'down')} disabled={questionIndex === questionCount - 1}>
              Pastga
            </AdminButton>
            <AdminButton size="chip" variant="primary" onClick={saveQuestion} disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </AdminButton>
            <AdminButton size="chip" variant="rose" onClick={removeQuestion}>
              O‘chirish
            </AdminButton>
          </div>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AdminInputField label="Prompt" value={prompt} onChange={setPrompt} disabled={readOnly} />
        <AdminInputField label="Order index" value={orderIndex} onChange={setOrderIndex} disabled={readOnly} />
        <AdminInputField label="Max score" value={maxScore} onChange={setMaxScore} disabled={readOnly} />
        <AdminInputField label="Prompt audio asset ID" value={promptAudioAssetId} onChange={setPromptAudioAssetId} disabled={readOnly} />
        <AdminInputField label="Prompt image asset ID" value={promptImageAssetId} onChange={setPromptImageAssetId} disabled={readOnly} />
        <div className="lg:col-span-2">
          <AdminTextareaField label="Explanation" value={explanation} onChange={setExplanation} rows={2} disabled={readOnly} />
        </div>
        <div className="lg:col-span-2">
          <AdminTextareaField label="Qo‘shimcha settings" value={settingsText} onChange={setSettingsText} rows={4} disabled={readOnly} />
        </div>
      </div>

      {question.options.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/70 text-sm font-semibold">Variantlar</p>
          {question.options.map((option) => (
            <div key={option.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <AdminBadge tone={option.isCorrect ? 'success' : 'neutral'}>{option.label}</AdminBadge>
                <span className="text-white/80 text-sm">{option.content}</span>
                {option.matchTarget ? <span className="text-white/45 text-xs">Match: {option.matchTarget}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {question.expectedAnswers.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/70 text-sm font-semibold">Expected answers</p>
          {question.expectedAnswers.map((answer) => (
            <div key={answer.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-white/80 text-sm">{answer.acceptedValues.join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {question.rubrics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {question.rubrics.map((rubric) => (
            <AdminBadge key={`${question.id}-${rubric.rubricId}`} tone="premium">
              {rubric.rubricName}
            </AdminBadge>
          ))}
        </div>
      )}
    </AdminCard>
  );
};

const QuestionCreateForm: React.FC<{
  sectionId: string;
  rubrics: AdminRubric[];
  readOnly: boolean;
  nextOrderIndex: number;
  onCreated: () => Promise<void>;
}> = ({ sectionId, rubrics, readOnly, nextOrderIndex, onCreated }) => {
  const [form, setForm] = useState<QuestionFormState>(createDefaultQuestionForm());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, orderIndex: String(nextOrderIndex) }));
  }, [nextOrderIndex]);

  useEffect(() => {
    setForm((prev) => {
      if (supportsOptions(prev.questionType) && prev.options.length === 0) {
        return { ...prev, options: [createDefaultOption(0), createDefaultOption(1)] };
      }
      if (supportsExpectedAnswers(prev.questionType) && prev.answers.length === 0) {
        return { ...prev, answers: [createDefaultAnswer()] };
      }
      return prev;
    });
  }, [form.questionType]);

  const updateOption = (index: number, patch: Partial<QuestionDraftOption>) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  };

  const updateAnswer = (index: number, patch: Partial<QuestionDraftAnswer>) => {
    setForm((prev) => ({
      ...prev,
      answers: prev.answers.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  };

  const createQuestion = async () => {
    setCreating(true);
    try {
      const options: CreateOptionRequest[] | undefined = supportsOptions(form.questionType)
        ? form.options
            .filter((item) => item.content.trim())
            .map((item, index) => ({
              label: item.label.trim() || String.fromCharCode(65 + index),
              content: item.content.trim(),
              orderIndex: index,
              isCorrect: item.isCorrect,
              scoreWeight: parseOptionalNumber(item.scoreWeight) ?? 1,
              matchTarget: item.matchTarget.trim() || null,
            }))
        : undefined;

      const expectedAnswers: CreateExpectedAnswerRequest[] | undefined = supportsExpectedAnswers(form.questionType)
        ? form.answers
            .filter((item) => item.acceptedValuesText.trim())
            .map((item) => ({
              answerKey: item.answerKey.trim() || null,
              acceptedValues: item.acceptedValuesText.split(',').map((value) => value.trim()).filter(Boolean),
              isCaseSensitive: item.isCaseSensitive,
              isRegex: item.isRegex,
              scoreWeight: parseOptionalNumber(item.scoreWeight) ?? 1,
            }))
        : undefined;

      const payload: CreateQuestionRequest = {
        sectionId,
        questionType: form.questionType,
        orderIndex: parseOptionalNumber(form.orderIndex) ?? nextOrderIndex,
        prompt: form.prompt.trim(),
        promptAudioAssetId: form.promptAudioAssetId.trim() || null,
        promptImageAssetId: form.promptImageAssetId.trim() || null,
        maxScore: parseOptionalNumber(form.maxScore) ?? 1,
        explanation: form.explanation.trim() || null,
        settings: parseJsonInput(form.settingsText),
        options,
        expectedAnswers,
        rubricId: supportsRubrics(form.questionType) ? form.rubricId || null : null,
      };

      await adminQuestionsApi.create(payload);
      setForm(createDefaultQuestionForm());
      await onCreated();
      showToast.success('Savol yaratildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Savol yaratishda xatolik'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminCard tone="dark" className="space-y-3">
      <div>
        <p className="text-white font-semibold">Yangi savol qo‘shish</p>
        <p className="text-white/40 text-xs mt-1">Section ichida to‘liq savol strukturasini shu yerda yaratasiz.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AdminSelectField
          label="Question turi"
          value={form.questionType}
          options={QUESTION_TYPE_OPTIONS}
          onChange={(value) => setForm((prev) => ({ ...prev, questionType: value as QuestionType }))}
          disabled={readOnly}
        />
        <AdminInputField label="Order index" value={form.orderIndex} onChange={(value) => setForm((prev) => ({ ...prev, orderIndex: value }))} disabled={readOnly} />
        <div className="lg:col-span-2">
          <AdminTextareaField label="Prompt" value={form.prompt} onChange={(value) => setForm((prev) => ({ ...prev, prompt: value }))} rows={3} disabled={readOnly} />
        </div>
        <AdminInputField label="Max score" value={form.maxScore} onChange={(value) => setForm((prev) => ({ ...prev, maxScore: value }))} disabled={readOnly} />
        <AdminInputField label="Rubric" value={form.rubricId} onChange={(value) => setForm((prev) => ({ ...prev, rubricId: value }))} disabled={readOnly || !supportsRubrics(form.questionType)} placeholder="Rubric ID yoki quyidan tanlang" />
        <AdminInputField label="Prompt audio asset ID" value={form.promptAudioAssetId} onChange={(value) => setForm((prev) => ({ ...prev, promptAudioAssetId: value }))} disabled={readOnly} />
        <AdminInputField label="Prompt image asset ID" value={form.promptImageAssetId} onChange={(value) => setForm((prev) => ({ ...prev, promptImageAssetId: value }))} disabled={readOnly} />
        <div className="lg:col-span-2">
          <AdminTextareaField label="Explanation" value={form.explanation} onChange={(value) => setForm((prev) => ({ ...prev, explanation: value }))} rows={2} disabled={readOnly} />
        </div>
        <div className="lg:col-span-2">
          <AdminTextareaField label="Qo‘shimcha settings" value={form.settingsText} onChange={(value) => setForm((prev) => ({ ...prev, settingsText: value }))} rows={3} disabled={readOnly} />
        </div>
      </div>

      {supportsRubrics(form.questionType) && rubrics.length > 0 && (
        <AdminSelectField
          label="Mavjud rubricdan tanlash"
          value={form.rubricId}
          options={[{ value: '', label: 'Rubric tanlanmagan' }, ...rubrics.map((rubric) => ({ value: rubric.id, label: `${rubric.name} (${rubric.skill})` }))]}
          onChange={(value) => setForm((prev) => ({ ...prev, rubricId: value }))}
          disabled={readOnly}
        />
      )}

      {supportsOptions(form.questionType) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm font-semibold">Variantlar</p>
            {!readOnly && (
              <AdminButton size="chip" onClick={() => setForm((prev) => ({ ...prev, options: [...prev.options, createDefaultOption(prev.options.length)] }))}>
                Variant qo‘shish
              </AdminButton>
            )}
          </div>

          {form.options.map((option, index) => (
            <div key={`${form.questionType}-option-${index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-3">
              <div className="grid gap-3 lg:grid-cols-4">
                <AdminInputField label="Label" value={option.label} onChange={(value) => updateOption(index, { label: value })} disabled={readOnly} />
                <AdminInputField label="Content" value={option.content} onChange={(value) => updateOption(index, { content: value })} disabled={readOnly} />
                <AdminInputField label="Score weight" value={option.scoreWeight} onChange={(value) => updateOption(index, { scoreWeight: value })} disabled={readOnly} />
                {form.questionType === 'MATCHING' ? (
                  <AdminInputField label="Match target" value={option.matchTarget} onChange={(value) => updateOption(index, { matchTarget: value })} disabled={readOnly} />
                ) : (
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-white/70 text-sm">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(event) => updateOption(index, { isCorrect: event.target.checked })}
                        disabled={readOnly}
                      />
                      To‘g‘ri variant
                    </label>
                  </div>
                )}
              </div>

              {!readOnly && form.options.length > 1 && (
                <AdminButton size="chip" variant="rose" onClick={() => setForm((prev) => ({ ...prev, options: prev.options.filter((_, itemIndex) => itemIndex !== index) }))}>
                  Variantni olib tashlash
                </AdminButton>
              )}
            </div>
          ))}
        </div>
      )}

      {supportsExpectedAnswers(form.questionType) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm font-semibold">Expected answers</p>
            {!readOnly && (
              <AdminButton size="chip" onClick={() => setForm((prev) => ({ ...prev, answers: [...prev.answers, createDefaultAnswer()] }))}>
                Javob qo‘shish
              </AdminButton>
            )}
          </div>

          {form.answers.map((answer, index) => (
            <div key={`answer-${index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-3">
              <div className="grid gap-3 lg:grid-cols-3">
                <AdminInputField label="Answer key" value={answer.answerKey} onChange={(value) => updateAnswer(index, { answerKey: value })} disabled={readOnly} />
                <AdminInputField label="Accepted values" value={answer.acceptedValuesText} onChange={(value) => updateAnswer(index, { acceptedValuesText: value })} disabled={readOnly} placeholder="comma bilan ajrating" />
                <AdminInputField label="Score weight" value={answer.scoreWeight} onChange={(value) => updateAnswer(index, { scoreWeight: value })} disabled={readOnly} />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-white/70 text-sm">
                  <input
                    type="checkbox"
                    checked={answer.isCaseSensitive}
                    onChange={(event) => updateAnswer(index, { isCaseSensitive: event.target.checked })}
                    disabled={readOnly}
                  />
                  Case sensitive
                </label>
                <label className="inline-flex items-center gap-2 text-white/70 text-sm">
                  <input
                    type="checkbox"
                    checked={answer.isRegex}
                    onChange={(event) => updateAnswer(index, { isRegex: event.target.checked })}
                    disabled={readOnly}
                  />
                  Regex
                </label>
              </div>

              {!readOnly && form.answers.length > 1 && (
                <AdminButton size="chip" variant="rose" onClick={() => setForm((prev) => ({ ...prev, answers: prev.answers.filter((_, itemIndex) => itemIndex !== index) }))}>
                  Javobni olib tashlash
                </AdminButton>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end">
          <AdminButton variant="primary" onClick={createQuestion} disabled={creating}>
            {creating ? 'Yaratilmoqda...' : 'Savol yaratish'}
          </AdminButton>
        </div>
      )}
    </AdminCard>
  );
};

const SectionEditorCard: React.FC<{
  section: AdminSection;
  rubrics: AdminRubric[];
  readOnly: boolean;
  onRefresh: () => Promise<void>;
  onMove: (sectionId: string, direction: 'up' | 'down') => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
}> = ({ section, rubrics, readOnly, onRefresh, onMove, isFirst, isLast }) => {
  const [form, setForm] = useState<SectionFormState>({
    title: section.title,
    skill: section.skill,
    timeLimitMinutes: section.timeLimitMinutes == null ? '' : String(section.timeLimitMinutes),
    instructions: section.instructions ?? '',
    settingsText: stringifyJson(section.settings),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      title: section.title,
      skill: section.skill,
      timeLimitMinutes: section.timeLimitMinutes == null ? '' : String(section.timeLimitMinutes),
      instructions: section.instructions ?? '',
      settingsText: stringifyJson(section.settings),
    });
  }, [section]);

  const questions = section.questions ?? [];
  const assets = section.assets ?? [];

  const saveSection = async () => {
    setSaving(true);
    try {
      const payload: UpdateSectionRequest = {
        title: form.title.trim(),
        skill: form.skill,
        timeLimitMinutes: parseOptionalNumber(form.timeLimitMinutes),
        instructions: form.instructions.trim() || null,
        settings: parseJsonInput(form.settingsText),
      };
      await adminSectionsApi.update(section.id, payload);
      await onRefresh();
      showToast.success('Section yangilandi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Sectionni yangilab bo‘lmadi'));
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async () => {
    if (!window.confirm('Sectionni o‘chirasizmi?')) return;

    try {
      await adminSectionsApi.remove(section.id);
      await onRefresh();
      showToast.success('Section o‘chirildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Sectionni o‘chirib bo‘lmadi'));
    }
  };

  const moveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex((item) => item.id === questionId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= questions.length) return;

    const currentQuestion = questions[currentIndex];
    const targetQuestion = questions[targetIndex];

    try {
      await adminQuestionsApi.update(currentQuestion.id, { orderIndex: targetQuestion.orderIndex });
      await adminQuestionsApi.update(targetQuestion.id, { orderIndex: currentQuestion.orderIndex });
      await onRefresh();
      showToast.success('Savol tartibi yangilandi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Savol tartibini saqlab bo‘lmadi'));
    }
  };

  return (
    <AdminCard className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-semibold">{section.title}</p>
          <AdminBadge tone="orange">{section.skill}</AdminBadge>
          <AdminBadge tone="neutral">#{section.orderIndex}</AdminBadge>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <AdminButton size="chip" onClick={() => onMove(section.id, 'up')} disabled={isFirst}>
              Yuqoriga
            </AdminButton>
            <AdminButton size="chip" onClick={() => onMove(section.id, 'down')} disabled={isLast}>
              Pastga
            </AdminButton>
            <AdminButton size="chip" variant="primary" onClick={saveSection} disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Sectionni saqlash'}
            </AdminButton>
            <AdminButton size="chip" variant="rose" onClick={deleteSection}>
              O‘chirish
            </AdminButton>
          </div>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AdminInputField label="Section nomi" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} disabled={readOnly} />
        <AdminSelectField label="Skill" value={form.skill} options={SKILL_OPTIONS} onChange={(value) => setForm((prev) => ({ ...prev, skill: value as SkillType }))} disabled={readOnly} />
        <AdminInputField label="Time limit" value={form.timeLimitMinutes} onChange={(value) => setForm((prev) => ({ ...prev, timeLimitMinutes: value }))} disabled={readOnly} />
        <div className="lg:col-span-2">
          <AdminTextareaField label="Instructions" value={form.instructions} onChange={(value) => setForm((prev) => ({ ...prev, instructions: value }))} rows={2} disabled={readOnly} />
        </div>
        <div className="lg:col-span-2">
          <AdminTextareaField label="Settings" value={form.settingsText} onChange={(value) => setForm((prev) => ({ ...prev, settingsText: value }))} rows={3} disabled={readOnly} />
        </div>
      </div>

      <AssetManager sectionId={section.id} assets={assets} readOnly={readOnly} onRefresh={onRefresh} />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-semibold">Savollar</p>
            <p className="text-white/40 text-xs">{questions.length} ta savol</p>
          </div>
        </div>

        {questions.length === 0 ? (
          <AdminCard tone="dark" className="text-white/35 text-sm">Bu sectionda hali savol yo‘q.</AdminCard>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <QuestionEditorCard
                key={question.id}
                question={question}
                questionIndex={index}
                questionCount={questions.length}
                readOnly={readOnly}
                onRefresh={onRefresh}
                onMove={moveQuestion}
              />
            ))}
          </div>
        )}
      </div>

      <QuestionCreateForm
        sectionId={section.id}
        rubrics={rubrics}
        readOnly={readOnly}
        nextOrderIndex={questions.length}
        onCreated={onRefresh}
      />
    </AdminCard>
  );
};

export const AdminTestBuilderPanel: React.FC = () => {
  const [selectedTestId, setSelectedTestId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectionForm, setSectionForm] = useState<CreateSectionRequest>({
    testId: '',
    title: '',
    skill: 'SPEAKING',
    timeLimitMinutes: null,
    instructions: null,
    settings: {},
  });

  const testsQuery = useQuery({
    queryKey: ['admin-builder-tests', statusFilter],
    queryFn: async () => adminTestsApi.list({ page: 0, size: 200, status: statusFilter as AdminTest['status'] | '' }),
  });

  const rubricsQuery = useQuery({
    queryKey: ['admin-builder-rubrics'],
    queryFn: async () => adminRubricsApi.list({ page: 0, size: 200 }),
  });

  const detailQuery = useQuery({
    queryKey: ['admin-builder-test-detail', selectedTestId],
    queryFn: async () => adminTestsApi.getById(selectedTestId),
    enabled: Boolean(selectedTestId),
  });

  useEffect(() => {
    const items = testsQuery.data?.items ?? [];
    if (!selectedTestId && items.length > 0) {
      setSelectedTestId(items[0].id);
    }
    if (selectedTestId && items.length > 0 && !items.some((item) => item.id === selectedTestId)) {
      setSelectedTestId(items[0].id);
    }
  }, [testsQuery.data, selectedTestId]);

  const tests = testsQuery.data?.items ?? [];
  const rubrics = rubricsQuery.data?.items ?? [];
  const selectedTest = detailQuery.data;
  const readOnly = selectedTest ? selectedTest.status !== 'DRAFT' : false;

  useEffect(() => {
    setSectionForm((prev) => ({ ...prev, testId: selectedTestId }));
  }, [selectedTestId]);

  const refreshDetail = async () => {
    await Promise.all([detailQuery.refetch(), testsQuery.refetch()]);
  };

  const createSection = async () => {
    if (!selectedTestId) {
      showToast.error('Avval test tanlang');
      return;
    }

    try {
      await adminSectionsApi.create({
        testId: selectedTestId,
        title: sectionForm.title.trim(),
        skill: sectionForm.skill,
        timeLimitMinutes: sectionForm.timeLimitMinutes == null ? null : Number(sectionForm.timeLimitMinutes),
        instructions: sectionForm.instructions?.trim() || null,
        settings: sectionForm.settings ?? {},
      });

      setSectionForm({
        testId: selectedTestId,
        title: '',
        skill: 'SPEAKING',
        timeLimitMinutes: null,
        instructions: null,
        settings: {},
      });
      await refreshDetail();
      showToast.success('Section yaratildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Section yaratishda xatolik'));
    }
  };

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const sections = selectedTest?.sections ?? [];
    const currentIndex = sections.findIndex((item) => item.id === sectionId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (!selectedTest || currentIndex < 0 || targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

    try {
      const payload: ReorderSectionsRequest = {
        sectionIds: reordered.map((item) => item.id),
      };
      await adminTestsApi.reorderSections(selectedTest.id, payload);
      await refreshDetail();
      showToast.success('Section tartibi saqlandi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Section tartibini saqlab bo‘lmadi'));
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <AdminCard>
          <AdminSelectField
            label="Status filter"
            value={statusFilter}
            options={TEST_STATUS_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            onChange={setStatusFilter}
          />
        </AdminCard>

        <AdminCard className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">Testlar</p>
            {testsQuery.isFetching ? <AdminSpinner size="sm" tone="neutral" /> : null}
          </div>

          {testsQuery.isLoading ? (
            <div className="flex items-center justify-center py-10"><AdminSpinner size="md" tone="primary" /></div>
          ) : tests.length === 0 ? (
            <div className="text-white/35 text-sm">Test topilmadi.</div>
          ) : (
            <div className="space-y-2 max-h-[72vh] overflow-auto pr-1">
              {tests.map((test) => (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => setSelectedTestId(test.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selectedTestId === test.id
                      ? 'border-orange-500/35 bg-orange-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-medium line-clamp-2">{test.title}</p>
                    <AdminBadge tone={badgeToneByStatus(test.status)}>{test.status}</AdminBadge>
                  </div>
                  <p className="text-white/40 text-xs mt-2">v{test.version} • {test.cefrLevel}</p>
                </button>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      <div className="space-y-4">
        {!selectedTestId ? (
          <AdminCard className="py-16 text-center text-white/35">Builder uchun test tanlang.</AdminCard>
        ) : detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-20"><AdminSpinner size="lg" tone="primary" /></div>
        ) : detailQuery.error || !selectedTest ? (
          <PanelError message={extractApiErrorMessage(detailQuery.error, 'Test detail olinmadi')} />
        ) : (
          <>
            <AdminCard className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-white text-xl font-black">{selectedTest.title}</h2>
                    <AdminBadge tone={badgeToneByStatus(selectedTest.status)}>{selectedTest.status}</AdminBadge>
                    <AdminBadge tone="neutral">v{selectedTest.version}</AdminBadge>
                  </div>
                  <p className="text-white/40 text-sm mt-1">{selectedTest.description || 'Izoh kiritilmagan'}</p>
                </div>

                <AdminButton onClick={refreshDetail} size="sm">
                  Yangilash
                </AdminButton>
              </div>

              {readOnly ? (
                <AdminCard className="border-amber-500/20 bg-amber-500/5 text-amber-300 text-sm">
                  Draft bo‘lmagan test builder ichida read-only ko‘rinishda ochiladi. Tahrir uchun `new version` yaratib draft nusxani tanlang.
                </AdminCard>
              ) : null}

              <div className="grid gap-3 lg:grid-cols-4">
                <AdminInputField label="Yangi section nomi" value={sectionForm.title} onChange={(value) => setSectionForm((prev) => ({ ...prev, title: value }))} disabled={readOnly} />
                <AdminSelectField label="Skill" value={sectionForm.skill} options={SKILL_OPTIONS} onChange={(value) => setSectionForm((prev) => ({ ...prev, skill: value as SkillType }))} disabled={readOnly} />
                <AdminInputField label="Time limit" value={sectionForm.timeLimitMinutes == null ? '' : String(sectionForm.timeLimitMinutes)} onChange={(value) => setSectionForm((prev) => ({ ...prev, timeLimitMinutes: value ? Number(value) : null }))} disabled={readOnly} />
                <div className="flex items-end">
                  <AdminButton onClick={createSection} disabled={readOnly} variant="primary">
                    Section qo‘shish
                  </AdminButton>
                </div>
                <div className="lg:col-span-4">
                  <AdminTextareaField label="Instructions" value={sectionForm.instructions ?? ''} onChange={(value) => setSectionForm((prev) => ({ ...prev, instructions: value }))} rows={2} disabled={readOnly} />
                </div>
              </div>
            </AdminCard>

            {(selectedTest.sections ?? []).length === 0 ? (
              <AdminCard className="py-16 text-center text-white/35">Bu testda hali section yo‘q.</AdminCard>
            ) : (
              <div className="space-y-4">
                {(selectedTest.sections ?? []).map((section, index, items) => (
                  <SectionEditorCard
                    key={section.id}
                    section={section}
                    rubrics={rubrics}
                    readOnly={readOnly}
                    onRefresh={refreshDetail}
                    onMove={moveSection}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const AdminRubricsPanel: React.FC = () => {
  const [page, setPage] = useState(0);
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [form, setForm] = useState<CreateRubricRequest>({
    name: '',
    description: '',
    skill: 'SPEAKING',
    cefrLevel: 'B2',
    maxScore: 30,
    criteria: [{ name: '', description: '', maxScore: 10, weight: 1, orderIndex: 0, levelDescriptors: null }],
  });

  const listQuery = useQuery({
    queryKey: ['admin-rubrics', page],
    queryFn: async () => adminRubricsApi.list({ page, size: PAGE_SIZE }),
  });

  const detailQuery = useQuery({
    queryKey: ['admin-rubric-detail', selectedRubricId],
    queryFn: async () => adminRubricsApi.getById(selectedRubricId),
    enabled: Boolean(selectedRubricId),
  });

  useEffect(() => {
    const items = listQuery.data?.items ?? [];
    if (!selectedRubricId && items.length > 0) {
      setSelectedRubricId(items[0].id);
    }
    if (selectedRubricId && items.length > 0 && !items.some((item) => item.id === selectedRubricId)) {
      setSelectedRubricId(items[0].id);
    }
  }, [listQuery.data, selectedRubricId]);

  const createRubric = async () => {
    try {
      const payload: CreateRubricRequest = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        criteria: form.criteria.map((criterion, index) => ({
          ...criterion,
          name: criterion.name.trim(),
          description: criterion.description?.trim() || null,
          orderIndex: index,
        })),
      };
      await adminRubricsApi.create(payload);
      setForm({
        name: '',
        description: '',
        skill: 'SPEAKING',
        cefrLevel: 'B2',
        maxScore: 30,
        criteria: [{ name: '', description: '', maxScore: 10, weight: 1, orderIndex: 0, levelDescriptors: null }],
      });
      await listQuery.refetch();
      showToast.success('Rubric yaratildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Rubric yaratishda xatolik'));
    }
  };

  const deleteRubric = async (rubricId: string) => {
    if (!window.confirm('Rubricni o‘chirasizmi?')) return;
    try {
      await adminRubricsApi.remove(rubricId);
      await Promise.all([listQuery.refetch(), detailQuery.refetch()]);
      showToast.success('Rubric o‘chirildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Rubricni o‘chirib bo‘lmadi'));
    }
  };

  const paged = (listQuery.data ?? { items: [], total: 0, size: PAGE_SIZE }) as PagedResponse<AdminRubric>;
  const totalCount = paged.totalCount ?? paged.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / (paged.size || PAGE_SIZE)));
  const from = totalCount === 0 ? 0 : page * (paged.size || PAGE_SIZE) + 1;
  const to = totalCount === 0 ? 0 : Math.min((page + 1) * (paged.size || PAGE_SIZE), totalCount);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <AdminCard className="space-y-3">
          <div>
            <p className="text-white font-semibold">Yangi rubric</p>
            <p className="text-white/40 text-xs mt-1">Essay va speaking savollari uchun scoring rubric yarating.</p>
          </div>

          <AdminInputField label="Nomi" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
          <AdminTextareaField label="Izoh" value={form.description ?? ''} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} rows={2} />
          <div className="grid gap-3 lg:grid-cols-3">
            <AdminSelectField label="Skill" value={form.skill} options={SKILL_OPTIONS} onChange={(value) => setForm((prev) => ({ ...prev, skill: value as SkillType }))} />
            <AdminSelectField label="CEFR" value={form.cefrLevel ?? 'B2'} options={CEFR_OPTIONS} onChange={(value) => setForm((prev) => ({ ...prev, cefrLevel: value as CefrLevel }))} />
            <AdminInputField label="Max score" value={String(form.maxScore)} onChange={(value) => setForm((prev) => ({ ...prev, maxScore: Number(value) || 0 }))} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm font-semibold">Criteria</p>
              <AdminButton
                size="chip"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    criteria: [...prev.criteria, { name: '', description: '', maxScore: 5, weight: 1, orderIndex: prev.criteria.length, levelDescriptors: null }],
                  }))
                }
              >
                Criterion qo‘shish
              </AdminButton>
            </div>

            {form.criteria.map((criterion, index) => (
              <div key={`criterion-${index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-3">
                <div className="grid gap-3 lg:grid-cols-3">
                  <AdminInputField
                    label="Nom"
                    value={criterion.name}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        criteria: prev.criteria.map((item, itemIndex) => (itemIndex === index ? { ...item, name: value } : item)),
                      }))
                    }
                  />
                  <AdminInputField
                    label="Max score"
                    value={String(criterion.maxScore)}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        criteria: prev.criteria.map((item, itemIndex) => (itemIndex === index ? { ...item, maxScore: Number(value) || 0 } : item)),
                      }))
                    }
                  />
                  <AdminInputField
                    label="Weight"
                    value={String(criterion.weight)}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        criteria: prev.criteria.map((item, itemIndex) => (itemIndex === index ? { ...item, weight: Number(value) || 0 } : item)),
                      }))
                    }
                  />
                </div>
                <AdminTextareaField
                  label="Description"
                  value={criterion.description ?? ''}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      criteria: prev.criteria.map((item, itemIndex) => (itemIndex === index ? { ...item, description: value } : item)),
                    }))
                  }
                  rows={2}
                />

                {form.criteria.length > 1 && (
                  <AdminButton
                    size="chip"
                    variant="rose"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        criteria: prev.criteria.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Criterionni olib tashlash
                  </AdminButton>
                )}
              </div>
            ))}
          </div>

          <AdminButton variant="primary" onClick={createRubric}>
            Rubric yaratish
          </AdminButton>
        </AdminCard>
      </div>

      <div className="space-y-4">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center py-20"><AdminSpinner size="lg" tone="primary" /></div>
        ) : listQuery.error ? (
          <PanelError message={extractApiErrorMessage(listQuery.error, 'Rubriclar ro‘yxati olinmadi')} />
        ) : (
          <>
            <AdminCard className="overflow-hidden" padding="none">
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/[0.07] text-white/60 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Rubric</th>
                      <th className="text-left px-4 py-3">Skill</th>
                      <th className="text-left px-4 py-3">CEFR</th>
                      <th className="text-left px-4 py-3">Max score</th>
                      <th className="text-left px-4 py-3">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listQuery.data?.items ?? []).map((rubric) => (
                      <tr key={rubric.id} className="border-b border-white/[0.06] hover:bg-white/[0.025]">
                        <td className="px-4 py-3">
                          <button type="button" className="text-left" onClick={() => setSelectedRubricId(rubric.id)}>
                            <p className="text-white font-medium">{rubric.name}</p>
                            <p className="text-white/35 text-[11px]">{rubric.id}</p>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-white/70">{rubric.skill}</td>
                        <td className="px-4 py-3 text-white/70">{rubric.cefrLevel || '-'}</td>
                        <td className="px-4 py-3 text-white/70">{rubric.maxScore}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <AdminButton size="chip" onClick={() => setSelectedRubricId(rubric.id)}>
                              Ko‘rish
                            </AdminButton>
                            <AdminButton size="chip" variant="rose" onClick={() => deleteRubric(rubric.id)}>
                              O‘chirish
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>

            <PaginationBar page={page} totalPages={totalPages} from={from} to={to} totalCount={totalCount} onPageChange={setPage} />

            {selectedRubricId && detailQuery.data ? (
              <AdminCard className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-black text-lg">{detailQuery.data.name}</h3>
                  <AdminBadge tone="orange">{detailQuery.data.skill}</AdminBadge>
                  {detailQuery.data.cefrLevel ? <AdminBadge tone="neutral">{detailQuery.data.cefrLevel}</AdminBadge> : null}
                </div>

                <p className="text-white/45 text-sm">{detailQuery.data.description || 'Izoh yo‘q'}</p>

                <div className="grid gap-3 md:grid-cols-2">
                  {detailQuery.data.criteria.map((criterion) => (
                    <AdminCard key={criterion.id} tone="dark" className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white font-semibold">{criterion.name}</p>
                        <AdminBadge tone="neutral">{criterion.maxScore} ball</AdminBadge>
                      </div>
                      <p className="text-white/45 text-sm">{criterion.description || 'Izoh kiritilmagan'}</p>
                      <p className="text-white/40 text-xs">Weight: {criterion.weight}</p>
                    </AdminCard>
                  ))}
                </div>
              </AdminCard>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export const AdminSubmissionsPanel: React.FC = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'' | AttemptStatus>('');
  const [testFilter, setTestFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [selectedAttemptId, setSelectedAttemptId] = useState('');
  const [rescoreReason, setRescoreReason] = useState('Manual review');
  const [rescoreSectionId, setRescoreSectionId] = useState('');
  const [overrideTargetType, setOverrideTargetType] = useState<'ATTEMPT' | 'SECTION' | 'RESPONSE' | 'RUBRIC_SCORE'>('ATTEMPT');
  const [overrideTargetId, setOverrideTargetId] = useState('');
  const [overrideScore, setOverrideScore] = useState('');
  const [overrideReason, setOverrideReason] = useState('Manual override');
  const [analysisEnabled, setAnalysisEnabled] = useState(false);

  const testsQuery = useQuery({
    queryKey: ['admin-submission-tests'],
    queryFn: async () => adminTestsApi.list({ page: 0, size: 200 }),
  });

  const listQuery = useQuery({
    queryKey: ['admin-submissions', page, statusFilter, testFilter, userIdFilter],
    queryFn: async () =>
      adminSubmissionsApi.list({
        page,
        size: PAGE_SIZE,
        status: statusFilter || undefined,
        testId: testFilter || undefined,
        userId: userIdFilter.trim() || undefined,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ['admin-submission-detail', selectedAttemptId],
    queryFn: async () => adminSubmissionsApi.getById(selectedAttemptId),
    enabled: Boolean(selectedAttemptId),
  });

  const analysisQuery = useQuery({
    queryKey: ['admin-submission-analysis', selectedAttemptId],
    queryFn: async () => adminSubmissionsApi.getSpeakingAnalysis(selectedAttemptId),
    enabled: Boolean(selectedAttemptId) && analysisEnabled,
    retry: false,
  });

  useEffect(() => {
    const items = listQuery.data?.items ?? [];
    if (!selectedAttemptId && items.length > 0) {
      setSelectedAttemptId(items[0].id);
    }
    if (selectedAttemptId && items.length > 0 && !items.some((item) => item.id === selectedAttemptId)) {
      setSelectedAttemptId(items[0].id);
    }
  }, [listQuery.data, selectedAttemptId]);

  const detail = detailQuery.data;
  const hasSpeaking = detail?.sections.some((section) => section.skill === 'SPEAKING') ?? false;

  useEffect(() => {
    if (!hasSpeaking) {
      setAnalysisEnabled(false);
    }
  }, [hasSpeaking]);

  const refreshAll = async () => {
    await Promise.all([listQuery.refetch(), detailQuery.refetch(), analysisEnabled ? analysisQuery.refetch() : Promise.resolve()]);
  };

  const rescore = async () => {
    if (!selectedAttemptId) return;

    const payload: RescoreAttemptRequest = {
      sectionId: rescoreSectionId || null,
      reason: rescoreReason.trim() || 'Manual review',
    };

    try {
      await adminSubmissionsApi.rescore(selectedAttemptId, payload);
      await refreshAll();
      showToast.success('Rescore navbatga qo‘yildi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Rescore yuborilmadi'));
    }
  };

  const overrideTargets = useMemo(() => {
    if (!detail) return [];

    if (overrideTargetType === 'ATTEMPT') {
      return [{ value: detail.id, label: `${detail.testTitle} total score` }];
    }

    if (overrideTargetType === 'SECTION') {
      return detail.sections.map((section) => ({
        value: section.id,
        label: `${section.sectionTitle} (${section.sectionScore ?? '-'}/${section.maxSectionScore ?? '-'})`,
      }));
    }

    if (overrideTargetType === 'RESPONSE') {
      return detail.responses.map((response) => ({
        value: response.id,
        label: `${response.questionType} • ${response.scoreAwarded ?? '-'} / ${response.maxScore ?? '-'}`,
      }));
    }

    return detail.responses.flatMap((response) =>
      (response.rubricScores ?? []).map((score) => ({
        value: score.id,
        label: `${score.criterionName} • ${score.score}/${score.maxScore}`,
      })),
    );
  }, [detail, overrideTargetType]);

  useEffect(() => {
    if (overrideTargets.length > 0) {
      setOverrideTargetId((current) => (overrideTargets.some((item) => item.value === current) ? current : overrideTargets[0].value));
    } else {
      setOverrideTargetId('');
    }
  }, [overrideTargets]);

  const submitOverride = async () => {
    if (!selectedAttemptId || !overrideTargetId) return;

    try {
      await adminSubmissionsApi.overrideScore(selectedAttemptId, {
        targetType: overrideTargetType,
        targetId: overrideTargetId,
        newScore: Number(overrideScore),
        reason: overrideReason.trim() || 'Manual override',
      });
      await refreshAll();
      showToast.success('Override saqlandi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Override saqlanmadi'));
    }
  };

  const regenerateAnalysis = async () => {
    if (!selectedAttemptId) return;

    try {
      await adminSubmissionsApi.regenerateSpeakingAnalysis(selectedAttemptId);
      setAnalysisEnabled(true);
      await analysisQuery.refetch();
      showToast.success('Speaking analysis qayta generatsiya qilindi');
    } catch (error) {
      showToast.error(extractApiErrorMessage(error, 'Speaking analysis qayta generatsiya qilinmadi'));
    }
  };

  const paged = (listQuery.data ?? { items: [], total: 0, size: PAGE_SIZE }) as PagedResponse<AdminAttempt>;
  const totalCount = paged.totalCount ?? paged.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / (paged.size || PAGE_SIZE)));
  const from = totalCount === 0 ? 0 : page * (paged.size || PAGE_SIZE) + 1;
  const to = totalCount === 0 ? 0 : Math.min((page + 1) * (paged.size || PAGE_SIZE), totalCount);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <AdminCard>
          <div className="grid gap-3 lg:grid-cols-4">
            <AdminSelectField label="Status" value={statusFilter} options={ATTEMPT_STATUS_OPTIONS} onChange={(value) => { setStatusFilter(value as '' | AttemptStatus); setPage(0); }} />
            <AdminSelectField
              label="Test"
              value={testFilter}
              options={[{ value: '', label: 'Barcha testlar' }, ...(testsQuery.data?.items ?? []).map((test) => ({ value: test.id, label: test.title }))]}
              onChange={(value) => { setTestFilter(value); setPage(0); }}
            />
            <AdminInputField label="User ID" value={userIdFilter} onChange={(value) => { setUserIdFilter(value); setPage(0); }} placeholder="UUID bo‘yicha filter" />
            <div className="flex items-end">
              <AdminButton onClick={() => listQuery.refetch()}>Yangilash</AdminButton>
            </div>
          </div>
        </AdminCard>

        {listQuery.isLoading ? (
          <div className="flex items-center justify-center py-20"><AdminSpinner size="lg" tone="primary" /></div>
        ) : listQuery.error ? (
          <PanelError message={extractApiErrorMessage(listQuery.error, 'Submissionlar ro‘yxati olinmadi')} />
        ) : (
          <>
            <AdminCard className="overflow-hidden" padding="none">
              <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/[0.07] text-white/60 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Attempt</th>
                      <th className="text-left px-4 py-3">Test</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Score</th>
                      <th className="text-left px-4 py-3">Started</th>
                      <th className="text-left px-4 py-3">Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listQuery.data?.items ?? []).map((attempt) => (
                      <tr key={attempt.id} className="border-b border-white/[0.06] hover:bg-white/[0.025]">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{attempt.id.slice(0, 8)}...</p>
                          <p className="text-white/35 text-[11px]">{attempt.cefrLevel}</p>
                        </td>
                        <td className="px-4 py-3 text-white/70">{attempt.testTitle}</td>
                        <td className="px-4 py-3"><AdminBadge tone={badgeToneByStatus(attempt.status)}>{attempt.status}</AdminBadge></td>
                        <td className="px-4 py-3 text-white/70">{attempt.totalScore ?? '-'} / {attempt.maxTotalScore ?? '-'}</td>
                        <td className="px-4 py-3 text-white/55">{formatDate(attempt.startedAt)}</td>
                        <td className="px-4 py-3">
                          <AdminButton size="chip" onClick={() => setSelectedAttemptId(attempt.id)}>Ko‘rish</AdminButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>

            <PaginationBar page={page} totalPages={totalPages} from={from} to={to} totalCount={totalCount} onPageChange={setPage} />
          </>
        )}
      </div>

      <div className="space-y-4">
        {!selectedAttemptId ? (
          <AdminCard className="py-16 text-center text-white/35">Detail ko‘rish uchun attempt tanlang.</AdminCard>
        ) : detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-20"><AdminSpinner size="lg" tone="primary" /></div>
        ) : detailQuery.error || !detail ? (
          <PanelError message={extractApiErrorMessage(detailQuery.error, 'Submission detail olinmadi')} />
        ) : (
          <>
            <AdminCard className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-black text-lg">{detail.testTitle}</h3>
                <AdminBadge tone={badgeToneByStatus(detail.status)}>{detail.status}</AdminBadge>
                {detail.estimatedCefrLevel ? <AdminBadge tone="neutral">{detail.estimatedCefrLevel}</AdminBadge> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <AdminCard tone="dark">
                  <p className="text-white/45 text-xs uppercase">User</p>
                  <p className="text-white font-semibold mt-1">{detail.userName || detail.userEmail || detail.userId}</p>
                  <p className="text-white/35 text-xs mt-1">{detail.userId}</p>
                </AdminCard>
                <AdminCard tone="dark">
                  <p className="text-white/45 text-xs uppercase">Score</p>
                  <p className="text-white font-semibold mt-1">{detail.totalScore ?? '-'} / {detail.maxTotalScore ?? '-'}</p>
                  <p className="text-white/35 text-xs mt-1">Started: {formatDate(detail.startedAt)}</p>
                </AdminCard>
              </div>

              {detail.aiSummary ? (
                <AdminTextareaField label="AI summary" value={detail.aiSummary} onChange={() => undefined} readOnly rows={4} />
              ) : null}
            </AdminCard>

            <AdminCard className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-[1fr_200px_auto]">
                <AdminInputField label="Rescore reason" value={rescoreReason} onChange={setRescoreReason} />
                <AdminSelectField
                  label="Section"
                  value={rescoreSectionId}
                  options={[{ value: '', label: 'Butun attempt' }, ...detail.sections.map((section) => ({ value: section.sectionId, label: section.sectionTitle }))]}
                  onChange={setRescoreSectionId}
                />
                <div className="flex items-end">
                  <AdminButton variant="primary" onClick={rescore}>Rescore</AdminButton>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[180px_1fr_120px_1fr_auto]">
                <AdminSelectField
                  label="Target type"
                  value={overrideTargetType}
                  options={OVERRIDE_TARGET_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  onChange={(value) => setOverrideTargetType(value as typeof overrideTargetType)}
                />
                <AdminSelectField
                  label="Target"
                  value={overrideTargetId}
                  options={overrideTargets.map((item) => ({ value: item.value, label: item.label }))}
                  onChange={setOverrideTargetId}
                />
                <AdminInputField label="New score" value={overrideScore} onChange={setOverrideScore} />
                <AdminInputField label="Reason" value={overrideReason} onChange={setOverrideReason} />
                <div className="flex items-end">
                  <AdminButton variant="warning" onClick={submitOverride}>Override</AdminButton>
                </div>
              </div>

              {hasSpeaking && (
                <div className="flex flex-wrap gap-2">
                  <AdminButton onClick={() => { setAnalysisEnabled(true); analysisQuery.refetch(); }} size="sm">
                    Speaking analysisni ko‘rish
                  </AdminButton>
                  <AdminButton onClick={regenerateAnalysis} size="sm" variant="secondary">
                    Qayta generate
                  </AdminButton>
                </div>
              )}
            </AdminCard>

            <AdminCard className="space-y-3">
              <p className="text-white font-semibold">Sectionlar</p>
              <div className="space-y-2">
                {detail.sections.map((section) => (
                  <div key={section.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/85">{section.sectionTitle}</span>
                      <AdminBadge tone="orange">{section.skill}</AdminBadge>
                      <AdminBadge tone={badgeToneByStatus(section.status)}>{section.status}</AdminBadge>
                    </div>
                    <p className="text-white/40 text-xs mt-1">{section.sectionScore ?? '-'} / {section.maxSectionScore ?? '-'}</p>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard className="space-y-3">
              <p className="text-white font-semibold">Javoblar</p>
              <div className="space-y-2 max-h-[340px] overflow-auto pr-1">
                {detail.responses.map((response) => (
                  <div key={response.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AdminBadge tone="neutral">{response.questionType}</AdminBadge>
                      <span className="text-white/70 text-sm">{response.scoreAwarded ?? '-'} / {response.maxScore ?? '-'}</span>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap text-[11px] text-white/45">{JSON.stringify(response.answer, null, 2)}</pre>
                    {(response.rubricScores ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(response.rubricScores ?? []).map((score) => (
                          <AdminBadge key={`${response.id}-${score.criterionId}`} tone="premium">
                            {score.criterionName}: {score.score}/{score.maxScore}
                          </AdminBadge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard className="space-y-3">
              <p className="text-white font-semibold">Scoring jobs</p>
              <div className="space-y-2">
                {detail.scoringJobs.map((job) => (
                  <div key={job.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white/85 text-sm">{job.id.slice(0, 8)}...</p>
                      <p className="text-white/35 text-xs">{job.aiProvider || '-'} / {job.aiModel || '-'}</p>
                    </div>
                    <AdminBadge tone={badgeToneByStatus(job.status)}>{job.status}</AdminBadge>
                  </div>
                ))}
              </div>
            </AdminCard>

            {detail.overrides.length > 0 && (
              <AdminCard className="space-y-3">
                <p className="text-white font-semibold">Override tarixi</p>
                <div className="space-y-2">
                  {detail.overrides.map((override) => (
                    <div key={override.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AdminBadge tone="warning">{override.targetType}</AdminBadge>
                        <span className="text-white/70 text-sm">{override.previousScore ?? '-'} → {override.newScore}</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">{override.reason}</p>
                    </div>
                  ))}
                </div>
              </AdminCard>
            )}

            {analysisEnabled && (
              <AdminCard className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">Speaking analysis</p>
                  {analysisQuery.isFetching ? <AdminSpinner size="sm" tone="neutral" /> : null}
                </div>

                {analysisQuery.error ? (
                  <div className="text-white/40 text-sm">Bu attempt uchun speaking analysis topilmadi.</div>
                ) : analysisQuery.data ? (
                  <SpeakingAnalysisCard analysis={analysisQuery.data} />
                ) : (
                  <div className="text-white/40 text-sm">Speaking analysis yuklanmagan.</div>
                )}
              </AdminCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SpeakingAnalysisCard: React.FC<{ analysis: SpeakingAnalysis }> = ({ analysis }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 flex-wrap">
      {analysis.estimatedSpeakingLevel ? <AdminBadge tone="premium">{analysis.estimatedSpeakingLevel}</AdminBadge> : null}
      <span className="text-white/40 text-xs">{formatDate(analysis.generatedAt)}</span>
    </div>

    <AdminTextareaField label="Overall summary" value={analysis.overallSummary} onChange={() => undefined} readOnly rows={4} />

    <div className="grid gap-3 md:grid-cols-2">
      {analysis.partAnalyses.map((part) => (
        <AdminCard key={`${analysis.id}-${part.partNumber}`} tone="dark" className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">{part.partName}</p>
            <AdminBadge tone="neutral">{part.score}/{part.maxScore}</AdminBadge>
          </div>
          <div className="space-y-1">
            {part.criteriaBreakdown.map((criterion) => (
              <div key={`${part.partNumber}-${criterion.criterionName}`} className="text-white/65 text-sm">
                {criterion.criterionName}: {criterion.score}/{criterion.maxScore}
              </div>
            ))}
          </div>
        </AdminCard>
      ))}
    </div>
  </div>
);
