import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/user';
import { clearStoredUser, setStoredUser } from '../../utils/authStorage';

export interface AuthState {
  user: UserProfile | null;
  token: string | null; // In-memory only — NOT persisted to localStorage
  isAuthenticated: boolean;
  adminApproved: boolean;
}

function buildInitialState(): AuthState {
  // Restore non-sensitive user profile from localStorage.
  // Actual authentication is handled by the httpOnly JWT cookie sent automatically by the browser.
  const savedUser = localStorage.getItem('currentUser');
  let user: UserProfile | null = null;

  if (savedUser) {
    try {
      user = JSON.parse(savedUser) as UserProfile;
    } catch {
      localStorage.removeItem('currentUser');
    }
  }

  if (!user) {
    // Clean up legacy auth storage
    localStorage.removeItem('auth');
    return { user: null, token: null, isAuthenticated: false, adminApproved: false };
  }

  return {
    user,
    token: null, // Never restored from storage — cookie handles API auth
    isAuthenticated: true,
    adminApproved: user.adminApproved ?? false,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: buildInitialState(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: UserProfile;
        token: string;
        userId: string;
        email: string;
        role: string;
        adminApproved?: boolean;
      }>
    ) {
      const { user, token, userId, email, role, adminApproved } = action.payload;
      const enriched = { ...user, adminApproved: adminApproved ?? false };
      state.user = enriched;
      state.token = token; // Held in memory for Authorization header fallback (dev/non-cookie flows)
      state.adminApproved = adminApproved ?? false;
      state.isAuthenticated = true;

      // Persist only non-sensitive profile data, never the raw token
      setStoredUser({ userId, email, role });
      localStorage.setItem('currentUser', JSON.stringify(enriched));

      // Remove any legacy token entry
      localStorage.removeItem('auth');
    },
    updateUserProfile(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
      state.adminApproved = action.payload.adminApproved ?? false;
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.adminApproved = false;
      clearStoredUser();
      localStorage.removeItem('currentUser');
    },
  },
});

export const { setCredentials, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
