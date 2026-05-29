import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '..';
import { sessionExpire } from '../slices/authSlice';

export type PreferredLine = { fromState: string; toState: string };

export type AuthRole = 'BROKER' | 'CARRIER' | 'DEALER';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
  companyName?: string;
};

export type LoginPendingResponse = {
  email: string;
  token?: string;
  userId?: string;
  role?: string;
  adminApproved?: boolean;
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
  captchaToken?: string;
};

export type AdditionalVehicle = {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleType?: string;
  vehicleCondition?: string;
  vin?: string;
  vehicleAdditionalInfo?: string;
  weight?: number;
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
  paymentNotes?: string;
  weight?: number;
  price?: number;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  orderId?: string;
  paymentMethod?: string;
  paymentTiming?: string;
  additionalVehicles?: AdditionalVehicle[];
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
  paymentNotes?: string;
  weight?: number;
  price?: number;
  distance?: number;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
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
  additionalVehicles?: AdditionalVehicle[];
};

export type VinDecodeResult = {
  vin: string;
  success: boolean;
  errorText?: string;

  // Identity
  make?: string;
  model?: string;
  year?: number;
  manufacturer?: string;

  // Classification
  vehicleType?: string;
  bodyClass?: string;
  trim?: string;

  // Engine
  engineHp?: string;
  cylinders?: string;
  displacementL?: string;
  engineConfiguration?: string;
  engineModel?: string;
  turbo?: string;

  // Drivetrain & Transmission
  driveType?: string;
  transmissionStyle?: string;
  transmissionSpeeds?: string;

  // Fuel
  fuelType?: string;

  // Dimensions & Weight
  doors?: number;
  seats?: number;
  wheelbase?: string;
  wheels?: number;
  gvwr?: string;

  // Origin
  plantCountry?: string;
  plantState?: string;
  plantCity?: string;

  // Market
  basePrice?: string;
  steeringLocation?: string;
};

export type BidPayload = {
  loadId: string;
  amount: number;
  bookNow: boolean;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  notes?: string;
};

export type UpdateBidPayload = {
  bidId: string;
  amount: number;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  notes?: string;
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
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  notes?: string;
};

export type CarrierBidWithLoadDto = {
  bidId: string | null;
  loadId: string;
  amount: number;
  bookNow: boolean;
  bidStatus: string;
  bidCreatedAt?: string;
  bidUpdatedAt?: string;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  pickupCity?: string;
  pickupState?: string;
  pickupZip?: string;
  dropCity?: string;
  dropState?: string;
  dropZip?: string;
  price?: number;
  loadCreatedAt?: string;
  pickupDate?: string;
  deliveryDate?: string;
  loadStatus?: string;
  brokerId?: string;
  orderId?: string;
  notes?: string;
  additionalVehicles?: AdditionalVehicle[];
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

export type DealerProfile = {
  companyName?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  businessPhone?: string;
  companyAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
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
  id?: string;
  dotNumber?: string;
  mcNumber?: string;
  legalName?: string;
  dbaName?: string;
  companyName?: string;
  operatingStatus?: string;
  safetyRating?: string;
  phyStreet?: string;
  phyCity?: string;
  phyState?: string;
  phyZip?: string;
  totalPowerUnits?: number;
  phoneNumber?: string;
  ratingScore?: number | null;
};

export type BrokerPublicInfo = {
  id?: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  companyName?: string;
  operatingStatus?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  ratingScore?: number | null;
  // Bond — company and agent contact only (policy/coverage/dates are private)
  bondCompany?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentPhone?: string;
};

export type SubmitRatingPayload = {
  targetId: string;
  targetType: 'broker' | 'carrier';
  loadId: string;
  type: 'positive' | 'negative';
  tags?: string[];
  comment?: string;
};

export type RatingDto = {
  id: string;
  type: 'positive' | 'negative';
  fromName?: string;
  fromRole?: string;
  loadTitle?: string;
  tags?: string[];
  comment?: string;
  createdAt?: string;
  loadId?: string;
};

export type RatingTagStat = {
  tag: string;
  count: number;
  total: number;
};

export type MyRatingsResponse = {
  positiveCount: number;
  negativeCount: number;
  tagStats?: RatingTagStat[];
  ratings: RatingDto[];
};

export type AdminDocumentDto = {
  documentId: string;
  documentType: string;
  originalName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type AdminCarrierProfilePayload = {
  companyName?: string;
  dbaName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: string;
  taxId?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferredLines?: string;
};

export type AdminBrokerProfilePayload = {
  companyName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  taxIdType?: string;
  taxId?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
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
  preferredLines?: string;
  // Broker-only bond fields
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
  // Dealer-only fields
  ownerFirstName?: string;
  ownerLastName?: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
  howDidYouHear?: string;
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
  tagTypes: ['Load', 'Bid', 'Profile', 'Rating', 'Document', 'NotificationCount'],
  endpoints: (builder) => ({
    // ── Auth ──────────────────────────────────────────────────────────────
    register: builder.mutation<
      AuthResponse,
      { email: string; password: string; role: AuthRole; captchaToken?: string }
    >({
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
    loginUser: builder.mutation<LoginPendingResponse, { email: string; password: string; captchaToken?: string }>({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
    }),

    verifyEmail: builder.query<void, string>({
      query: (token) => `/api/auth/verify-email?token=${token}`,
    }),
    resendVerification: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: '/api/auth/resend-verification',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<void, { email: string; captchaToken?: string }>({
      query: (body) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      void,
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/api/auth/reset-password',
        method: 'POST',
        body,
      }),
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
    updateLoad: builder.mutation<
      LoadDto,
      { id: string; body: CreateLoadPayload }
    >({
      query: ({ id, body }) => ({
        url: `/api/loads/${id}`,
        method: 'PUT',
        body,
      }),
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
    placeBid: builder.mutation<BidDto, BidPayload>({
      query: (body) => ({ url: '/api/loads/bid', method: 'POST', body }),
      invalidatesTags: (_result, _error, { loadId }) => [
        { type: 'Bid', id: loadId },
        'Load',
      ],
    }),
    updateBid: builder.mutation<BidDto, UpdateBidPayload>({
      query: ({ bidId, ...body }) => ({ url: `/api/loads/bid/${bidId}`, method: 'PUT', body }),
      invalidatesTags: ['Bid', 'Load'],
    }),
    approveBid: builder.mutation<void, { loadId: string; bidId: string }>({
      query: ({ loadId, bidId }) => ({
        url: `/api/loads/${loadId}/approve/${bidId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { loadId }) => [
        { type: 'Bid', id: loadId },
        'Load',
      ],
    }),
    rejectBid: builder.mutation<void, { loadId: string; bidId: string }>({
      query: ({ loadId, bidId }) => ({
        url: `/api/loads/${loadId}/reject/${bidId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { loadId }) => [
        { type: 'Bid', id: loadId },
        'Load',
      ],
    }),
    cancelBooking: builder.mutation<void, string>({
      query: (loadId) => ({
        url: `/api/loads/${loadId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Load', 'Bid'],
    }),
    autoAssignCarrier: builder.mutation<LoadDto, string>({
      query: (loadId) => ({
        url: `/api/loads/${loadId}/auto-assign`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, loadId) => [
        'Load',
        { type: 'Bid', id: loadId },
      ],
    }),
    getLoad: builder.query<LoadDto, string>({
      query: (id) => `/api/loads/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Load', id }],
    }),
    updateLoadStatus: builder.mutation<LoadDto, string>({
      query: (loadId) => ({
        url: `/api/loads/${loadId}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Load', 'Bid', 'NotificationCount'],
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
      query: (id) => ({
        url: `/api/admin/carriers/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    declineCarrier: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/admin/carriers/${id}/decline`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    revokeCarrier: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/admin/carriers/${id}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    deleteAdminCarrier: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/carriers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),
    approveBroker: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/admin/brokers/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    declineBroker: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/admin/brokers/${id}/decline`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    revokeBroker: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/admin/brokers/${id}/revoke`,
        method: 'POST',
      }),
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
    adminUpdateCarrierProfile: builder.mutation<{ message: string }, { id: string; body: AdminCarrierProfilePayload }>({
      query: ({ id, body }) => ({ url: `/api/admin/carriers/${id}/profile`, method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    adminUpdateBrokerProfile: builder.mutation<{ message: string }, { id: string; body: AdminBrokerProfilePayload }>({
      query: ({ id, body }) => ({ url: `/api/admin/brokers/${id}/profile`, method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    adminUploadCarrierDocument: builder.mutation<DocumentUploadResponse, { carrierId: string; type: 'w9' | 'insurance' | 'mc-authority'; file: FormData }>({
      query: ({ carrierId, type, file }) => ({
        url: `/api/admin/carriers/${carrierId}/documents/${type}`,
        method: 'POST',
        body: file,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUploadBrokerDocument: builder.mutation<DocumentUploadResponse, { brokerId: string; type: 'w9' | 'mc-authority'; file: FormData }>({
      query: ({ brokerId, type, file }) => ({
        url: `/api/admin/brokers/${brokerId}/documents/${type}`,
        method: 'POST',
        body: file,
        formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    adminUploadDealerDocument: builder.mutation<DocumentUploadResponse, { dealerId: string; type: 'dealer-license' | 'corporate-paperwork'; file: FormData }>({
      query: ({ dealerId, type, file }) => ({
        url: `/api/admin/dealers/${dealerId}/documents/${type}`,
        method: 'POST',
        body: file,
        formData: true,
      }),
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
    updateBrokerProfile: builder.mutation<
      { message: string },
      ProfileUpdatePayload
    >({
      query: (body) => ({ url: '/api/brokers/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    updateCarrierProfile: builder.mutation<
      { message: string },
      ProfileUpdatePayload
    >({
      query: (body) => ({
        url: '/api/carriers/profile',
        method: 'PATCH',
        body,
      }),
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
      invalidatesTags: ['Profile', 'Document'],
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
    uploadBrokerMcAuthority: builder.mutation<DocumentUploadResponse, FormData>(
      {
        query: (body) => ({
          url: '/api/brokers/documents/mc-authority',
          method: 'POST',
          body,
          formData: true,
        }),
        invalidatesTags: ['Profile', 'Document'],
      },
    ),
    uploadCarrierW9: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/carriers/documents/w9',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile', 'Document'],
    }),
    uploadCarrierInsurance: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/carriers/documents/insurance',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile', 'Document'],
    }),
    uploadCarrierMcAuthority: builder.mutation<
      DocumentUploadResponse,
      FormData
    >({
      query: (body) => ({
        url: '/api/carriers/documents/mc-authority',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile', 'Document'],
    }),

    // ── Document management ───────────────────────────────────────────────
    getMyBrokerDocuments: builder.query<AdminDocumentDto[], void>({
      query: () => '/api/brokers/documents',
      providesTags: ['Document'],
    }),
    getMyCarrierDocuments: builder.query<AdminDocumentDto[], void>({
      query: () => '/api/carriers/documents',
      providesTags: ['Document'],
    }),
    deleteBrokerDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/api/brokers/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
    deleteCarrierDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/api/carriers/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),

    // ── Ratings ───────────────────────────────────────────────────────────
    getMyRatings: builder.query<MyRatingsResponse, void>({
      query: () => '/api/ratings/me',
      providesTags: ['Rating'],
    }),
    submitRating: builder.mutation<void, SubmitRatingPayload>({
      query: (body) => ({ url: '/api/ratings', method: 'POST', body }),
      invalidatesTags: ['Rating'],
    }),
    getCompanyRatings: builder.query<MyRatingsResponse, { targetType: 'broker' | 'carrier'; id: string }>({
      query: ({ targetType, id }) => `/api/ratings/${targetType}/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: 'Rating', id }],
    }),
    getMySubmittedLoadIds: builder.query<string[], void>({
      query: () => '/api/ratings/my-submitted-load-ids',
      providesTags: ['Rating'],
    }),

    getAiUsage: builder.query<AiUsageResponse, void>({
      query: () => '/api/ai/usage',
    }),

    aiChat: builder.mutation<AiChatResponse, AiChatRequest>({
      query: (body) => ({ url: '/api/ai/chat', method: 'POST', body }),
    }),

    getNotificationCount: builder.query<NotificationCountResponse, void>({
      query: () => '/api/notifications/count',
      providesTags: ['NotificationCount'],
    }),

    rejectAssignedLoad: builder.mutation<void, string>({
      query: (loadId) => ({ url: `/api/loads/${loadId}/carrier/reject`, method: 'POST' }),
      invalidatesTags: ['Bid', 'Load', 'NotificationCount'],
    }),
  }),
});

export type AiChatRequest = {
  message: string;
  conversationId?: string;
  metadata?: {
    timestamp?: string;
    userRole?: string;
    equipmentType?: string;
  };
};

export type AiUsageResponse = {
  messagesUsed: number;
  messagesLimit: number;
  limitReached: boolean;
  resetAt: string;
};

export type NotificationCountResponse = {
  pendingBids: number;
  loadsNeedingAction: number;
  newAssignments: number;
  total: number;
};

export type AiChatResponse = {
  success: boolean;
  conversationId?: string;
  response?: {
    messageId: string;
    content: string;
    timestamp: string;
    relatedLoadIds: string[];
    confidence: number;
  };
  metadata?: {
    processingTimeMs: number;
    loadsQueried: number;
    loadsMatched: number;
    aiModel: string;
    messagesUsed: number;
    messagesLimit: number;
    resetAt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
    timestamp?: string;
    resetAt?: string;
  };
};

export const {
  useRegisterMutation,
  useRegisterDealerMutation,
  useUploadDealerW9Mutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestLoginCodeMutation,
  useVerifyLoginCodeMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLazyVinLookupQuery,
  useGetLoadsQuery,
  useGetMyBrokerLoadsQuery,
  useGetLoadsForCarrierQuery,
  useCreateLoadMutation,
  useUpdateLoadMutation,
  useDeleteLoadMutation,
  useGetBidsForLoadQuery,
  useGetMyCarrierBidsQuery,
  useGetPreferredLineLoadsQuery,
  useGetSavedLoadsQuery,
  useGetSavedLoadIdsQuery,
  useAddSavedLoadMutation,
  useRemoveSavedLoadMutation,
  usePlaceBidMutation,
  useUpdateBidMutation,
  useApproveBidMutation,
  useRejectBidMutation,
  useCancelBookingMutation,
  useAutoAssignCarrierMutation,
  useGetLoadQuery,
  useUpdateLoadStatusMutation,
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
  useApproveDealerMutation,
  useDeclineDealerMutation,
  useRevokeDealerMutation,
  useAdminUpdateCarrierProfileMutation,
  useAdminUpdateBrokerProfileMutation,
  useAdminUploadCarrierDocumentMutation,
  useAdminUploadBrokerDocumentMutation,
  useAdminUploadDealerDocumentMutation,
  useGetMyRatingsQuery,
  useGetCompanyRatingsQuery,
  useSubmitRatingMutation,
  useGetMySubmittedLoadIdsQuery,
  useGetMyBrokerDocumentsQuery,
  useGetMyCarrierDocumentsQuery,
  useDeleteBrokerDocumentMutation,
  useDeleteCarrierDocumentMutation,
  useAiChatMutation,
  useGetAiUsageQuery,
  useGetNotificationCountQuery,
  useRejectAssignedLoadMutation,
} = hauliusApi;
