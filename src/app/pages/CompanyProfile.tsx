import { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  CheckCircle,
  Calendar,
  Truck,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
  useUpdateCarrierProfileMutation,
  type PreferredLine,
} from '../store/services/hauliusApi';
import { US_STATES } from '../constants';
import { toast } from 'sonner';

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
  accentColor?: 'amber' | 'green' | 'blue' | 'violet' | 'slate';
}) {
  const accent: Record<string, string> = {
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    slate: 'bg-slate-500',
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

// ── Preferred Lines Editor ──────────────────────────────────────────────────
function PreferredLinesEditor({ initialLines, onSave }: { initialLines: PreferredLine[]; onSave: (lines: PreferredLine[]) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState<PreferredLine[]>(initialLines);
  const [isSaving, setIsSaving] = useState(false);

  const addLine = () => setLines(prev => [...prev, { fromState: '', toState: '' }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'fromState' | 'toState', value: string) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(lines);
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLines(initialLines);
    setEditing(false);
  };

  return (
    <SectionCard title="Preferred Lanes" description="Origin-to-destination state pairs for loads you prefer" accentColor="amber">
      <div className="space-y-3">
        {!editing && (
          <>
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No preferred lanes configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {lines.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
                    {l.fromState}
                    <ArrowRight className="size-3 text-muted-foreground" />
                    {l.toState}
                  </span>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 mt-1" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
              Edit Lanes
            </Button>
          </>
        )}

        {editing && (
          <>
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={line.fromState} onValueChange={v => updateLine(i, 'fromState', v)}>
                  <SelectTrigger className="flex-1 h-8 text-sm">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                <Select value={line.toState} onValueChange={v => updateLine(i, 'toState', v)}>
                  <SelectTrigger className="flex-1 h-8 text-sm">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive shrink-0" onClick={() => removeLine(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {lines.length < 10 && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5 w-full" onClick={addLine}>
                <Plus className="size-3.5" />
                Add Lane
              </Button>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSave} disabled={isSaving}>
                <Save className="size-3.5" />
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={handleCancel}>
                <X className="size-3.5" />
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export function CompanyProfile() {
  const user = useAppSelector((s) => s.auth.user);
  const isBroker = user?.role === 'broker';
  const isCarrier = user?.role === 'carrier';

  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const { data: carrierProfile, refetch: refetchCarrier } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });
  const [updateCarrierProfile] = useUpdateCarrierProfileMutation();

  if (!user) return null;

  // Merge: auth-store values as base, API values as supplements (API may have FMCSA fields not in store)
  const profile = isBroker ? brokerProfile : carrierProfile;

  const companyName    = profile?.legalName  || profile?.companyName   || user.companyName;
  const mcNumber       = user.mcNumber      || profile?.mcNumber;
  const dotNumber      = user.dotNumber     || profile?.dotNumber;
  const phoneNumber    = user.phoneNumber   || profile?.phoneNumber;
  const mailingAddress = user.mailingAddress|| profile?.mailingAddress;
  const city           = user.city          || profile?.city;
  const state          = user.state         || profile?.state;
  const zipCode        = user.zipCode       || profile?.zipCode;
  const insuranceCo    = user.insuranceCompany || profile?.insuranceCompany;
  const cargoIns       = user.cargoInsurance   ?? profile?.cargoInsurance;
  const liabilityIns   = user.liabilityInsurance ?? profile?.liabilityInsurance;
  const taxIdType      = user.taxIdType     || profile?.taxIdType;
  const taxId          = user.taxId         || profile?.taxId;
  const w9Document     = user.w9Document;

  // Carrier preferred lines
  const preferredLinesJson = isCarrier ? (carrierProfile as typeof carrierProfile)?.preferredLines : undefined;
  const preferredLines: PreferredLine[] = (() => {
    try { return preferredLinesJson ? JSON.parse(preferredLinesJson) : []; } catch { return []; }
  })();

  const handleSavePreferredLines = async (lines: PreferredLine[]) => {
    try {
      await updateCarrierProfile({ preferredLines: lines.length > 0 ? JSON.stringify(lines) : '' }).unwrap();
      refetchCarrier();
      toast.success('Preferred lanes saved.');
    } catch {
      toast.error('Failed to save preferred lanes. Please try again.');
      throw new Error('save failed');
    }
  };

  // FMCSA-sourced fields (only available from API response, not in auth store)
  const dbaName            = (profile as typeof carrierProfile)?.dbaName;
  const operatingStatus    = profile?.operatingStatus;
  const safetyRating       = (profile as typeof carrierProfile)?.safetyRating;
  const phyCity            = (profile as typeof carrierProfile)?.phyCity;
  const phyState           = (profile as typeof carrierProfile)?.phyState;
  const totalDrivers       = (profile as typeof carrierProfile)?.totalDrivers;
  const totalPowerUnits    = (profile as typeof carrierProfile)?.totalPowerUnits;
  const brokerAuthority    = (profile as typeof brokerProfile)?.brokerAuthorityActive;

  const hasAddress = mailingAddress || city || state || zipCode;
  const hasPhyAddress = phyCity || phyState;

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
                {companyName || 'Company Profile'}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 capitalize hover:bg-white/30">
                  {user.role}
                </Badge>
                {operatingStatus && (
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {operatingStatus}
                  </Badge>
                )}
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

          {/* Verification Status badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </span>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                  {isCarrier ? 'Carrier' : 'Broker'} Verified
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {user.verificationDate
                    ? new Date(user.verificationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'FMCSA verified'}
                </p>
              </div>
            </div>

            {isBroker && brokerAuthority !== undefined && (
              <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${
                brokerAuthority
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20'
              }`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  brokerAuthority ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-amber-100 dark:bg-amber-900/40'
                }`}>
                  {brokerAuthority
                    ? <CheckCircle className="h-5 w-5 text-emerald-600" />
                    : <AlertCircle className="h-5 w-5 text-amber-600" />}
                </span>
                <div>
                  <p className={`font-semibold text-sm ${
                    brokerAuthority
                      ? 'text-emerald-900 dark:text-emerald-100'
                      : 'text-amber-900 dark:text-amber-100'
                  }`}>
                    Broker Authority
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    brokerAuthority
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {brokerAuthority ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            )}

            {isCarrier && phoneNumber && (
              <div className="flex items-center gap-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </span>
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                    Phone Verified
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {phoneNumber}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Company / Identity Information */}
          <SectionCard
            title="Company Information"
            description="Identity details from FMCSA and registration"
            accentColor="amber"
          >
            <div className="divide-y divide-border">
              {companyName && (
                <InfoRow icon={Building2} label="Legal Name">
                  {companyName}
                </InfoRow>
              )}
              {dbaName && (
                <InfoRow icon={Building2} label="DBA Name">
                  {dbaName}
                </InfoRow>
              )}
              {mcNumber && (
                <InfoRow icon={Shield} label="MC Number">
                  {mcNumber}
                </InfoRow>
              )}
              {dotNumber && (
                <InfoRow icon={Shield} label="DOT Number">
                  {dotNumber}
                </InfoRow>
              )}
              {operatingStatus && (
                <InfoRow icon={Shield} label="Operating Status">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    operatingStatus.toUpperCase() === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {operatingStatus}
                  </span>
                </InfoRow>
              )}
              {safetyRating && (
                <InfoRow icon={Shield} label="Safety Rating">
                  {safetyRating}
                </InfoRow>
              )}
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
              {phoneNumber && (
                <InfoRow icon={Phone} label="Phone Number">
                  {phoneNumber}
                </InfoRow>
              )}
              {hasAddress && (
                <InfoRow icon={MapPin} label="Mailing Address">
                  {mailingAddress && <span>{mailingAddress}</span>}
                  {(city || state || zipCode) && (
                    <span className="block text-sm text-muted-foreground font-normal mt-0.5">
                      {[city, state, zipCode].filter(Boolean).join(', ')}
                    </span>
                  )}
                </InfoRow>
              )}
              {hasPhyAddress && (
                <InfoRow icon={MapPin} label="Physical Address (FMCSA)">
                  <span className="text-sm text-muted-foreground font-normal">
                    {[phyCity, phyState].filter(Boolean).join(', ')}
                  </span>
                </InfoRow>
              )}
            </div>
          </SectionCard>

          {/* Fleet Info — carriers only */}
          {isCarrier && (totalDrivers != null || totalPowerUnits != null) && (
            <SectionCard
              title="Fleet Information"
              description="Fleet size from FMCSA records"
              accentColor="slate"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                {totalPowerUnits != null && (
                  <div className="rounded-lg border bg-muted/40 px-5 py-4 flex items-center gap-3">
                    <Truck className="h-6 w-6 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                        Power Units
                      </p>
                      <p className="text-2xl font-bold">{totalPowerUnits.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {totalDrivers != null && (
                  <div className="rounded-lg border bg-muted/40 px-5 py-4 flex items-center gap-3">
                    <Truck className="h-6 w-6 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                        Total Drivers
                      </p>
                      <p className="text-2xl font-bold">{totalDrivers.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Preferred Lanes — carriers only */}
          {isCarrier && (
            <PreferredLinesEditor
              initialLines={preferredLines}
              onSave={handleSavePreferredLines}
            />
          )}

          {/* Insurance Information */}
          {(insuranceCo || cargoIns != null || liabilityIns != null) && (
            <SectionCard
              title="Insurance Information"
              description="Your coverage details"
              accentColor="green"
            >
              <div className="divide-y divide-border">
                {insuranceCo && (
                  <InfoRow icon={Shield} label="Insurance Company">
                    {insuranceCo}
                  </InfoRow>
                )}
              </div>
              {(cargoIns != null || liabilityIns != null) && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cargoIns != null && (
                    <div className="rounded-lg border bg-muted/40 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Cargo Insurance
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${Number(cargoIns).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {liabilityIns != null && (
                    <div className="rounded-lg border bg-muted/40 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Liability Insurance
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${Number(liabilityIns).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {/* Tax Information */}
          {(taxIdType || taxId) && (
            <SectionCard
              title="Tax Information"
              description="W9 and tax identification details"
              accentColor="violet"
            >
              <div className="divide-y divide-border">
                {taxIdType && (
                  <InfoRow icon={FileText} label="Tax ID Type">
                    {taxIdType}
                  </InfoRow>
                )}
                {taxId && (
                  <InfoRow icon={FileText} label="Tax ID">
                    {taxId.replace(/./g, (char: string, index: number) =>
                      index < taxId.length - 4 ? '•' : char
                    )}
                  </InfoRow>
                )}
              </div>

              {w9Document && (
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
          )}

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

