import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  LoginRequest,
  LoginResponse,
  UserRequest,
  UserResponse,
  SubscriptionResponse,
  TestListResponse,
  TestDetailResponse,
  SectionDetailResponse,
  StartAttemptRequest,
  StartAttemptResponse,
  AttemptListResponse,
  AttemptDetailResponse,
  UpsertResponseRequest,
  UpsertResponseResponse,
  SubmitSectionRequest,
  SubmitSectionResponse,
  SubmitAttemptResponse,
  PresignUploadRequest,
  PresignUploadResponse,
  PresignDownloadRequest,
  PresignDownloadResponse,
  PagedTestListResponse,
  PagedAttemptListResponse,
  CefrLevel,
  UUID,
} from '../api/types';

const BASE_URL = 'https://api.managelc.uz';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Test', 'Attempt', 'Section', 'Response'],
  endpoints: (builder) => ({
    // ==================== AUTH ====================
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // ==================== USER ====================
    getMe: builder.query<UserResponse, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    updateMe: builder.mutation<UserResponse, UserRequest>({
      query: (data) => ({
        url: '/users/me',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    getSubscription: builder.query<SubscriptionResponse, void>({
      query: () => '/users/me/subscription',
      providesTags: ['User'],
    }),

    // ==================== TESTS ====================
    getTests: builder.query<
      PagedTestListResponse,
      { level?: CefrLevel; page?: number; size?: number }
    >({
      query: ({ level, page = 0, size = 20 }) => ({
        url: '/tests',
        params: { level, page, size },
      }),
      providesTags: ['Test'],
    }),

    getTest: builder.query<TestDetailResponse, UUID>({
      query: (testId) => `/tests/${testId}`,
      providesTags: (result, error, testId) => [{ type: 'Test', id: testId }],
    }),

    getSection: builder.query<SectionDetailResponse, { testId: UUID; sectionId: UUID }>({
      query: ({ testId, sectionId }) => `/tests/${testId}/sections/${sectionId}`,
      providesTags: (result, error, { sectionId }) => [{ type: 'Section', id: sectionId }],
    }),

    // ==================== ATTEMPTS ====================
    startAttempt: builder.mutation<StartAttemptResponse, StartAttemptRequest>({
      query: (data) => ({
        url: '/attempts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attempt'],
    }),

    getAttemptHistory: builder.query<PagedAttemptListResponse, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) => ({
        url: '/attempts',
        params: { page, size },
      }),
      providesTags: ['Attempt'],
    }),

    getAttempt: builder.query<AttemptDetailResponse, UUID>({
      query: (attemptId) => `/attempts/${attemptId}`,
      providesTags: (result, error, attemptId) => [{ type: 'Attempt', id: attemptId }],
    }),

    upsertResponse: builder.mutation<
      UpsertResponseResponse,
      { attemptId: UUID; data: UpsertResponseRequest }
    >({
      query: ({ attemptId, data }) => ({
        url: `/attempts/${attemptId}/responses`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { attemptId }) => [
        { type: 'Attempt', id: attemptId },
        'Response',
      ],
    }),

    submitSection: builder.mutation<
      SubmitSectionResponse,
      { attemptId: UUID; data: SubmitSectionRequest }
    >({
      query: ({ attemptId, data }) => ({
        url: `/attempts/${attemptId}/sections/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { attemptId }) => [{ type: 'Attempt', id: attemptId }],
    }),

    submitAttempt: builder.mutation<SubmitAttemptResponse, UUID>({
      query: (attemptId) => ({
        url: `/attempts/${attemptId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, attemptId) => [
        { type: 'Attempt', id: attemptId },
        'Attempt',
      ],
    }),

    // ==================== ASSETS ====================
    presignUpload: builder.mutation<PresignUploadResponse, PresignUploadRequest>({
      query: (data) => ({
        url: '/assets/presign-upload',
        method: 'POST',
        body: data,
      }),
    }),

    presignDownload: builder.mutation<PresignDownloadResponse, PresignDownloadRequest>({
      query: (data) => ({
        url: '/assets/presign-download',
        method: 'POST',
        body: data,
      }),
    }),

    getDownloadUrl: builder.query<PresignDownloadResponse, UUID>({
      query: (assetId) => `/assets/${assetId}/download-url`,
    }),
  }),
});

export const {
  // Auth
  useLoginMutation,

  // User
  useGetMeQuery,
  useUpdateMeMutation,
  useGetSubscriptionQuery,

  // Tests
  useGetTestsQuery,
  useGetTestQuery,
  useGetSectionQuery,

  // Attempts
  useStartAttemptMutation,
  useGetAttemptHistoryQuery,
  useGetAttemptQuery,
  useUpsertResponseMutation,
  useSubmitSectionMutation,
  useSubmitAttemptMutation,

  // Assets
  usePresignUploadMutation,
  usePresignDownloadMutation,
  useGetDownloadUrlQuery,
} = api;
