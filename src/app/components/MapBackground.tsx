import { useState, useEffect } from 'react';
import backgroundMapImage from '../../assets/background-map.jpg';

export function MapBackground() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `url(${backgroundMapImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: isDark ? 0.18 : 0.08,
        filter: isDark
          ? 'grayscale(20%) brightness(0.7) contrast(1.1)'
          : 'grayscale(85%) brightness(1.6) contrast(0.6)',
      }}
    />
  );
}
