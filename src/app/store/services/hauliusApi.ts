import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';
import { sessionExpire } from '../slices/authSlice';

export type PreferredLine = { fromState: string; toState: string };

export type AuthRole = 'BROKER' | 'CARRIER' | 'DEALER';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
};

export type LoginPendingResponse = { email: string };

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
  // Broker-only bond fields
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
  // Carrier-only preferred lines (JSON-encoded)
  preferredLines?: string;
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

export type RegisterDealerPayload = {
  email: string;
  password: string;
  companyName: string;
  ownerFirstName: string;
  ownerLastName: string;
  businessPhone: string;
  companyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
  howDidYouHear?: string;
};

export type CreateLoadPayload = {
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  pickupContactName?: string;
  pickupContactPhone?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  dropContactName?: string;
  dropContactPhone?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleType?: string;
  vehicleCondition?: string;
  vin?: string;
  trailerType?: string;
  vehicleAdditionalInfo?: string;
  description?: string;
  weight?: number;
  price?: number;
  pickupDate?: string;
  deliveryDate?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  orderId?: string;
  paymentMethod?: string;
  paymentTiming?: string;
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
  pickupContactName?: string;
  pickupContactPhone?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  dropContactName?: string;
  dropContactPhone?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleType?: string;
  vehicleCondition?: string;
  vin?: string;
  trailerType?: string;
  description?: string;
  weight?: number;
  price?: number;
  distance?: number;
  pickupDate?: string;
  deliveryDate?: string;
  createdAt?: string;
  carrierId?: string;
  assignedCarrierId?: string;
  status?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  orderId?: string;
  paymentMethod?: string;
  paymentTiming?: string;
};

export type VinDecodeResult = {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  vehicleType?: string;
  bodyClass?: string;
  trim?: string;
  driveType?: string;
  fuelType?: string;
  engineHp?: string;
  cylinders?: string;
  displacementL?: string;
  success: boolean;
  errorText?: string;
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
  id?: string;
  // FMCSA / registration identity
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  operatingStatus?: string;
  brokerAuthorityActive?: boolean;
  // Profile-completion fields
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  taxIdType?: string;
  taxId?: string;
  // Bond fields
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
};

export type CarrierProfile = {
  id?: string;
  // FMCSA / registration identity
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  dbaName?: string;
  operatingStatus?: string;
  safetyRating?: string;
  verified?: boolean;
  phyCity?: string;
  phyState?: string;
  totalDrivers?: number;
  totalPowerUnits?: number;
  // Profile-completion fields
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: string;
  taxId?: string;
  preferredLines?: string;
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
  /** True when admin actively declined this registration (distinct from "never reviewed"). */
  declined: boolean;
  declinedAt?: string;
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
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: string;
  taxId?: string;
  carrierOperation?: string;
  documents: AdminDocumentDto[];
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta as any).env?.VITE_API_BASE_URL ?? '',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWith401Intercept: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && (api.getState() as RootState).auth.isAuthenticated) {
    api.dispatch(sessionExpire());
  }
  return result;
};

export const hauliusApi = createApi({
  reducerPath: 'hauliusApi',
  baseQuery: baseQueryWith401Intercept,
  tagTypes: ['Load', 'Bid', 'Profile'],
  endpoints: (builder) => ({
    // ── Auth ──────────────────────────────────────────────────────────────
    register: builder.mutation<AuthResponse, { email: string; password: string; role: AuthRole }>({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
    }),
    registerDealer: builder.mutation<AuthResponse, RegisterDealerPayload>({
      query: (body) => ({ url: '/api/dealers/register', method: 'POST', body }),
    }),
    uploadDealerW9: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/dealers/documents/w9',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    loginUser: builder.mutation<LoginPendingResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
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
    requestLoginCode: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/api/auth/request-login-code', method: 'POST', body }),
    }),
    verifyLoginCode: builder.mutation<AuthResponse, { email: string; code: string }>({
      query: (body) => ({ url: '/api/auth/verify-login-code', method: 'POST', body }),
    }),

    // ── VIN Lookup ────────────────────────────────────────────────────────
    vinLookup: builder.query<VinDecodeResult, string>({
      query: (vin) => `/api/vin/${encodeURIComponent(vin)}`,
    }),

    // ── Loads ─────────────────────────────────────────────────────────────
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
    uploadDealerLicense: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/dealers/documents/dealer-license',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadDealerCorporatePaperwork: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/dealers/documents/corporate-paperwork',
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
  useRegisterDealerMutation,
  useUploadDealerW9Mutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useValidateCarrierMutation,
  useValidateBrokerMutation,
  useSaveCarrierFromValidationMutation,
  useSaveBrokerFromValidationMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestLoginCodeMutation,
  useVerifyLoginCodeMutation,
  useGetMeQuery,
  useLazyVinLookupQuery,
  useGetLoadsQuery,
  useGetMyBrokerLoadsQuery,
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
  useUploadBrokerMcAuthorityMutation,
  useUploadDealerLicenseMutation,
  useUploadDealerCorporatePaperworkMutation,
  useUploadCarrierW9Mutation,
  useUploadCarrierInsuranceMutation,
  useUploadCarrierMcAuthorityMutation,
  // Admin — user management
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
  useDeleteAdminBrokerMutation,
} = hauliusApi;
