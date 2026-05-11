import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useGetMyBrokerProfileQuery, useGetMyCarrierProfileQuery } from '../store/services/hauliusApi';
import { useLogout } from '../hooks/useLogout';
import { Button } from './ui/button';
import {
  Truck, LayoutDashboard, Building2, LogOut, Plus, FileText,
  Star, Settings, ChevronDown, Menu, X, Search, ClipboardList, Send, Tag,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { APP_NAME } from '../constants';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isBrokerRole = user?.role === 'broker';
  const isCarrierRole = user?.role === 'carrier';
  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBrokerRole });
  const { data: carrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrierRole });

  useInactivityLogout();

  const handleLogout = useLogout();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  const isBrokerOrDealer = user.role === 'broker' || user.role === 'dealer';
  const isCarrier = user.role === 'carrier';
  const isAdmin = user.role === 'admin';

  const apiProfile = isBrokerRole ? brokerProfile : isCarrierRole ? carrierProfile : null;
  const displayName = apiProfile?.legalName || apiProfile?.companyName || user.companyName;

  const portalLabel =
    isCarrier ? 'Carrier Portal' :
    isAdmin   ? 'Admin Panel'   :
    user.role === 'dealer' ? 'Dealer Portal' :
    'Broker Portal';

  const roleLabel =
    user.role === 'carrier' ? 'Carrier' :
    user.role === 'admin'   ? 'Admin'   :
    user.role === 'dealer'  ? 'Dealer'  :
    'Broker';

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/loads" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">{APP_NAME}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link to="/loads">
              <Button
                variant={isActive('/loads') ? 'default' : 'ghost'}
                size="sm"
                className={isActive('/loads') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
              >
                Load Board
              </Button>
            </Link>

            {(isBrokerOrDealer) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={location.pathname.startsWith('/broker') || location.pathname.startsWith('/post-load') ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-1 ${location.pathname.startsWith('/broker') || location.pathname.startsWith('/post-load') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/post-load" className="flex items-center gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" /> Post Load
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/broker/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" /> My Loads
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isCarrier && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={location.pathname.startsWith('/carrier') ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-1 ${location.pathname.startsWith('/carrier') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/carrier/history" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" /> My Loads
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/carrier/assigned" className="flex items-center gap-2 cursor-pointer">
                      <ClipboardList className="h-4 w-4" /> Assigned Loads
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/carrier/requested" className="flex items-center gap-2 cursor-pointer">
                      <Send className="h-4 w-4" /> Requested Loads
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/carrier/offers" className="flex items-center gap-2 cursor-pointer">
                      <Tag className="h-4 w-4" /> Offers
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isAdmin && (
              <Link to="/admin/dashboard">
                <Button
                  variant={isActive('/admin/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                  className={isActive('/admin/dashboard') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Center Search */}
          <div className="hidden lg:flex flex-1 max-w-sm items-center">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Right: theme toggle + user menu */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
                  <span>{displayName}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-semibold text-sm">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
                {(isBrokerOrDealer) && (
                  <DropdownMenuItem asChild>
                    <Link to="/broker/company" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-4 w-4" /> My Company
                    </Link>
                  </DropdownMenuItem>
                )}
                {isCarrier && (
                  <DropdownMenuItem asChild>
                    <Link to="/carrier/company" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-4 w-4" /> My Company
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4" /> My Ratings
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-2">
            <Link to="/loads" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/loads') ? 'default' : 'ghost'} size="sm"
                className={`w-full justify-start ${isActive('/loads') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                Load Board
              </Button>
            </Link>

            {isBrokerOrDealer && (
              <>
                <Link to="/post-load" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" /> Post Load
                  </Button>
                </Link>
                <Link to="/broker/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive('/broker/dashboard') ? 'default' : 'ghost'} size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/broker/dashboard') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link to={user.role === 'dealer' ? '/broker/company' : '/broker/company'} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Building2 className="h-4 w-4" /> My Company
                  </Button>
                </Link>
              </>
            )}

            {isCarrier && (
              <>
                <Link to="/carrier/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive('/carrier/history') ? 'default' : 'ghost'} size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/carrier/history') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                    <FileText className="h-4 w-4" /> My Loads
                  </Button>
                </Link>
                <Link to="/carrier/assigned" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive('/carrier/assigned') ? 'default' : 'ghost'} size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/carrier/assigned') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                    <ClipboardList className="h-4 w-4" /> Assigned Loads
                  </Button>
                </Link>
                <Link to="/carrier/requested" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive('/carrier/requested') ? 'default' : 'ghost'} size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/carrier/requested') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                    <Send className="h-4 w-4" /> Requested Loads
                  </Button>
                </Link>
                <Link to="/carrier/offers" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive('/carrier/offers') ? 'default' : 'ghost'} size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/carrier/offers') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                    <Tag className="h-4 w-4" /> Offers
                  </Button>
                </Link>
                <Link to="/carrier/company" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Building2 className="h-4 w-4" /> My Company
                  </Button>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant={isActive('/admin/dashboard') ? 'default' : 'ghost'} size="sm"
                  className={`w-full justify-start ${isActive('/admin/dashboard') ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                  Dashboard
                </Button>
              </Link>
            )}

            <div className="pt-3 border-t border-border space-y-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
