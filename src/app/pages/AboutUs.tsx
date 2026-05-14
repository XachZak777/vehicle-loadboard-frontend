import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ArrowLeft, Shield, Users, Globe, Award } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { APP_NAME } from '../constants';

export function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold">{APP_NAME}</h1>
                <p className="text-xs text-muted-foreground">Vehicle Transport Network</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="size-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-amber-500/10 border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About {APP_NAME}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the most trusted vehicle transportation marketplace, connecting verified carriers and brokers across the United States.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">

          {/* Mission */}
          <div className="bg-card border border-border rounded-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {APP_NAME} was founded with a single purpose: to make vehicle transportation simpler, safer, and more transparent for everyone involved. Whether you're a broker managing hundreds of shipments a month or a carrier looking for quality loads, we built this platform with you in mind.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe the freight industry deserves modern tools — real-time visibility, verified participants, and frictionless payments. That's exactly what we deliver.
            </p>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">What We Stand For</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Trust & Verification',
                  desc: 'Every carrier and broker on our platform is verified against the FMCSA database. We don\'t cut corners on compliance so you don\'t have to.',
                },
                {
                  icon: Globe,
                  title: 'Nationwide Reach',
                  desc: 'From coast to coast, our load board connects transport professionals across all 50 states with real-time load availability.',
                },
                {
                  icon: Users,
                  title: 'Community First',
                  desc: 'We\'re more than a marketplace — we\'re a community of professionals who take pride in moving vehicles safely and on time.',
                },
                {
                  icon: Award,
                  title: 'Excellence in Service',
                  desc: 'We hold ourselves to the highest standard. Our platform is built for reliability, transparency, and ease of use.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-lg p-6 flex gap-4">
                  <div className="bg-amber-500 p-2.5 rounded-lg h-fit shrink-0">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Story */}
          <div className="bg-card border border-border rounded-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {APP_NAME} was born out of frustration with outdated load boards and unreliable freight matching systems. Our founders — veterans of the transportation industry — saw firsthand how much time and money was wasted on manual processes, phone calls, and paperwork.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In 2024, we set out to build the platform we always wished existed: one that automates compliance verification, surfaces the best loads instantly, and puts trust at the center of every transaction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, thousands of carriers and brokers rely on {APP_NAME} every day to keep vehicles moving across America. We're just getting started.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Join Us?</h2>
            <p className="text-muted-foreground mb-6">
              Become part of the fastest-growing vehicle transport network in the country.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-12 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base font-bold">{APP_NAME}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional vehicle transport marketplace connecting carriers and brokers nationwide.
              </p>
            </div>
            <div className="flex gap-8 md:gap-12 md:col-span-2">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact</Link></li>
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
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
