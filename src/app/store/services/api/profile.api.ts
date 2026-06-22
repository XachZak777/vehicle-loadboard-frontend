import { hauliusApi } from './baseApi';
import type {
  BrokerProfile,
  BrokerPublicInfo,
  CarrierProfile,
  CarrierPublicInfo,
  DealerProfile,
  LoadDto,
  MeResponse,
  ProfileUpdatePayload,
} from './types';

export const profileApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => '/api/auth/me',
      providesTags: ['Profile'],
    }),
    getMyBrokerProfile: builder.query<BrokerProfile, void>({
      query: () => '/api/brokers/me',
      providesTags: ['Profile'],
    }),
    getMyCarrierProfile: builder.query<CarrierProfile, void>({
      query: () => '/api/carriers/me',
      providesTags: ['Profile'],
    }),
    getMyDealerProfile: builder.query<DealerProfile, void>({
      query: () => '/api/dealers/me',
      providesTags: ['Profile'],
    }),
    getCarrierPublicInfo: builder.query<CarrierPublicInfo, string>({
      query: (carrierId) => `/api/carriers/${carrierId}/public`,
    }),
    searchCarriers: builder.query<CarrierPublicInfo[], string>({
      query: (q) => `/api/carriers/search?q=${encodeURIComponent(q)}`,
    }),
    searchBrokers: builder.query<BrokerPublicInfo[], string>({
      query: (q) => `/api/brokers/search?q=${encodeURIComponent(q)}`,
    }),
    directAssignCarrier: builder.mutation<LoadDto, { loadId: string; carrierId: string }>({
      query: ({ loadId, carrierId }) => ({
        url: `/api/loads/${loadId}/assign/${carrierId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Load', 'Bid'],
    }),
    getBrokerPublicInfo: builder.query<BrokerPublicInfo, string>({
      query: (brokerId) => `/api/brokers/${brokerId}/public`,
    }),
    updateBrokerProfile: builder.mutation<{ message: string }, ProfileUpdatePayload>({
      query: (body) => ({ url: '/api/brokers/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    updateCarrierProfile: builder.mutation<{ message: string }, ProfileUpdatePayload>({
      query: (body) => ({ url: '/api/carriers/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
  useGetMyDealerProfileQuery,
  useGetCarrierPublicInfoQuery,
  useSearchCarriersQuery,
  useLazySearchCarriersQuery,
  useSearchBrokersQuery,
  useLazySearchBrokersQuery,
  useDirectAssignCarrierMutation,
  useGetBrokerPublicInfoQuery,
  useUpdateBrokerProfileMutation,
  useUpdateCarrierProfileMutation,
} = profileApi;
