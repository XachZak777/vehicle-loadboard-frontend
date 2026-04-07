import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Truck, MapPin, DollarSign, Shield, Clock, Users, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { mockLoads } from '../data/mockLoads';

export function Welcome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { theme } = useTheme();

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

  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Truck className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">LoadBoard Pro</h1>
                <p className="text-xs text-muted-foreground">Vehicle Transport Network</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a 
                href="#features" 
                className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                onClick={scrollToPricing}
                className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
              >
                Pricing
              </a>
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-6 text-foreground" />
              ) : (
                <Menu className="size-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border">
              <a 
                href="#features" 
                className="block text-sm font-medium text-foreground hover:text-amber-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block text-sm font-medium text-foreground hover:text-amber-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => { scrollToPricing(e); setMobileMenuOpen(false); }}
                className="block text-sm font-medium text-foreground hover:text-amber-500"
              >
                Pricing
              </a>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Images with Overlay - now with smooth transitions */}
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50 transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Professional Vehicle<br />Transport Network
              </h2>
              <p className="text-lg text-foreground/90 mb-8 leading-relaxed">
                Connect with verified carriers and brokers nationwide. Streamline your vehicle transport operations with real-time load tracking and secure transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white text-base px-8 h-12 gap-2 w-full sm:w-auto shadow-lg">
                    Browse Load Board
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12 border-2 border-amber-500 text-foreground hover:bg-amber-500/10 w-full sm:w-auto shadow-lg">
                    Post a Load
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-amber-400">10,000+</div>
                  <div className="text-sm text-foreground/70">Active Loads</div>
                </div>
                <div className="h-10 w-px bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">5,000+</div>
                  <div className="text-sm text-foreground/70">Verified Carriers</div>
                </div>
                <div className="h-10 w-px bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">99.8%</div>
                  <div className="text-sm text-foreground/70">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Top Loads Card */}
            <div className="relative">
              <div className="bg-card rounded-lg shadow-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Top Paying Loads</h3>
                  <Badge className="bg-green-600 text-white">Live</Badge>
                </div>
                <div className="space-y-3">
                  {topLoads.map((load, index) => (
                    <div 
                      key={load.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-amber-500 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">
                          {load.year} {load.make} {load.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {load.pickupCity}, {load.pickupState} → {load.deliveryCity}, {load.deliveryState}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {load.distance.toLocaleString()} mi
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-amber-500 text-lg">
                          ${load.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600 font-semibold">
                          ${load.pricePerMile.toFixed(2)}/mi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/login">
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
            <Card className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-amber-500 p-2.5 rounded-lg w-fit mb-3">
                  <MapPin className="size-5 text-white" />
                </div>
                <CardTitle className="text-base">Nationwide Coverage</CardTitle>
                <CardDescription className="text-sm">
                  Access loads from coast to coast with real-time availability updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-amber-500 p-2.5 rounded-lg w-fit mb-3">
                  <Shield className="size-5 text-white" />
                </div>
                <CardTitle className="text-base">FMCSA Verified</CardTitle>
                <CardDescription className="text-sm">
                  All carriers verified through FMCSA database for compliance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-amber-500 p-2.5 rounded-lg w-fit mb-3">
                  <DollarSign className="size-5 text-white" />
                </div>
                <CardTitle className="text-base">Transparent Pricing</CardTitle>
                <CardDescription className="text-sm">
                  Clear pricing with no hidden fees or surprise charges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-amber-500 p-2.5 rounded-lg w-fit mb-3">
                  <Clock className="size-5 text-white" />
                </div>
                <CardTitle className="text-base">Real-Time Tracking</CardTitle>
                <CardDescription className="text-sm">
                  Track every load from pickup to delivery with status updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-amber-500 p-2.5 rounded-lg w-fit mb-3">
                  <Users className="size-5 text-white" />
                </div>
                <CardTitle className="text-base">Direct Communication</CardTitle>
                <CardDescription className="text-sm">
                  Connect directly with carriers and brokers through the platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border hover:border-amber-500 transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-amber-500 p-2.5 rounded-lg w-fit mb-3">
                  <CheckCircle className="size-5 text-white" />
                </div>
                <CardTitle className="text-base">Secure Payments</CardTitle>
                <CardDescription className="text-sm">
                  Protected transactions with automated payment processing
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-muted text-foreground border border-border">Process</Badge>
            <h3 className="text-3xl font-bold mb-3">How It Works</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-amber-500 text-white rounded-full size-14 flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg">
                1
              </div>
              <h4 className="text-lg font-bold mb-2">Create Account</h4>
              <p className="text-sm text-muted-foreground">
                Complete FMCSA verification and phone confirmation
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-500 text-white rounded-full size-14 flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg">
                2
              </div>
              <h4 className="text-lg font-bold mb-2">Find or Post Loads</h4>
              <p className="text-sm text-muted-foreground">
                Browse available loads or post vehicle transport requests
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-500 text-white rounded-full size-14 flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg">
                3
              </div>
              <h4 className="text-lg font-bold mb-2">Connect & Ship</h4>
              <p className="text-sm text-muted-foreground">
                Coordinate pickup, track delivery, and process payment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-amber-500 text-white border-0">Pricing</Badge>
            <h3 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h3>
            <p className="text-lg text-muted-foreground">
              No hidden fees. Pay only for completed transactions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="text-xl">For Carriers</CardTitle>
                <CardDescription>Find and book loads</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">Free</span>
                  <span className="text-muted-foreground"> to join</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Unlimited load browsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>FMCSA verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Real-time notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Direct broker communication</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-500 shadow-lg">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-amber-500 text-white">Most Popular</Badge>
                <CardTitle className="text-xl">For Brokers</CardTitle>
                <CardDescription>Post loads and find carriers</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">Free</span>
                  <span className="text-muted-foreground"> to join</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Unlimited load postings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Carrier verification checks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Booking management dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Payment tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of carriers and brokers who trust LoadBoard Pro for their vehicle transportation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white text-base px-8 h-12">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-2 text-base px-8 h-12">
                Sign In
              </Button>
            </Link>
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
                <span className="text-base font-bold">LoadBoard Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional vehicle transport marketplace connecting carriers and brokers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-amber-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 LoadBoard Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}