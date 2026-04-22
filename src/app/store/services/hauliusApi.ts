import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export type AuthRole = 'BROKER' | 'CARRIER';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
};

export type MeResponse = {
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
  emailVerified: boolean;
  profileComplete: boolean;
};

export type ProfileUpdatePayload = {
  companyName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: 'EIN' | 'SSN';
  taxId?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export type DocumentUploadResponse = {
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type LookupRequest = {
  lookupValue: string;
  lookupType: 'DOT' | 'MC';
};

export type FmcsaInspectionStats = {
  inspections?: string;
  outOfService?: string;
  outOfServicePercent?: string;
  nationalAverage?: string;
};

export type FmcsaInspections = {
  vehicle?: FmcsaInspectionStats;
  driver?: FmcsaInspectionStats;
  hazmat?: FmcsaInspectionStats;
  iep?: FmcsaInspectionStats;
};

export type FmcsaCrashes = {
  tow?: number;
  fatal?: number;
  injury?: number;
  total?: number;
};

export type LookupResponse = {
  // Session
  validationId: string;
  lookupType: string;
  lookupValue: string;
  // Identity
  dotNumber: string;
  mcNumber: string;
  legalName: string;
  dbaName?: string;
  entityType?: string;
  // Status
  operatingStatus?: string;
  allowedToOperate?: string;
  outOfServiceDate?: string;
  latestUpdate?: string;
  // Physical address
  phyStreet?: string;
  phyCity?: string;
  phyState?: string;
  phyZip?: string;
  phyCountry?: string;
  // Mailing address
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
  // Contact / Fleet
  phone?: string;
  totalDrivers?: number;
  totalPowerUnits?: number;
  // Operation
  operationClassification?: string[];
  carrierOperation?: string[];
  cargoCarried?: string[];
  // MCS-150
  mcs150Date?: string;
  mcs150Mileage?: number;
  mcs150Year?: number;
  // Safety
  safetyRating?: string;
  safetyRatingDate?: string;
  safetyReviewDate?: string;
  safetyType?: string;
  // Inspections & Crashes
  usInspections?: FmcsaInspections;
  canadaInspections?: FmcsaInspections;
  usCrashes?: FmcsaCrashes;
  canadaCrashes?: FmcsaCrashes;
  // Broker-specific
  brokerAuthorityActive?: boolean;
};

export type SaveFromValidationRequest = {
  validationId: string;
  email: string;
  password: string;
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
  pickupDate?: string;
  deliveryDate?: string;
};

export type LoadDto = {
  id: string;
  brokerId?: string;
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
  pickupDate?: string;
  deliveryDate?: string;
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

export type CarrierBidWithLoadDto = {
  bidId: string;
  loadId: string;
  amount: number;
  bookNow: boolean;
  bidStatus: string;
  bidCreatedAt?: string;
  bidUpdatedAt?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  pickupCity?: string;
  pickupState?: string;
  dropCity?: string;
  dropState?: string;
  price?: number;
  loadCreatedAt?: string;
  pickupDate?: string;
  deliveryDate?: string;
  loadStatus?: string;
  brokerId?: string;
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

export type CarrierPublicInfo = {
  dotNumber?: string;
  mcNumber?: string;
  legalName?: string;
  dbaName?: string;
  companyName?: string;
  operatingStatus?: string;
  safetyRating?: string;
  phyCity?: string;
  phyState?: string;
  totalPowerUnits?: number;
  phoneNumber?: string;
};

export type BrokerPublicInfo = {
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  companyName?: string;
  operatingStatus?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  email?: string;
};

export type AdminDocumentDto = {
  documentId: string;
  documentType: string;
  originalName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type AdminUserDto = {
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
  adminApprovedAt?: string;
  emailVerified: boolean;
  fmcsaVerified?: boolean;
  verificationDate?: string;
  createdAt?: string;
  profileId?: string;
  companyName?: string;
  dbaName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insuranceCompany?: string;
  cargoInsurance?: string;
  liabilityInsurance?: string;
  taxIdType?: string;
  taxId?: string;
  carrierOperation?: string;
  documents: AdminDocumentDto[];
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

    // ── FMCSA Validation ──────────────────────────────────────────────────
    validateCarrier: builder.mutation<LookupResponse, LookupRequest>({
      query: (body) => ({ url: '/api/validate/carrier', method: 'POST', body }),
    }),
    validateBroker: builder.mutation<LookupResponse, LookupRequest>({
      query: (body) => ({ url: '/api/validate/broker', method: 'POST', body }),
    }),
    saveCarrierFromValidation: builder.mutation<AuthResponse, SaveFromValidationRequest>({
      query: (body) => ({ url: '/api/validate/carrier/save', method: 'POST', body }),
    }),
    saveBrokerFromValidation: builder.mutation<AuthResponse, SaveFromValidationRequest>({
      query: (body) => ({ url: '/api/validate/broker/save', method: 'POST', body }),
    }),
    verifyEmail: builder.query<void, string>({
      query: (token) => `/api/auth/verify-email?token=${token}`,
    }),
    resendVerification: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: '/api/auth/resend-verification', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: '/api/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: (body) => ({ url: '/api/auth/reset-password', method: 'POST', body }),
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
    getMyCarrierBids: builder.query<CarrierBidWithLoadDto[], void>({
      query: () => '/api/loads/carrier/my-bids',
      providesTags: ['Bid', 'Load'],
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
    // ── Admin — user management ───────────────────────────────────────────
    getAdminUsers: builder.query<AdminUserDto[], void>({
      query: () => '/api/admin/users',
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
    deleteAdminBroker: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/brokers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),

    // ── Profiles ──────────────────────────────────────────────────────────
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
    getCarrierPublicInfo: builder.query<CarrierPublicInfo, string>({
      query: (carrierId) => `/api/carriers/${carrierId}/public`,
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
    uploadBrokerW9: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/brokers/documents/w9',
        method: 'POST',
        body,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadBrokerInsurance: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/brokers/documents/insurance',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadBrokerMcAuthority: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/brokers/documents/mc-authority',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadCarrierW9: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/carriers/documents/w9',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadCarrierInsurance: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/carriers/documents/insurance',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadCarrierMcAuthority: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/carriers/documents/mc-authority',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginUserMutation,
  useValidateCarrierMutation,
  useValidateBrokerMutation,
  useSaveCarrierFromValidationMutation,
  useSaveBrokerFromValidationMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useGetLoadsQuery,
  useGetLoadsForCarrierQuery,
  useCreateLoadMutation,
  useUpdateLoadMutation,
  useDeleteLoadMutation,
  useGetBidsForLoadQuery,
  useGetMyCarrierBidsQuery,
  usePlaceBidMutation,
  useApproveBidMutation,
  useCancelBookingMutation,
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
  useGetCarrierPublicInfoQuery,
  useGetBrokerPublicInfoQuery,
  useUpdateBrokerProfileMutation,
  useUpdateCarrierProfileMutation,
  useUploadBrokerW9Mutation,
  useUploadBrokerInsuranceMutation,
  useUploadBrokerMcAuthorityMutation,
  useUploadCarrierW9Mutation,
  useUploadCarrierInsuranceMutation,
  useUploadCarrierMcAuthorityMutation,
  // Admin — user management
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useDeleteAdminUserMutation,
  useApproveCarrierMutation,
  useDeclineCarrierMutation,
  useDeleteAdminCarrierMutation,
  useApproveBrokerMutation,
  useDeclineBrokerMutation,
  useDeleteAdminBrokerMutation,
} = hauliusApi;
