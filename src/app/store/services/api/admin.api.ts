import { hauliusApi } from './baseApi';
import type {
  AdminBrokerProfilePayload,
  AdminCarrierProfilePayload,
  AdminDealerProfilePayload,
  AdminUserDto,
  DocumentUploadResponse,
} from './types';

export const adminApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUserDto[], void>({
      query: () => '/api/admin/users',
      providesTags: ['Profile'],
    }),
    getAdminUsersApproved: builder.query<AdminUserDto[], void>({
      query: () => '/api/admin/users/approved',
      providesTags: ['Profile'],
    }),
    getAdminUsersPending: builder.query<AdminUserDto[], void>({
      query: () => '/api/admin/users/pending',
      providesTags: ['Profile'],
    }),
    getAdminUsersRejected: builder.query<AdminUserDto[], void>({
      query: () => '/api/admin/users/rejected',
      providesTags: ['Profile'],
    }),
    getAdminUser: builder.query<AdminUserDto, string>({
      query: (id) => `/api/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Profile', id }],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),
    approveCarrier: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/carriers/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    declineCarrier: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/carriers/${id}/decline`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    revokeCarrier: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/carriers/${id}/revoke`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    deleteAdminCarrier: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/carriers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),
    approveBroker: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/brokers/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    declineBroker: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/brokers/${id}/decline`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    revokeBroker: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/brokers/${id}/revoke`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    approveDealer: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/dealers/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    declineDealer: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/dealers/${id}/decline`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    revokeDealer: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/dealers/${id}/revoke`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    deleteAdminBroker: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/brokers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),
    adminUpdateCarrierProfile: builder.mutation<
      { message: string },
      { id: string; body: AdminCarrierProfilePayload }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/carriers/${id}/profile`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUpdateBrokerProfile: builder.mutation<
      { message: string },
      { id: string; body: AdminBrokerProfilePayload }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/brokers/${id}/profile`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUpdateDealerProfile: builder.mutation<
      { message: string },
      { id: string; body: AdminDealerProfilePayload }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/dealers/${id}/profile`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUploadCarrierDocument: builder.mutation<
      DocumentUploadResponse,
      { carrierId: string; type: 'w9' | 'insurance' | 'mc-authority'; file: FormData }
    >({
      query: ({ carrierId, type, file }) => ({
        url: `/api/admin/carriers/${carrierId}/documents/${type}`,
        method: 'POST',
        body: file,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUploadBrokerDocument: builder.mutation<
      DocumentUploadResponse,
      { brokerId: string; type: 'w9' | 'mc-authority'; file: FormData }
    >({
      query: ({ brokerId, type, file }) => ({
        url: `/api/admin/brokers/${brokerId}/documents/${type}`,
        method: 'POST',
        body: file,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUploadDealerDocument: builder.mutation<
      DocumentUploadResponse,
      { dealerId: string; type: 'dealer-license' | 'corporate-paperwork'; file: FormData }
    >({
      query: ({ dealerId, type, file }) => ({
        url: `/api/admin/dealers/${dealerId}/documents/${type}`,
        method: 'POST',
        body: file,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUsersApprovedQuery,
  useGetAdminUsersPendingQuery,
  useGetAdminUsersRejectedQuery,
  useGetAdminUserQuery,
  useDeleteAdminUserMutation,
  useApproveCarrierMutation,
  useDeclineCarrierMutation,
  useRevokeCarrierMutation,
  useDeleteAdminCarrierMutation,
  useApproveBrokerMutation,
  useDeclineBrokerMutation,
  useRevokeBrokerMutation,
  useApproveDealerMutation,
  useDeclineDealerMutation,
  useRevokeDealerMutation,
  useDeleteAdminBrokerMutation,
  useAdminUpdateCarrierProfileMutation,
  useAdminUpdateBrokerProfileMutation,
  useAdminUpdateDealerProfileMutation,
  useAdminUploadCarrierDocumentMutation,
  useAdminUploadBrokerDocumentMutation,
  useAdminUploadDealerDocumentMutation,
} = adminApi;
