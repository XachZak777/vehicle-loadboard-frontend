import { Link } from 'react-router';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { APP_NAME } from '../constants';

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
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div>
              <span className="text-lg font-bold">{APP_NAME}</span>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
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
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
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
