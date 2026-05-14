import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { useLogout } from './useLogout';

const INACTIVITY_MS  = 2 * 60 * 60 * 1000; // 2 hours — reset on any activity
const ABSOLUTE_MS    = 8 * 60 * 60 * 1000; // 8 hours — never reset

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click',
];

export function useInactivityLogout() {
  const performLogout = useLogout();
  const role = useAppSelector((s) => s.auth.user?.role);

  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const absoluteRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!role || role === 'admin') return;

    const clearInactivity = () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };

    const scheduleInactivity = () => {
      clearInactivity();
      inactivityRef.current = setTimeout(() => performLogout(), INACTIVITY_MS);
    };

    scheduleInactivity();
    absoluteRef.current = setTimeout(() => performLogout(), ABSOLUTE_MS);

    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, scheduleInactivity, { passive: true }));

    return () => {
      clearInactivity();
      if (absoluteRef.current) clearTimeout(absoluteRef.current);
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, scheduleInactivity));
    };
  }, [performLogout, role]);
}
