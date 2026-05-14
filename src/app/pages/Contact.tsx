import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { APP_NAME } from '../constants';
import { useState } from 'react';
import { isBusinessEmail, businessEmailError, isValidName, buildErrors, type FieldErrors } from '../utils/validation';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = buildErrors([
      [!formData.name.trim(), 'name', 'Full name is required.'],
      [!!formData.name.trim() && !isValidName(formData.name, 2, 100), 'name', 'Name must be 2–100 characters.'],
      [!formData.email.trim(), 'email', 'Email address is required.'],
      [!!formData.email.trim() && !isBusinessEmail(formData.email), 'email', businessEmailError],
      [!formData.subject, 'subject', 'Please select a topic.'],
      [!formData.message.trim(), 'message', 'Message is required.'],
      [!!formData.message.trim() && formData.message.trim().length < 10, 'message', 'Message must be at least 10 characters.'],
      [!!formData.message.trim() && formData.message.trim().length > 2000, 'message', 'Message must be 2,000 characters or fewer.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => { const err = { ...prev }; delete err[name]; return err; });
  };

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
          <div className="bg-amber-500 p-4 rounded-2xl w-fit mx-auto mb-6">
            <Mail className="size-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, suggestion, or need support? We'd love to hear from you. Our team typically responds within one business day.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-5">Get in Touch</h2>
              <div className="space-y-5">
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'support@haulius.com',
                    href: 'mailto:support@haulius.com',
                  },
                  {
                    icon: Phone,
                    label: 'Phone',
                    value: '1-800-HAULIUS',
                    href: 'tel:18004285487',
                  },
                  {
                    icon: MapPin,
                    label: 'Address',
                    value: '123 Transport Way\nLogistics City, USA 12345',
                    href: null,
                  },
                  {
                    icon: Clock,
                    label: 'Business Hours',
                    value: 'Mon–Fri: 8 AM – 6 PM CT\nSat: 9 AM – 2 PM CT',
                    href: null,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-3">
                    <div className="bg-amber-500/10 p-2 rounded-lg h-fit shrink-0">
                      <Icon className="size-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm hover:text-amber-500 transition-colors whitespace-pre-line">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm whitespace-pre-line">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-3">Specific Inquiries</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Carrier Support: </span>
                  <a href="mailto:carriers@haulius.com" className="hover:text-amber-500 transition-colors">
                    carriers@haulius.com
                  </a>
                </li>
                <li>
                  <span className="font-medium text-foreground">Broker Support: </span>
                  <a href="mailto:brokers@haulius.com" className="hover:text-amber-500 transition-colors">
                    brokers@haulius.com
                  </a>
                </li>
                <li>
                  <span className="font-medium text-foreground">Privacy: </span>
                  <a href="mailto:privacy@haulius.com" className="hover:text-amber-500 transition-colors">
                    privacy@haulius.com
                  </a>
                </li>
                <li>
                  <span className="font-medium text-foreground">Legal: </span>
                  <a href="mailto:legal@haulius.com" className="hover:text-amber-500 transition-colors">
                    legal@haulius.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-lg p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="bg-green-500/10 p-4 rounded-full w-fit mx-auto mb-4">
                    <Mail className="size-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Message Sent!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We'll get back to you within one business day.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="name">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          className={`w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${fieldErrors.name ? 'border-destructive' : 'border-border'}`}
                        />
                        {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          className={`w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${fieldErrors.email ? 'border-destructive' : 'border-border'}`}
                        />
                        {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="subject">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${fieldErrors.subject ? 'border-destructive' : 'border-border'}`}
                      >
                        <option value="">Select a topic...</option>
                        <option value="carrier-support">Carrier Support</option>
                        <option value="broker-support">Broker Support</option>
                        <option value="account">Account & Billing</option>
                        <option value="technical">Technical Issue</option>
                        <option value="verification">Verification Help</option>
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                      {fieldErrors.subject && <p className="text-xs text-destructive mt-1">{fieldErrors.subject}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="message">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe your question or issue in detail..."
                        className={`w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 transition resize-none ${fieldErrors.message ? 'border-destructive' : 'border-border'}`}
                      />
                      <div className="flex justify-between mt-1">
                        {fieldErrors.message
                          ? <p className="text-xs text-destructive">{fieldErrors.message}</p>
                          : <span />}
                        <p className="text-xs text-muted-foreground">{formData.message.length}/2000</p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11">
                      Send Message
                    </Button>
                  </form>
                </>
              )}
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
