import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { 
  Truck, 
  LayoutDashboard, 
  History, 
  Building2, 
  Settings, 
  LogOut, 
  Plus,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  const carrierNavItems = [
    { path: '/loads', label: 'Load Board', icon: Truck },
    { path: '/carrier/history', label: 'My Loads', icon: History },
    { path: '/carrier/company', label: 'My Company', icon: Building2 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const brokerNavItems = [
    { path: '/loads', label: 'Load Board', icon: Truck },
    { path: '/broker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/broker/company', label: 'My Company', icon: Building2 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = user.role === 'carrier' ? carrierNavItems : brokerNavItems;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/loads" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold">LoadBoard Pro</span>
              <p className="text-xs text-muted-foreground">
                {user.role === 'carrier' ? 'Carrier Portal' : 'Broker Portal'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 ${active ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user.role === 'broker' && (
              <Link to="/post-load">
                <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                  Post Load
                </Button>
              </Link>
            )}
            
            <ThemeToggle />
            
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user.companyName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-start gap-2 ${active ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {user.role === 'broker' && (
              <Link to="/post-load" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                  Post Load
                </Button>
              </Link>
            )}

            <div className="pt-4 border-t border-border space-y-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user.companyName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
