import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, DollarSign, Shield, Clock, Users, CheckCircle, ArrowRight, Menu, X, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { ThemeToggle } from '../components/ThemeToggle';
import { mockLoads } from '../data/mockLoads';
import { APP_NAME, APP_TAGLINE } from '../constants';

export function Welcome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  const backgroundImages = [
    'https://images.unsplash.com/photo-1772852336286-933f5b460e33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWhpY2xlJTIwdHJhbnNwb3J0JTIwdHJhaWxlcnxlbnwxfHx8fDE3NzQzNzgxNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1664972394043-396b6b33358b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0JTIwaGFyYm9yJTIwb2NlYW4lMjBzZWElMjBjYXJnbyUyMHNoaXBzfGVufDF8fHx8MTc3NDM4NDc2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1761590542271-27a3518ab957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBjYXJyaWVyJTIwdHJ1Y2slMjBoaWdod2F5JTIwdHJhbnNwb3J0fGVufDF8fHx8MTc3NDM3OTM3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  ];

  // Rotate background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get top 3 loads by price per mile
  const topLoads = [...mockLoads]
    .map(load => ({
      ...load,
      pricePerMile: load.price / load.distance
    }))
    .sort((a, b) => b.pricePerMile - a.pricePerMile)
    .slice(0, 3);

  // ── Smooth-scroll helpers ──────────────────────────────────────────────────
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Smart CTA targets based on auth state ─────────────────────────────────
  const browseTo  = user ? '/loads'     : '/login';
  const postTo    = user ? '/post-load' : '/login';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold">{APP_NAME}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{APP_TAGLINE}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              >
                How It Works
              </a>
              <ThemeToggle />
              {user ? (
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => navigate(browseTo)}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      Sign Up
                    </Button>
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
              {mobileMenuOpen ? (
                <X className="size-5 text-foreground" />
              ) : (
                <Menu className="size-5 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border">
              <a
                href="#features"
                className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                onClick={(e) => { scrollToSection(e, 'features'); setMobileMenuOpen(false); }}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                onClick={(e) => { scrollToSection(e, 'how-it-works'); setMobileMenuOpen(false); }}
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="block text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                onClick={(e) => { scrollToSection(e, 'pricing'); setMobileMenuOpen(false); }}
              >
                Pricing
              </a>
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
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Images with smooth transitions */}
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Vehicle Transport ${index + 1}`}
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50 transition-colors duration-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
            {/* Left: copy + CTAs */}
            <div className="flex flex-col items-start">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
                Professional Vehicle<br />Transport Network
              </h2>
              <p className="text-lg text-foreground/90 mb-8 leading-relaxed max-w-lg">
                Connect with verified carriers and brokers nationwide. Streamline your vehicle transport operations with real-time load tracking and secure transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link to={browseTo} className="w-full sm:w-auto">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white text-base px-8 h-12 gap-2 w-full shadow-lg">
                    Browse Load Board
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Top Loads card */}
            <div className="w-full">
              <div className="bg-card rounded-xl shadow-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Top Paying Loads</h3>
                  <Badge className="bg-amber-500 text-white">Live</Badge>
                </div>
                <div className="space-y-3">
                  {topLoads.map((load) => (
                    <div
                      key={load.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-amber-500 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-semibold text-sm mb-1 truncate">
                          {load.year} {load.make} {load.model}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {load.pickupCity}, {load.pickupState} → {load.deliveryCity}, {load.deliveryState}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {load.distance.toLocaleString()} mi
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-amber-500 text-lg">
                          ${load.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-amber-600 font-semibold">
                          ${load.pricePerMile.toFixed(2)}/mi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to={browseTo}>
                  <Button className="w-full mt-4" variant="outline">
                    View All Loads
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-amber-500 text-white border-0">Features</Badge>
            <h3 className="text-3xl font-bold mb-3">Industry-Leading Platform</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage vehicle transportation efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin,      title: 'Nationwide Coverage',    desc: 'Access loads from coast to coast with real-time availability updates' },
              { icon: Shield,      title: 'FMCSA Verified',         desc: 'All carriers verified through FMCSA database for compliance' },
              { icon: DollarSign,  title: 'Transparent Pricing',    desc: 'Clear pricing with no hidden fees or surprise charges' },
              { icon: Clock,       title: 'Real-Time Tracking',     desc: 'Track every load from pickup to delivery with status updates' },
              { icon: Users,       title: 'Direct Communication',   desc: 'Connect directly with carriers and brokers through the platform' },
              { icon: CheckCircle, title: 'Secure Payments',        desc: 'Protected transactions with automated payment processing' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
                <CardHeader className="px-5 pt-5 pb-5 gap-3">
                  <div className="bg-amber-500 p-2.5 rounded-lg w-fit">
                    <Icon className="size-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-sm">{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-amber-500 text-white border-0">Process</Badge>
            <h3 className="text-3xl font-bold mb-3">How It Works</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Create Account',      desc: 'Complete carrier verification and email confirmation' },
              { n: '2', title: 'Find or Post Loads',  desc: 'Browse available loads or post vehicle transport requests' },
              { n: '3', title: 'Connect & Ship',      desc: 'Coordinate pickup, track delivery, and process payment' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="bg-amber-500 text-white rounded-full size-14 flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg">
                  {n}
                </div>
                <h4 className="text-lg font-bold mb-2">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of carriers and brokers who trust {APP_NAME} for their vehicle transportation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to={browseTo}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white text-base px-8 h-12 gap-2">
                  Go to Load Board
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white text-base px-8 h-12">
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-2 text-base px-8 h-12">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-amber-500 p-1.5 rounded-lg">
                  <Truck className="size-5 text-white" />
                </div>
                <span className="text-base font-bold">{APP_NAME}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional vehicle transport marketplace connecting carriers and brokers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-amber-500 transition-colors">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-amber-500 transition-colors">How It Works</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-amber-500 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-amber-500 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
