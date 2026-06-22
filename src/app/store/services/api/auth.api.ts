import { hauliusApi } from './baseApi';
import type {
  AuthResponse,
  AuthRole,
  DocumentUploadResponse,
  LoginPendingResponse,
  RegisterBrokerFullPayload,
  RegisterCarrierFullPayload,
  RegisterDealerPayload,
} from './types';

export const authApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      AuthResponse,
      { email: string; password: string; role: AuthRole }
    >({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
    }),
    registerCarrierFull: builder.mutation<AuthResponse, RegisterCarrierFullPayload>({
      query: (body) => ({ url: '/api/carriers/register', method: 'POST', body }),
    }),
    registerBrokerFull: builder.mutation<AuthResponse, RegisterBrokerFullPayload>({
      query: (body) => ({ url: '/api/brokers/register', method: 'POST', body }),
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
  }),
});

export const {
  useRegisterMutation,
  useRegisterCarrierFullMutation,
  useRegisterBrokerFullMutation,
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
} = authApi;
