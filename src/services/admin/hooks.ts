import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../../utils/configs/toastConfig';
import { extractApiErrorMessage } from '../api';
import {
  adminTestsApi,
  adminUsersApi,
  CreateTestRequest,
  ListAdminTestsQuery,
  ListUsersQuery,
  UpdateRolesRequest,
  GrantAccessRequest,
  UpdateTestRequest,
} from './index';

export const ADMIN_QUERY_KEYS = {
  tests: 'admin.tests',
  users: 'admin.users',
  user: 'admin.user',
};

export const useAdminTestsQuery = (query: ListAdminTestsQuery = {}, enabled = true) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEYS.tests, query],
    queryFn: () => adminTestsApi.list(query),
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useCreateAdminTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTestRequest) => adminTestsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.tests] });
    },
  });
};

export const useUpdateAdminTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId, payload }: { testId: string; payload: UpdateTestRequest }) =>
      adminTestsApi.update(testId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.tests] });
    },
  });
};

export const useDeleteAdminTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => adminTestsApi.remove(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.tests] });
    },
  });
};

export const usePublishAdminTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => adminTestsApi.publish(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.tests] });
    },
  });
};

export const useArchiveAdminTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => adminTestsApi.archive(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.tests] });
    },
  });
};

export const useCreateAdminTestVersionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => adminTestsApi.createNewVersion(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.tests] });
    },
  });
};

export const useAdminUsersQuery = (query: ListUsersQuery = {}, enabled = true) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEYS.users, query],
    queryFn: () => adminUsersApi.list(query),
    enabled,
    staleTime: 20 * 1000,
  });
};

export const useUpdateAdminUserRolesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateRolesRequest }) =>
      adminUsersApi.updateRoles(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.users] });
    },
  });
};

export const useBlockAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.block(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.users] });
    },
  });
};

export const useUnblockAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.unblock(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.users] });
    },
  });
};

export const useGrantAdminUserAccessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: GrantAccessRequest }) =>
      adminUsersApi.grantAccess(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.users] });
    },
  });
};

export const useRemoveAdminUserAccessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.removeAccess(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.users] });
    },
  });
};

export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.remove(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.users] });
    },
  });
};

export const useAdminMutationErrorToast = () => {
  return (error: unknown, fallback: string) => {
    showToast.error(extractApiErrorMessage(error, fallback));
  };
};
