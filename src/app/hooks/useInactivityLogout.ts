import { useEffect, useRef } from 'react';
import { useLogout } from './useLogout';
import { toast } from 'sonner';

const TOTAL_TIMEOUT_MS = 60 * 60 * 1000;           // 1 hour
const WARN_BEFORE_MS   =  5 * 60 * 1000;           // warn 5 min before logout
const WARN_AT_MS       = TOTAL_TIMEOUT_MS - WARN_BEFORE_MS; // 55 min

const WARN_TOAST_ID = 'inactivity-warning';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

export function useInactivityLogout() {
  const performLogout = useLogout();
  const warnTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable ref so toast action button can call the latest resetTimer
  const resetTimerRef  = useRef<() => void>(() => {});

  useEffect(() => {
    const clearTimers = () => {
      if (warnTimerRef.current)   clearTimeout(warnTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      warnTimerRef.current   = null;
      logoutTimerRef.current = null;
    };

    const resetTimer = () => {
      clearTimers();
      toast.dismiss(WARN_TOAST_ID);

      warnTimerRef.current = setTimeout(() => {
        toast.warning('Session expiring soon', {
          id: WARN_TOAST_ID,
          description: 'You will be signed out in 5 minutes due to inactivity.',
          duration: WARN_BEFORE_MS,
          action: {
            label: 'Stay signed in',
            onClick: () => resetTimerRef.current(),
          },
          cancel: {
            label: 'Sign out',
            onClick: performLogout,
          },
        });
      }, WARN_AT_MS);

      logoutTimerRef.current = setTimeout(() => {
        toast.dismiss(WARN_TOAST_ID);
        toast.warning('You have been signed out due to inactivity.');
        performLogout();
      }, TOTAL_TIMEOUT_MS);
    };

    resetTimerRef.current = resetTimer;

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [performLogout]);
}
