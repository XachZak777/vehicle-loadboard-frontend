import { hauliusApi } from './baseApi';
import type { AdminDocumentDto, DocumentUploadResponse } from './types';

export const documentsApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadBrokerW9: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/brokers/documents/w9',
        method: 'POST',
        body,
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
    uploadBrokerMcAuthority: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/brokers/documents/mc-authority',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile', 'Document'],
    }),
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
    uploadCarrierMcAuthority: builder.mutation<DocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/api/carriers/documents/mc-authority',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Profile', 'Document'],
    }),
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
  }),
});

export const {
  useUploadBrokerW9Mutation,
  useUploadDealerLicenseMutation,
  useUploadDealerCorporatePaperworkMutation,
  useUploadBrokerMcAuthorityMutation,
  useUploadCarrierW9Mutation,
  useUploadCarrierInsuranceMutation,
  useUploadCarrierMcAuthorityMutation,
  useGetMyBrokerDocumentsQuery,
  useGetMyCarrierDocumentsQuery,
  useDeleteBrokerDocumentMutation,
  useDeleteCarrierDocumentMutation,
} = documentsApi;
