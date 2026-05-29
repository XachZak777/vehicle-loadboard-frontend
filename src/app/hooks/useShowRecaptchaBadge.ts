import { useEffect } from 'react';

export function useShowRecaptchaBadge() {
  useEffect(() => {
    let badge = document.querySelector<HTMLElement>('.grecaptcha-badge');

    if (badge) {
      badge.style.visibility = 'visible';
    } else {
      const observer = new MutationObserver(() => {
        badge = document.querySelector<HTMLElement>('.grecaptcha-badge');
        if (badge) {
          badge.style.visibility = 'visible';
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        if (badge) badge.style.visibility = 'hidden';
      };
    }

    return () => {
      if (badge) badge.style.visibility = 'hidden';
    };
  }, []);
}
