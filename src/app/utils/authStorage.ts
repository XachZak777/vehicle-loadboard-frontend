import type { AuthResponse } from '../services/apiClient';

const AUTH_STORAGE_KEY = 'auth';

export type StoredAuth = Pick<AuthResponse, 'token' | 'userId' | 'email' | 'role'>;

export function getAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getAuth()?.token || null;
}

export function setAuth(auth: StoredAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
