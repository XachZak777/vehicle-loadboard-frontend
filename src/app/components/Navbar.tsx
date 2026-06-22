import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { PublicNavbar } from './PublicNavbar';
import { useGetMyBrokerProfileQuery, useGetMyCarrierProfileQuery, useGetNotificationCountQuery } from '../store/services/hauliusApi';
import { useLogout } from '../hooks/useLogout';
import { Button } from './ui/button';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard, Building2, LogOut, Plus,
  Star, Settings, ChevronDown, Menu, X, Search, History, Truck, Package,
  HelpCircle, MessageCircle, BookOpen, Phone,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { colors } from '../styles/colors';
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
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
    }
  };

  const isBrokerRole = user?.role === 'broker';
  const isCarrierRole = user?.role === 'carrier';
  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBrokerRole });
  const { data: carrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrierRole });

  useInactivityLogout();

  const handleLogout = useLogout();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return <PublicNavbar />;

  const isBrokerOrDealer = user.role === 'broker' || user.role === 'dealer';
  const isCarrier = user.role === 'carrier';
  const isAdmin = user.role === 'admin';

  const { data: notifData } = useGetNotificationCountQuery(undefined, {
    skip: isAdmin,
    pollingInterval: 30_000,
  });
  const notifCount = notifData?.total ?? 0;

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
    <>
    <nav className="bg-card border-b border-border !fixed top-0 left-0 right-0 !z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4 relative">
          {/* Logo */}
          <Link to="/loads" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <BrandLogo
              alt="Haulius"
              className="h-8 lg:h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link to="/loads">
              <Button
                variant="ghost"
                size="sm"
                className={isActive('/loads') ? 'font-semibold text-foreground' : 'text-muted-foreground'}
              >
                Load Board
              </Button>
            </Link>

            {(isBrokerOrDealer) && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 relative ${(isActive('/post-load') || location.pathname.startsWith('/broker')) ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                    <ChevronDown className="h-3 w-3" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white leading-none">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 sm:w-72 p-0">
                  <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                    <Link to="/post-load" className="flex items-center gap-3 w-full">
                      <Plus className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base">Post Load</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                    <Link to="/broker/dashboard" className="flex items-center gap-3 w-full">
                      <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base flex-1">My Loads</span>
                      {notifCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-bold text-white leading-none">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isCarrier && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 relative ${location.pathname.startsWith('/carrier') ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                    <ChevronDown className="h-3 w-3" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white leading-none">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 sm:w-72 p-0">
                  <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                    <Link to="/carrier/history" className="flex items-center gap-3 w-full">
                      <History className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base">My Loads</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                    <Link to="/carrier/assigned" className="flex items-center gap-3 w-full">
                      <Truck className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base flex-1">Assigned Loads</span>
                      {notifCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-bold text-white leading-none">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                    <Link to="/carrier/offers" className="flex items-center gap-3 w-full">
                      <Package className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base">Offers</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isAdmin && (
              <Link to="/admin/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={isActive('/admin/dashboard') ? 'font-semibold text-foreground' : 'text-muted-foreground'}
                >
                  Dashboard
                </Button>
              </Link>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  <HelpCircle className="h-4 w-4" />
                  Help
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-0">
                <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                  <Link to="/faq" className="flex items-center gap-3 w-full">
                    <MessageCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base">FAQ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                  <Link to="/resources" className="flex items-center gap-3 w-full">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base">Resources</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer">
                  <Link to="/contact" className="flex items-center gap-3 w-full">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base">Help Center</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center Search */}
          <div className="hidden lg:flex flex-1 max-w-sm items-center">
            <div className="flex w-full rounded-md border border-border bg-muted/40 overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500">
              <Search className="ml-2.5 self-center size-4 text-muted-foreground flex-shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Search companies... (Enter)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-8 px-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {searchQuery.trim().length >= 2 && (
                <button
                  onClick={handleSearch}
                  className={`px-2.5 h-8 text-xs font-medium ${colors.accentTextStrong} hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex-shrink-0`}
                >
                  Search
                </button>
              )}
            </div>
          </div>

          {/* Right: theme toggle + user menu */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />

            <DropdownMenu modal={false}>
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
                {!isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/my-rating" className="flex items-center gap-2 cursor-pointer">
                      <Star className="h-4 w-4" /> My Ratings
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Backdrop — closes mobile menu when tapping outside */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-16 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="relative z-50 lg:hidden border-t border-border py-4 space-y-2 max-h-[calc(100dvh-4rem)] overflow-y-auto">
            {/* Mobile search */}
            <div className="flex rounded-md border border-border bg-muted/40 overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 mb-2">
              <Search className="ml-2.5 self-center size-4 text-muted-foreground flex-shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { handleSearch(); setMobileMenuOpen(false); } }}
                className="flex-1 h-9 px-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {searchQuery.trim().length >= 2 && (
                <button
                  onClick={() => { handleSearch(); setMobileMenuOpen(false); }}
                  className={`px-2.5 h-9 text-xs font-medium ${colors.accentTextStrong} hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex-shrink-0`}
                >
                  Go
                </button>
              )}
            </div>

            <Link to="/loads" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm"
                className={`w-full justify-start ${isActive('/loads') ? 'font-semibold text-foreground' : ''}`}>
                Load Board
              </Button>
            </Link>

            {isBrokerOrDealer && (
              <>
                <Link to="/post-load" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/post-load') ? 'font-semibold text-foreground' : ''}`}>
                    <Plus className="h-4 w-4" /> Post Load
                  </Button>
                </Link>
                <Link to="/broker/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm"
                    className={`w-full justify-start gap-2 relative ${location.pathname.startsWith('/broker') ? 'font-semibold text-foreground' : ''}`}>
                    <LayoutDashboard className="h-4 w-4" /> My Loads
                    {notifCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-bold text-white leading-none">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/broker/company" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/broker/company') ? 'font-semibold text-foreground' : ''}`}>
                    <Building2 className="h-4 w-4" /> My Company
                  </Button>
                </Link>
              </>
            )}

            {isCarrier && (
              <>
                <Link to="/carrier/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/carrier/history') ? 'font-semibold text-foreground' : ''}`}>
                    <History className="h-4 w-4" /> My Loads
                  </Button>
                </Link>
                <Link to="/carrier/assigned" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm"
                    className={`w-full justify-start gap-2 relative ${isActive('/carrier/assigned') ? 'font-semibold text-foreground' : ''}`}>
                    <Truck className="h-4 w-4" /> Assigned Loads
                    {isCarrier && notifCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-bold text-white leading-none">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/carrier/offers" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm"
                    className={`w-full justify-start gap-2 ${isActive('/carrier/offers') ? 'font-semibold text-foreground' : ''}`}>
                    <Package className="h-4 w-4" /> Offers
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
                <Button variant="ghost" size="sm"
                  className={`w-full justify-start ${isActive('/admin/dashboard') ? 'font-semibold text-foreground' : ''}`}>
                  Dashboard
                </Button>
              </Link>
            )}

            {(isBrokerOrDealer || isCarrier) && (
              <Link to="/my-rating" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm"
                  className={`w-full justify-start gap-2 ${isActive('/my-rating') ? 'font-semibold text-foreground' : ''}`}>
                  <Star className="h-4 w-4" /> My Ratings
                </Button>
              </Link>
            )}

            <div className="pt-3 border-t border-border space-y-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <MessageCircle className="h-4 w-4" /> FAQ
                </Button>
              </Link>
              <Link to="/resources" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <BookOpen className="h-4 w-4" /> Resources
                </Button>
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" /> Help Center
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
    <div className="h-16" />
    </>
  );
}
