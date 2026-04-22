import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { hauliusApi } from '../store/services/hauliusApi';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

export function useInactivityLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performLogout = useCallback(() => {
    dispatch(logout());
    dispatch(hauliusApi.util.resetApiState());
    toast.warning('You have been signed out due to inactivity.');
    navigate('/login');
  }, [dispatch, navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(performLogout, INACTIVITY_TIMEOUT_MS);
  }, [performLogout]);

  useEffect(() => {
    // Start the timer immediately
    resetTimer();

    // Reset timer on any user activity
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);
}
