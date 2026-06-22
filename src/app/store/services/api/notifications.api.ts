import { hauliusApi } from './baseApi';
import type { NotificationCountResponse } from './types';

export const notificationsApi = hauliusApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationCount: builder.query<NotificationCountResponse, void>({
      query: () => '/api/notifications/count',
      providesTags: ['NotificationCount'],
    }),
  }),
});

export const { useGetNotificationCountQuery } = notificationsApi;
