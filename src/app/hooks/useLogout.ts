import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { hauliusApi, useLogoutUserMutation } from '../store/services/hauliusApi';

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutUser] = useLogoutUserMutation();

  return useCallback(async () => {
    try {
      await logoutUser().unwrap();
    } catch {
      // Cookie may already be gone — proceed regardless
    }
    dispatch(logout());
    dispatch(hauliusApi.util.resetApiState());
    navigate('/', { replace: true });
  }, [dispatch, navigate, logoutUser]);
}
