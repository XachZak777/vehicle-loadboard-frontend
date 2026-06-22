import { hauliusApi } from './baseApi';
import type { CreateLoadPayload, LoadDto, VinDecodeResult } from './types';

export const loadsApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    vinLookup: builder.query<VinDecodeResult, string>({
      query: (vin) => `/api/vin/${encodeURIComponent(vin)}`,
    }),
    getLoads: builder.query<LoadDto[], void>({
      query: () => '/api/loads',
      providesTags: ['Load'],
    }),
    getMyBrokerLoads: builder.query<LoadDto[], void>({
      query: () => '/api/loads/broker/my-loads',
      providesTags: ['Load'],
    }),
    getLoadsForCarrier: builder.query<LoadDto[], string>({
      query: (carrierId) => `/api/loads/carrier/${carrierId}`,
      providesTags: ['Load'],
    }),
    createLoad: builder.mutation<LoadDto, CreateLoadPayload>({
      query: (body) => ({ url: '/api/loads', method: 'POST', body }),
      invalidatesTags: ['Load'],
    }),
    updateLoad: builder.mutation<LoadDto, { id: string; body: CreateLoadPayload }>({
      query: ({ id, body }) => ({ url: `/api/loads/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Load'],
    }),
    deleteLoad: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/loads/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Load'],
    }),
    getPreferredLineLoads: builder.query<LoadDto[], void>({
      query: () => '/api/loads/carrier/preferred-loads',
      providesTags: ['Load'],
    }),
    getSavedLoads: builder.query<LoadDto[], void>({
      query: () => '/api/carriers/preferred-loads',
      providesTags: ['Load', { type: 'Load', id: 'SAVED' }],
    }),
    getSavedLoadIds: builder.query<string[], void>({
      query: () => '/api/carriers/preferred-loads/ids',
      providesTags: [{ type: 'Load', id: 'SAVED_IDS' }],
    }),
    addSavedLoad: builder.mutation<void, string>({
      query: (loadId) => ({ url: `/api/carriers/preferred-loads/${loadId}`, method: 'POST' }),
      invalidatesTags: [{ type: 'Load', id: 'SAVED' }, { type: 'Load', id: 'SAVED_IDS' }],
    }),
    removeSavedLoad: builder.mutation<void, string>({
      query: (loadId) => ({ url: `/api/carriers/preferred-loads/${loadId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Load', id: 'SAVED' }, { type: 'Load', id: 'SAVED_IDS' }],
    }),
    cancelBooking: builder.mutation<void, string>({
      query: (loadId) => ({ url: `/api/loads/${loadId}/cancel`, method: 'POST' }),
      invalidatesTags: ['Load', 'Bid'],
    }),
    autoAssignCarrier: builder.mutation<LoadDto, string>({
      query: (loadId) => ({ url: `/api/loads/${loadId}/auto-assign`, method: 'POST' }),
      invalidatesTags: (_result, _error, loadId) => ['Load', { type: 'Bid', id: loadId }],
    }),
    getLoad: builder.query<LoadDto, string>({
      query: (id) => `/api/loads/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Load', id }],
    }),
    updateLoadStatus: builder.mutation<LoadDto, string>({
      query: (loadId) => ({ url: `/api/loads/${loadId}/status`, method: 'PATCH' }),
      invalidatesTags: ['Load', 'Bid', 'NotificationCount'],
    }),
    rejectAssignedLoad: builder.mutation<void, string>({
      query: (loadId) => ({ url: `/api/loads/${loadId}/carrier/reject`, method: 'POST' }),
      invalidatesTags: ['Bid', 'Load', 'NotificationCount'],
    }),
  }),
});

export const {
  useLazyVinLookupQuery,
  useGetLoadsQuery,
  useGetMyBrokerLoadsQuery,
  useGetLoadsForCarrierQuery,
  useCreateLoadMutation,
  useUpdateLoadMutation,
  useDeleteLoadMutation,
  useGetPreferredLineLoadsQuery,
  useGetSavedLoadsQuery,
  useGetSavedLoadIdsQuery,
  useAddSavedLoadMutation,
  useRemoveSavedLoadMutation,
  useCancelBookingMutation,
  useAutoAssignCarrierMutation,
  useGetLoadQuery,
  useUpdateLoadStatusMutation,
  useRejectAssignedLoadMutation,
} = loadsApi;
