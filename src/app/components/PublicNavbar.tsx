import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { Button } from './ui/button';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const browseTo = user ? '/loads' : '/login';

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#' + id);
    }
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
            >
              How It Works
            </a>
            <Link to="/faq" className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors">FAQ</Link>
            <Link to="/resources" className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors">Resources</Link>
            <Link to="/contact" className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors">Help Center</Link>
            <ThemeToggle />
            {user ? (
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => navigate(browseTo)}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5 text-foreground" /> : <Menu className="size-5 text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <a
              href="/#features"
              className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              onClick={(e) => { scrollToSection(e, 'features'); setMobileMenuOpen(false); }}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              onClick={(e) => { scrollToSection(e, 'how-it-works'); setMobileMenuOpen(false); }}
            >
              How It Works
            </a>
            <Link to="/faq" className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link to="/resources" className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Resources
            </Link>
            <Link to="/contact" className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Help Center
            </Link>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                  onClick={() => { navigate(browseTo); setMobileMenuOpen(false); }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
