import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ExternalLink, BookOpen } from 'lucide-react';
import { Link } from 'react-router';

interface RegulatoryLink {
  title: string;
  description: string;
  url: string;
}

interface PlatformGuide {
  title: string;
  description: string;
}

const regulatoryLinks: RegulatoryLink[] = [
  {
    title: 'DOT Regulations',
    description: 'Federal Motor Carrier Safety regulations and compliance guidelines.',
    url: 'https://www.fmcsa.dot.gov/regulations',
  },
  {
    title: 'FMCSA Licensing & Insurance',
    description: 'Register your authority and manage insurance filings.',
    url: 'https://www.fmcsa.dot.gov/registration',
  },
];

const platformGuides: PlatformGuide[] = [
  {
    title: 'Getting Started as a Carrier',
    description: 'How to complete registration and start bidding on loads.',
  },
  {
    title: 'Getting Started as a Broker',
    description: 'How to post loads and manage carrier assignments.',
  },
  {
    title: 'Understanding the Dispatch Sheet',
    description: 'What it contains and how to use it for each shipment.',
  },
  {
    title: 'Rating System',
    description: 'How ratings work and why they matter for your profile.',
  },
];

export function Resources() {
  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge className="mb-3 bg-amber-500 text-white border-0">Resources</Badge>
          <h1 className="text-3xl font-bold mb-3">Resources & Guides</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Everything you need to navigate vehicle transport.
          </p>
        </div>

        {/* Official Regulatory Links */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
            Official Regulatory Links
          </p>
          <div className="grid gap-4">
            {regulatoryLinks.map((link) => (
              <div
                key={link.title}
                className="bg-card border border-border rounded-lg p-5 flex items-start justify-between gap-4 hover:border-amber-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500 p-2 rounded-lg flex-shrink-0 mt-0.5">
                    <ExternalLink className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Guides */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
            Platform Guides
          </p>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {platformGuides.map((guide, idx) => (
              <Link
                key={guide.title}
                to="/faq"
                className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors ${
                  idx < platformGuides.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="bg-muted p-2 rounded-lg flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{guide.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
