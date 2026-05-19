import { Link } from 'react-router';
import { BrandLogo } from './BrandLogo';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { colors } from '../styles/colors';

interface AuthNavbarProps {
  /** Short subtitle shown below the app name (e.g. "Broker Registration") */
  subtitle?: string;
  /** Show a "Log In" button on the right */
  showLogin?: boolean;
  /** Show a "Sign Up" button on the right */
  showSignup?: boolean;
}

export function AuthNavbar({ subtitle, showLogin, showSignup }: AuthNavbarProps) {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandLogo className="h-8 w-auto" />
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </Link>

          {/* Right-side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {showLogin && (
              <Link to="/login">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
            )}
            {showSignup && (
              <Link to="/signup">
                <Button size="sm" className={colors.accentBtn}>
                  Sign Up
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
