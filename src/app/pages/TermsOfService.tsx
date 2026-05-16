import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function TermsOfService() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: April 13, 2026</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using Haulius ("Platform," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not access or use the Platform.
              </p>
              <p>
                These Terms apply to all users, including carriers, brokers, and any other individuals or entities who access or use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Services</h2>
              <p className="mb-4">
                Haulius is a vehicle transportation load board platform that connects freight brokers with motor carriers for the purpose of transporting vehicles across the United States. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A marketplace for posting and finding vehicle transportation loads</li>
                <li>Carrier and broker verification through FMCSA database integration</li>
                <li>Load booking and management tools</li>
                <li>Document management for compliance and insurance records</li>
                <li>Communication tools between carriers and brokers</li>
                <li>Payment facilitation services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Eligibility and Account Registration</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Eligibility</h3>
              <p className="mb-4">
                To use the Platform, you must be at least 18 years old, have the legal capacity to enter into a binding contract, and comply with all applicable laws and regulations. Carriers must hold a valid FMCSA Motor Carrier (MC) Number and DOT Number. Brokers must hold a valid FMCSA Freight Broker Authority.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Account Registration</h3>
              <p className="mb-4">
                You must create an account to access most features of the Platform. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Account Verification</h3>
              <p>
                All users are subject to identity and credential verification. Carriers must provide valid MC Number, DOT Number, insurance certificates, and W-9 tax forms. Brokers must provide valid broker authority credentials. Haulius reserves the right to deny or suspend access to any user who fails verification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Carrier Terms</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Carrier Obligations</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Maintain valid FMCSA operating authority at all times</li>
                <li>Carry adequate cargo and liability insurance as required by law</li>
                <li>Transport vehicles as agreed upon in accepted load agreements</li>
                <li>Comply with all federal, state, and local transportation regulations</li>
                <li>Provide accurate pickup and delivery information and updates</li>
                <li>Handle vehicles with reasonable care to prevent damage</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Carrier Representations</h3>
              <p>
                By using the Platform as a carrier, you represent and warrant that all information provided is accurate, your operating authority is in good standing, and you have the authority to enter into load agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Broker Terms</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Broker Obligations</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Maintain valid FMCSA freight broker authority at all times</li>
                <li>Post accurate and complete load information</li>
                <li>Honor agreed-upon rates and payment terms</li>
                <li>Provide timely payment to carriers upon load completion</li>
                <li>Comply with all applicable transportation brokerage laws and regulations</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Broker Representations</h3>
              <p>
                By using the Platform as a broker, you represent and warrant that your broker authority is in good standing and that all load information posted is accurate and complete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Load Agreements and Payments</h2>
              <p className="mb-4">
                When a carrier books a load posted by a broker, a binding load agreement is formed between the carrier and broker. Haulius facilitates this agreement but is not a party to it. Payment terms are established between the carrier and broker. Haulius may facilitate payment processing but is not responsible for disputes between carriers and brokers.
              </p>
              <p>
                Any fees charged by Haulius for use of the Platform are separate from and in addition to the agreed load rates between carriers and brokers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Prohibited Conduct</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Circumvent any security or verification measures</li>
                <li>Post loads or accept loads without the required operating authority</li>
                <li>Engage in any conduct that could harm other users or the Platform</li>
                <li>Use automated systems to scrape or collect data from the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
              <p className="mb-4">
                All content on the Platform, including but not limited to text, graphics, logos, software, and data compilations, is the property of Haulius or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Disclaimers and Limitation of Liability</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">9.1 Disclaimer of Warranties</h3>
              <p className="mb-4">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. HAULIUS DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">9.2 Limitation of Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HAULIUS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Haulius and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or relating to your use of the Platform, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              <p className="mb-4">
                Haulius reserves the right to suspend or terminate your account and access to the Platform at any time, with or without cause, and with or without notice. Upon termination, your right to use the Platform ceases immediately.
              </p>
              <p>
                You may terminate your account at any time by contacting us. Termination does not relieve you of obligations incurred prior to termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Dispute Resolution</h2>
              <p className="mb-4">
                Any disputes arising out of or relating to these Terms or your use of the Platform shall first be attempted to be resolved through informal negotiation. If informal resolution fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in the State of [State], USA.
              </p>
              <p>
                You waive any right to participate in class action lawsuits or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of [State], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Platform after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. Contact Us</h2>
              <p className="mb-4">
                If you have questions about these Terms of Service, please contact us:
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
