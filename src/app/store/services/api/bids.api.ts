import { hauliusApi } from './baseApi';
import type { BidDto, BidPayload, CarrierBidWithLoadDto, UpdateBidPayload } from './types';

export const bidsApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetBidsForLoadQuery,
  useGetMyCarrierBidsQuery,
  usePlaceBidMutation,
  useUpdateBidMutation,
  useApproveBidMutation,
  useRejectBidMutation,
} = bidsApi;
