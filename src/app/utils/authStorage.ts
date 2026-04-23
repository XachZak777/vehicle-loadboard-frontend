// Stores only non-sensitive user metadata. The JWT lives in an httpOnly
// cookie set by the backend — it is never accessible from JavaScript.
const CURRENT_USER_KEY = 'currentUser';

export type StoredUser = {
  userId: string;
  email: string;
  role: string;
};

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  // Clean up any token that may have been stored by an older version
  localStorage.removeItem('auth');
}

// Legacy shims so existing callers don't break during migration
/** @deprecated Use getStoredUser() */
export function getAuth(): StoredUser | null {
  return getStoredUser();
}

/** @deprecated Use setStoredUser() */
export function setAuth(user: StoredUser) {
  setStoredUser(user);
}

/** @deprecated Use clearStoredUser() */
export function clearAuth() {
  clearStoredUser();
}

export function getToken(): null {
  // Token is no longer stored in JS — it lives in the httpOnly cookie.
  return null;
}
