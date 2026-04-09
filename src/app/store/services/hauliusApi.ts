import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export type AuthRole = 'BROKER' | 'CARRIER';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
};

export type CreateLoadPayload = {
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description?: string;
  weight?: number;
  price?: number;
};

export type LoadDto = {
  id: string;
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description?: string;
  weight?: number;
  price?: number;
  createdAt?: string;
  carrierId?: string;
  assignedCarrierId?: string;
  status?: string;
};

export type BidPayload = {
  loadId: string;
  amount: number;
  bookNow: boolean;
};

export type BidDto = {
  id: string;
  loadId: string;
  carrierId: string;
  amount: number;
  bookNow: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BrokerProfile = {
  id: string;
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  phoneNumber?: string;
  email?: string;
};

export type CarrierProfile = {
  id: string;
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  phoneNumber?: string;
  email?: string;
};

export const hauliusApi = createApi({
  reducerPath: 'hauliusApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta as any).env?.VITE_API_BASE_URL ?? '',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Load', 'Bid', 'Profile'],
  endpoints: (builder) => ({
    // ── Auth ──────────────────────────────────────────────────────────────
    register: builder.mutation<AuthResponse, { email: string; password: string; role: AuthRole }>({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
    }),
    loginUser: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
    }),

    // ── Loads ─────────────────────────────────────────────────────────────
    getLoads: builder.query<LoadDto[], void>({
      query: () => '/api/loads',
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

    // ── Bids ──────────────────────────────────────────────────────────────
    getBidsForLoad: builder.query<BidDto[], string>({
      query: (loadId) => `/api/loads/${loadId}/bids`,
      providesTags: (_result, _error, loadId) => [{ type: 'Bid', id: loadId }],
    }),
    placeBid: builder.mutation<BidDto, BidPayload>({
      query: (body) => ({ url: '/api/loads/bid', method: 'POST', body }),
      invalidatesTags: (_result, _error, { loadId }) => [{ type: 'Bid', id: loadId }, 'Load'],
    }),
    approveBid: builder.mutation<void, { loadId: string; bidId: string }>({
      query: ({ loadId, bidId }) => ({ url: `/api/loads/${loadId}/approve/${bidId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, { loadId }) => [{ type: 'Bid', id: loadId }, 'Load'],
    }),
    cancelBooking: builder.mutation<void, string>({
      query: (loadId) => ({ url: `/api/loads/${loadId}/cancel`, method: 'POST' }),
      invalidatesTags: ['Load', 'Bid'],
    }),

    // ── Profiles ──────────────────────────────────────────────────────────
    getMyBrokerProfile: builder.query<BrokerProfile, void>({
      query: () => '/api/brokers/me',
      providesTags: ['Profile'],
    }),
    getMyCarrierProfile: builder.query<CarrierProfile, void>({
      query: () => '/api/carriers/me',
      providesTags: ['Profile'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginUserMutation,
  useGetLoadsQuery,
  useGetLoadsForCarrierQuery,
  useCreateLoadMutation,
  useUpdateLoadMutation,
  useDeleteLoadMutation,
  useGetBidsForLoadQuery,
  usePlaceBidMutation,
  useApproveBidMutation,
  useCancelBookingMutation,
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
} = hauliusApi;
