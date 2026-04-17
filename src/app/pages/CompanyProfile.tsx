import { useAppSelector } from '../store/hooks';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Shield, 
  CheckCircle,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

// ── Reusable field row ──────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
          {label}
        </p>
        <div className="font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

// ── Section heading inside a card ──────────────────────────────────────────
function SectionCard({
  title,
  description,
  children,
  accentColor = 'amber',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  accentColor?: 'amber' | 'green' | 'blue' | 'violet';
}) {
  const accent: Record<string, string> = {
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 w-full ${accent[accentColor]}`} />
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-4">{children}</CardContent>
    </Card>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export function CompanyProfile() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {user.companyName || 'Company Profile'}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 capitalize hover:bg-white/30">
                  {user.role}
                </Badge>
                <span className="text-white/80 text-sm">
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Verification Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </span>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                  Carrier Verified
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {user.verificationDate
                    ? new Date(user.verificationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Verified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </span>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                  Phone Verified
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {user.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <SectionCard
            title="Company Information"
            description="Basic details about your company"
            accentColor="amber"
          >
            <div className="divide-y divide-border">
              <InfoRow icon={Building2} label="Company Name">
                {user.companyName}
              </InfoRow>
              <InfoRow icon={Shield} label="MC Number">
                {user.mcNumber}
              </InfoRow>
              <InfoRow icon={Shield} label="DOT Number">
                {user.dotNumber}
              </InfoRow>
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard
            title="Contact Information"
            description="How to reach your company"
            accentColor="blue"
          >
            <div className="divide-y divide-border">
              <InfoRow icon={Mail} label="Email Address">
                {user.email}
              </InfoRow>
              <InfoRow icon={Phone} label="Phone Number">
                {user.phoneNumber}
              </InfoRow>
              <InfoRow icon={MapPin} label="Mailing Address">
                <span>{user.mailingAddress}</span>
                <span className="block text-sm text-muted-foreground font-normal mt-0.5">
                  {user.city}, {user.state} {user.zipCode}
                </span>
              </InfoRow>
            </div>
          </SectionCard>

          {/* Insurance Information */}
          <SectionCard
            title="Insurance Information"
            description="Your coverage details"
            accentColor="green"
          >
            <div className="divide-y divide-border">
              <InfoRow icon={Shield} label="Insurance Company">
                {user.insuranceCompany}
              </InfoRow>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/40 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Cargo Insurance
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${user.cargoInsurance.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Liability Insurance
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${user.liabilityInsurance.toLocaleString()}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Tax Information */}
          <SectionCard
            title="Tax Information"
            description="W9 and tax identification details"
            accentColor="violet"
          >
            <div className="divide-y divide-border">
              <InfoRow icon={FileText} label="Tax ID Type">
                {user.taxIdType}
              </InfoRow>
              <InfoRow icon={FileText} label="Tax ID">
                {user.taxId.replace(/./g, (char: string, index: number) =>
                  index < user.taxId.length - 4 ? '•' : char
                )}
              </InfoRow>
            </div>

            {user.w9Document && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    W9 Document on File
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Document uploaded successfully
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Footer timestamp */}
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Account created{' '}
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
