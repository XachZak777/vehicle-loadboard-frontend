import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/user';
import { clearAuth, getAuth, setAuth } from '../../utils/authStorage';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  adminApproved: boolean;
}

function buildInitialState(): AuthState {
  const stored = getAuth();
  if (!stored) return { user: null, token: null, isAuthenticated: false, adminApproved: false };

  const savedUser = localStorage.getItem('currentUser');
  let user: UserProfile | null = savedUser ? JSON.parse(savedUser) : null;

  if (!user && stored) {
    const rawRole = stored.role?.toLowerCase() ?? '';
    const role: UserProfile['role'] =
      rawRole === 'broker' ? 'broker' : rawRole === 'admin' ? 'admin' : 'carrier';
    user = {
      id: stored.userId,
      role,
      email: stored.email,
      phoneNumber: '',
      phoneVerified: true,
      companyName: role === 'broker' ? 'Broker' : role === 'admin' ? 'Admin' : 'Carrier',
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
    adminApproved: user?.adminApproved ?? false,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: buildInitialState(),
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: UserProfile; token: string; userId: string; email: string; role: string; adminApproved?: boolean }>) {
      const { user, token, userId, email, role, adminApproved } = action.payload;
      state.user = { ...user, adminApproved: adminApproved ?? false };
      state.token = token;
      state.adminApproved = adminApproved ?? false;
      state.isAuthenticated = true;
      setAuth({ token, userId, email, role });
      localStorage.setItem('currentUser', JSON.stringify({ ...user, adminApproved: adminApproved ?? false }));
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
      clearAuth();
      localStorage.removeItem('currentUser');
    },
  },
});

export const { setCredentials, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
