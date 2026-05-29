import { useState } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const sections: FAQSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'What is Haulius?',
        answer:
          'Haulius is a vehicle transport load board connecting licensed brokers and dealers with verified carriers. Brokers post loads, carriers bid or get assigned, and both parties coordinate pickup and delivery through the platform.',
      },
      {
        question: 'Who can use Haulius?',
        answer:
          'Haulius is open to FMCSA-registered carriers, licensed brokers, and authorized dealers. All users go through an identity and authority verification process before gaining full access.',
      },
      {
        question: 'How do I sign up?',
        answer:
          'Click "Sign Up" on the homepage and choose your role — Carrier, Broker, or Dealer. Complete the registration steps including FMCSA lookup and document submission. Your account will be reviewed and activated by our admin team.',
      },
    ],
  },
  {
    title: 'For Carriers',
    items: [
      {
        question: 'How do I find and bid on loads?',
        answer:
          'Once your account is approved, browse available loads on the Load Board. Click a load to view details, then submit a bid with your price and preferred pickup/delivery dates. The broker will review and approve or decline.',
      },
      {
        question: 'What happens after my bid is approved?',
        answer:
          "You'll see the load move to your Assigned Loads page. From there you can view and print the Dispatch Sheet, confirm pickup, update delivery status, and coordinate directly with the broker.",
      },
      {
        question: 'Can I be directly assigned to a load without bidding?',
        answer:
          "Yes. Brokers can assign a carrier directly without going through the bidding process. You'll receive the assignment in your Assigned Loads and can accept or reject it.",
      },
      {
        question: 'What documents do I need to provide?',
        answer:
          'Carriers must provide proof of insurance, MC Authority certificate, and any other documents requested during registration. These are reviewed by our admin team.',
      },
    ],
  },
  {
    title: 'For Brokers & Dealers',
    items: [
      {
        question: 'How do I post a load?',
        answer:
          'After logging in, click "Post Load" from your dashboard. Fill in vehicle details, pickup and drop-off locations, dates, and pricing. The load becomes visible to carriers on the Load Board once published.',
      },
      {
        question: 'How do I approve a carrier bid?',
        answer:
          'Go to your dashboard and find the load. Under the "Pending Bids" tab you\'ll see all incoming bids. Review carrier details and click Approve to assign the carrier.',
      },
      {
        question: 'Can I edit a load after posting?',
        answer:
          'Yes. You can edit load details from your dashboard before a carrier has been assigned. Once a carrier is assigned, changes may require carrier consent.',
      },
      {
        question: 'What is a Direct Assignment?',
        answer:
          'Instead of waiting for bids, you can search for a registered carrier by name, DOT, or MC number and assign them directly to a load. The carrier will receive a notification and can accept or reject the assignment.',
      },
    ],
  },
];

export function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge className="mb-3 bg-amber-500 text-white border-0">FAQ</Badge>
          <h1 className="text-3xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Find answers to the most common questions about using Haulius as a carrier, broker, or dealer.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              {/* Section header */}
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">
                {section.title}
              </p>

              {/* Items */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {section.items.map((item, idx) => {
                  const key = `${section.title}-${idx}`;
                  const isOpen = openKey === key;
                  return (
                    <div key={key} className={idx < section.items.length - 1 ? 'border-b border-border' : ''}>
                      <button
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                      >
                        <span className="font-semibold text-sm">{item.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5">
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
