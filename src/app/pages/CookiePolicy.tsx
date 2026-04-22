import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Truck, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Truck className="size-6 text-white" />
              </div>
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
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: April 13, 2026</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p>
                Haulius uses cookies and similar tracking technologies to enhance your experience, analyze platform usage, maintain security, and provide personalized features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Essential Cookies</h3>
              <p className="mb-3">
                These cookies are necessary for the Platform to function properly and cannot be disabled in our systems. They are usually set in response to actions you take, such as logging in, setting privacy preferences, or filling in forms.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Authentication cookies:</strong> Keep you logged in as you navigate the Platform</li>
                <li><strong>Security cookies:</strong> Help detect fraud and protect your account</li>
                <li><strong>Session cookies:</strong> Maintain your session state and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Functional Cookies</h3>
              <p className="mb-3">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Theme preferences:</strong> Remember whether you prefer dark or light mode</li>
                <li><strong>Language settings:</strong> Store your preferred language</li>
                <li><strong>Display settings:</strong> Remember your preferred view and layout options</li>
                <li><strong>Filter preferences:</strong> Save your load search filters and sorting preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Performance and Analytics Cookies</h3>
              <p className="mb-3">
                These cookies help us understand how visitors interact with the Platform by collecting and reporting information anonymously. This helps us improve the user experience.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Usage analytics:</strong> Track which pages are visited and how long users spend on them</li>
                <li><strong>Error tracking:</strong> Identify technical issues and bugs</li>
                <li><strong>Performance monitoring:</strong> Measure page load times and platform performance</li>
                <li><strong>Feature usage:</strong> Understand which features are most popular</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.4 Targeting and Advertising Cookies</h3>
              <p className="mb-3">
                These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Advertising cookies:</strong> Deliver targeted advertisements based on your interests</li>
                <li><strong>Remarketing cookies:</strong> Show you relevant ads after you leave the Platform</li>
                <li><strong>Conversion tracking:</strong> Measure the effectiveness of our advertising campaigns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Third-Party Cookies</h2>
              <p className="mb-4">
                In addition to our own cookies, we may use various third-party services that set cookies on your device. These third parties include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Analytics providers:</strong> Google Analytics, Mixpanel, or similar services for usage analytics</li>
                <li><strong>Payment processors:</strong> Stripe, PayPal, or other payment service providers for secure transactions</li>
                <li><strong>Communication services:</strong> Email and SMS service providers for notifications</li>
                <li><strong>Security services:</strong> Fraud detection and prevention services</li>
                <li><strong>Social media platforms:</strong> If you choose to share content or connect your social media accounts</li>
                <li><strong>FMCSA verification:</strong> Services that verify carrier and broker credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. How We Use Cookies</h2>
              <p className="mb-3">We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication:</strong> To keep you logged in and verify your identity</li>
                <li><strong>Security:</strong> To detect and prevent fraud, unauthorized access, and suspicious activity</li>
                <li><strong>Preferences:</strong> To remember your settings, such as theme, language, and filters</li>
                <li><strong>Performance:</strong> To analyze how the Platform is used and identify areas for improvement</li>
                <li><strong>Features:</strong> To enable load tracking, notifications, and personalized recommendations</li>
                <li><strong>Marketing:</strong> To measure the effectiveness of our campaigns and show relevant advertisements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Specific Cookies Used on Haulius</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-lg overflow-hidden">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 border-b border-border">Cookie Name</th>
                      <th className="text-left p-3 border-b border-border">Purpose</th>
                      <th className="text-left p-3 border-b border-border">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-border">
                      <td className="p-3 font-mono">auth_token</td>
                      <td className="p-3">Maintains your login session</td>
                      <td className="p-3">30 days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-mono">theme_preference</td>
                      <td className="p-3">Stores your dark/light mode preference</td>
                      <td className="p-3">1 year</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-mono">user_id</td>
                      <td className="p-3">Identifies your account for personalization</td>
                      <td className="p-3">Session</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-mono">csrf_token</td>
                      <td className="p-3">Protects against cross-site request forgery</td>
                      <td className="p-3">Session</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-mono">load_filters</td>
                      <td className="p-3">Remembers your load search filters</td>
                      <td className="p-3">7 days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">_ga, _gid</td>
                      <td className="p-3">Google Analytics tracking</td>
                      <td className="p-3">2 years / 24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Local Storage and Similar Technologies</h2>
              <p className="mb-4">
                In addition to cookies, we may use other technologies to store information locally on your device, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Local Storage:</strong> HTML5 local storage to store larger amounts of data, such as cached load information</li>
                <li><strong>Session Storage:</strong> Temporary storage that is cleared when you close your browser</li>
                <li><strong>IndexedDB:</strong> For storing structured data to improve performance and enable offline functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Managing Your Cookie Preferences</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Browser Settings</h3>
              <p className="mb-4">
                Most web browsers allow you to control cookies through their settings. You can set your browser to refuse all cookies or to alert you when a cookie is being sent. However, if you disable cookies, some features of the Platform may not function properly.
              </p>
              <p className="mb-4">Here's how to manage cookies in popular browsers:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Opt-Out of Analytics</h3>
              <p className="mb-4">
                You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on, available at:
                <a href="https://tools.google.com/dlpage/gaoptout" className="text-amber-500 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                  https://tools.google.com/dlpage/gaoptout
                </a>
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">7.3 Advertising Opt-Out</h3>
              <p className="mb-4">
                To opt out of interest-based advertising, you can visit:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Digital Advertising Alliance: <a href="http://www.aboutads.info/choices" className="text-amber-500 hover:underline">www.aboutads.info/choices</a></li>
                <li>Network Advertising Initiative: <a href="http://www.networkadvertising.org/choices" className="text-amber-500 hover:underline">www.networkadvertising.org/choices</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Impact of Disabling Cookies</h2>
              <p className="mb-4">
                If you choose to disable cookies, you may experience reduced functionality on the Platform, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may need to log in every time you visit the Platform</li>
                <li>Your preferences and settings may not be saved</li>
                <li>Some features may not work as intended</li>
                <li>You may see less relevant content and advertisements</li>
                <li>Load filters and search preferences will not be remembered</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Do Not Track Signals</h2>
              <p>
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Our Platform currently does not respond to DNT signals, as there is no uniform standard for how to interpret them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Mobile Devices</h2>
              <p className="mb-4">
                When you access the Platform from a mobile device, we may collect similar information through mobile-specific technologies, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device identifiers (such as Apple IDFA or Android Advertising ID)</li>
                <li>Mobile cookies and similar technologies</li>
                <li>Location data (if you grant permission)</li>
              </ul>
              <p className="mt-4">
                You can manage mobile tracking through your device settings or by uninstalling the mobile app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Updates to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our data practices. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Your Rights and Choices</h2>
              <p className="mb-4">
                Depending on your location, you may have rights regarding cookies and tracking technologies, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to be informed about cookies being used</li>
                <li>The right to consent to or refuse non-essential cookies</li>
                <li>The right to access and delete cookie data</li>
                <li>The right to opt out of certain tracking activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. More Information</h2>
              <p className="mb-4">
                For more information about how we collect, use, and protect your data, please see our Privacy Policy. If you have questions about this Cookie Policy or would like to exercise your rights, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Contact Us</h2>
              <p className="mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg">
                <p className="font-semibold mb-2">Haulius</p>
                <p>Email: privacy@haulius.com</p>
                <p>Phone: 1-800-HAULIUS</p>
                <p>Address: 123 Transport Way, Logistics City, USA 12345</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-12 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-amber-500 p-1.5 rounded-lg">
                  <Truck className="size-5 text-white" />
                </div>
                <span className="text-base font-bold">Haulius</span>
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
                <li><Link to="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-amber-500 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 Haulius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
