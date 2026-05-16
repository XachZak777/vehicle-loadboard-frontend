import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold">Haulius</h1>
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: April 13, 2026</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Haulius ("we," "our," or "us"). We are committed to protecting your privacy and the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our vehicle transportation load board platform.
              </p>
              <p>
                By accessing or using Haulius, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Account Registration:</strong> Name, email address, phone number, company name, and password</li>
                <li><strong>Carrier Verification:</strong> FMCSA MC Number, DOT Number, USDOT information, operating authority, and insurance details</li>
                <li><strong>Broker Verification:</strong> MC Number, DOT Number, broker authority, and business credentials</li>
                <li><strong>Financial Information:</strong> W9 tax forms, EIN/Tax ID, banking information for payment processing</li>
                <li><strong>Insurance Documents:</strong> Cargo insurance, liability insurance, and coverage certificates</li>
                <li><strong>Phone Verification:</strong> SMS verification codes and phone authentication data</li>
                <li><strong>Load Information:</strong> Vehicle details, pickup/delivery locations, dates, pricing, and shipping requirements</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>IP address, browser type, and device information</li>
                <li>Usage data, including pages visited, features used, and time spent on the platform</li>
                <li>Location data (with your permission)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Third-Party Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>FMCSA public database information for carrier verification</li>
                <li>Credit and background check information (with your consent)</li>
                <li>Insurance verification from third-party providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your account</li>
                <li>To verify your identity and credentials through FMCSA database</li>
                <li>To process load bookings and facilitate transactions between carriers and brokers</li>
                <li>To send email notifications about load status, bookings, and platform updates</li>
                <li>To process payments and maintain financial records</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To comply with legal obligations and regulatory requirements</li>
                <li>To improve our services and develop new features</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Information Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.1 With Other Users</h3>
              <p className="mb-4">
                When you book a load or post a load, certain information is shared with the other party, including company name, contact information, FMCSA credentials, and relevant load details. Brokers can see carrier information for booked loads, and carriers can see broker information for loads they book.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Service Providers</h3>
              <p className="mb-4">
                We may share your information with third-party service providers who perform services on our behalf, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Payment processors and financial institutions</li>
                <li>SMS and email service providers</li>
                <li>Cloud hosting and data storage providers</li>
                <li>Insurance verification services</li>
                <li>Background check and credit reporting agencies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information when required by law, subpoena, court order, or governmental authority, or to protect our rights, property, or safety, or that of our users or the public.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Business Transfers</h3>
              <p>
                In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. FMCSA Data and Carrier Information</h2>
              <p className="mb-4">
                We access and display publicly available information from the Federal Motor Carrier Safety Administration (FMCSA) database to verify carrier credentials. This includes MC Numbers, DOT Numbers, operating authority, safety ratings, and insurance status. This information is already publicly available through FMCSA and is used to ensure platform safety and compliance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure payment processing through PCI-compliant providers</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Your Privacy Rights</h2>
              <p className="mb-3">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Opt out of marketing communications and certain data processing activities</li>
                <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings. For more information, see our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. After account deletion, we may retain certain information for legal, regulatory, or legitimate business purposes, including fraud prevention and compliance with DOT and FMCSA requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <p>
                Haulius is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using Haulius, you consent to the transfer of your information to the United States and other jurisdictions where we operate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the platform after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg">
                <p className="font-semibold mb-2">Haulius</p>
                <p>Phone: +1 (213) 829-5184</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-12 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 Haulius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
