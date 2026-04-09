import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/user';
import { clearAuth, getAuth, setAuth } from '../../utils/authStorage';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

function buildInitialState(): AuthState {
  const stored = getAuth();
  if (!stored) return { user: null, token: null, isAuthenticated: false };

  const savedUser = localStorage.getItem('currentUser');
  let user: UserProfile | null = savedUser ? JSON.parse(savedUser) : null;

  if (!user && stored) {
    const role = stored.role?.toLowerCase() === 'broker' ? 'broker' : 'carrier';
    user = {
      id: stored.userId,
      role,
      email: stored.email,
      phoneNumber: '',
      phoneVerified: true,
      companyName: role === 'broker' ? 'Broker' : 'Carrier',
      mcNumber: '',
      dotNumber: '',
      insuranceCompany: '',
      cargoInsurance: 0,
      liabilityInsurance: 0,
      taxId: '',
      taxIdType: 'EIN',
      fmcsaVerified: true,
      mailingAddress: '',
      city: '',
      state: '',
      zipCode: '',
      createdAt: new Date().toISOString(),
    };
  }

  return {
    user,
    token: stored.token,
    isAuthenticated: !!stored.token,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: buildInitialState(),
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: UserProfile; token: string; userId: string; email: string; role: string }>) {
      const { user, token, userId, email, role } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      setAuth({ token, userId, email, role });
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    updateUserProfile(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuth();
      localStorage.removeItem('currentUser');
    },
  },
});

export const { setCredentials, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
