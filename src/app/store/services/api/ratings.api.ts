import { hauliusApi } from './baseApi';
import type { MyRatingsResponse, SubmitRatingPayload } from './types';

export const ratingsApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyRatings: builder.query<MyRatingsResponse, void>({
      query: () => '/api/ratings/me',
      providesTags: ['Rating'],
    }),
    submitRating: builder.mutation<void, SubmitRatingPayload>({
      query: (body) => ({ url: '/api/ratings', method: 'POST', body }),
      invalidatesTags: ['Rating'],
    }),
    getCompanyRatings: builder.query<
      MyRatingsResponse,
      { targetType: 'broker' | 'carrier'; id: string }
    >({
      query: ({ targetType, id }) => `/api/ratings/${targetType}/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: 'Rating', id }],
    }),
    getMySubmittedLoadIds: builder.query<string[], void>({
      query: () => '/api/ratings/my-submitted-load-ids',
      providesTags: ['Rating'],
    }),
  }),
});

export const {
  useGetMyRatingsQuery,
  useSubmitRatingMutation,
  useGetCompanyRatingsQuery,
  useGetMySubmittedLoadIdsQuery,
} = ratingsApi;
