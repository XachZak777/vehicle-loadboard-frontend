import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../..';
import { sessionExpire } from '../../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta as any).env?.VITE_API_BASE_URL ?? '',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWith401Intercept: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
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
  endpoints: () => ({}),
});
