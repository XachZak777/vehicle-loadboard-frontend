import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme } from '../store/slices/themeSlice';
import { Button } from './ui/button';
import { colors } from '../styles/colors';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(toggleTheme())}
      className={theme === 'dark' ? `${colors.slateText} hover:text-white hover:bg-slate-700` : `${colors.textSecondary} hover:text-gray-900 ${colors.bgMuted}`}
    >
      {theme === 'dark' ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

