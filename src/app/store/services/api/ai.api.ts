import { hauliusApi } from './baseApi';
import type { AiChatRequest, AiChatResponse, AiUsageResponse } from './types';

export const aiApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiUsage: builder.query<AiUsageResponse, void>({
      query: () => '/api/ai/usage',
    }),
    aiChat: builder.mutation<AiChatResponse, AiChatRequest>({
      query: (body) => ({ url: '/api/ai/chat', method: 'POST', body }),
    }),
  }),
});

export const { useGetAiUsageQuery, useAiChatMutation } = aiApi;
