// Barrel — the api is split into ./api/* by domain.
// Every endpoint is registered on the same `hauliusApi` instance via
// injectEndpoints, so consumers can keep importing types and hooks from here.

export * from './api/types';
export { hauliusApi } from './api/baseApi';
export * from './api/auth.api';
export * from './api/loads.api';
export * from './api/bids.api';
export * from './api/admin.api';
export * from './api/profile.api';
export * from './api/documents.api';
export * from './api/ratings.api';
export * from './api/ai.api';
export * from './api/notifications.api';
