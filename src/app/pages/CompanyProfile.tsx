import { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
import { formatPhone } from '../utils/phone';

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-4">{children}</CardContent>
    </Card>
  );
}

function PreferredLinesEditor({
  initialLines,
  onSave,
}: {
  initialLines: PreferredLine[];
  onSave: (lines: PreferredLine[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState<PreferredLine[]>(initialLines);
  const [isSaving, setIsSaving] = useState(false);

  const addLine = () => setLines(prev => [...prev, { fromState: '', toState: '' }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'fromState' | 'toState', value: string) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

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
    <Section title="Preferred Lanes">
      <div className="space-y-3">
        {!editing && (
          <>
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No preferred lanes configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {lines.map((l, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium"
                  >
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeLine(i)}
                >
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
              <Button
                size="sm"
                className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
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
    </Section>
  );
}

export function CompanyProfile() {
  const user = useAppSelector((s) => s.auth.user);
  const isBroker = user?.role === 'broker';
  const isCarrier = user?.role === 'carrier';

  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const { data: carrierProfile, refetch: refetchCarrier } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });
  const [updateCarrierProfile] = useUpdateCarrierProfileMutation();

  if (!user) return null;

  const profile = isBroker ? brokerProfile : carrierProfile;

  const companyName    = profile?.legalName  || profile?.companyName   || user.companyName;
  const mcNumber       = user.mcNumber      || profile?.mcNumber;
  const dotNumber      = user.dotNumber     || profile?.dotNumber;
  const phoneNumber    = user.phoneNumber   || profile?.phoneNumber;
  const mailingAddress = user.mailingAddress|| profile?.mailingAddress;
  const city           = user.city          || profile?.city;
  const state          = user.state         || profile?.state;
  const zipCode        = user.zipCode       || profile?.zipCode;
  const insuranceCo    = user.insuranceCompany || (profile as typeof carrierProfile)?.insuranceCompany;
  const cargoIns       = user.cargoInsurance   ?? (profile as typeof carrierProfile)?.cargoInsurance;
  const liabilityIns   = user.liabilityInsurance ?? (profile as typeof carrierProfile)?.liabilityInsurance;
  const taxIdType      = user.taxIdType     || profile?.taxIdType;
  const taxId          = user.taxId         || profile?.taxId;
  const w9Document     = user.w9Document;

  const dbaName         = (profile as typeof carrierProfile)?.dbaName;
  const operatingStatus = profile?.operatingStatus;
  const safetyRating    = (profile as typeof carrierProfile)?.safetyRating;
  const phyCity         = (profile as typeof carrierProfile)?.phyCity;
  const phyState        = (profile as typeof carrierProfile)?.phyState;
  const totalDrivers    = (profile as typeof carrierProfile)?.totalDrivers;
  const totalPowerUnits = (profile as typeof carrierProfile)?.totalPowerUnits;
  const brokerAuthority = (profile as typeof brokerProfile)?.brokerAuthorityActive;

  // Broker bond fields
  const bondCompany         = (profile as typeof brokerProfile)?.bondCompany;
  const bondPolicyNumber    = (profile as typeof brokerProfile)?.bondPolicyNumber;
  const bondCoverage        = (profile as typeof brokerProfile)?.bondCoverage;
  const bondEffectiveDate   = (profile as typeof brokerProfile)?.bondEffectiveDate;
  const bondAgentFirstName  = (profile as typeof brokerProfile)?.bondAgentFirstName;
  const bondAgentLastName   = (profile as typeof brokerProfile)?.bondAgentLastName;
  const bondAgentEmail      = (profile as typeof brokerProfile)?.bondAgentEmail;
  const bondAgentPhone      = (profile as typeof brokerProfile)?.bondAgentPhone;
  const bondAgentName       = [bondAgentFirstName, bondAgentLastName].filter(Boolean).join(' ');
  const hasBondInfo         = bondCompany || bondPolicyNumber || bondCoverage || bondEffectiveDate || bondAgentName;

  const preferredLinesJson = isCarrier ? carrierProfile?.preferredLines : undefined;
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

  const hasAddress    = mailingAddress || city || state || zipCode;
  const hasPhyAddress = phyCity || phyState;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Page header */}
          <div className="flex items-center gap-4 pb-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {companyName || 'Company Profile'}
              </h1>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">
                {user.role} · Member since{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>

          {/* Identity */}
          <Section title="Company Information">
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
                  <span className="font-mono">{mcNumber}</span>
                </InfoRow>
              )}
              {dotNumber && (
                <InfoRow icon={Shield} label="DOT Number">
                  <span className="font-mono">{dotNumber}</span>
                </InfoRow>
              )}
              {operatingStatus && (
                <InfoRow icon={Shield} label="Operating Status">
                  <span className="flex items-center gap-1.5">
                    {operatingStatus.toUpperCase().includes('ACTIVE') || operatingStatus.toUpperCase().includes('AUTHORIZED')
                      ? <CheckCircle className="size-3.5 text-muted-foreground" />
                      : <AlertCircle className="size-3.5 text-muted-foreground" />}
                    {operatingStatus}
                  </span>
                </InfoRow>
              )}
              {safetyRating && (
                <InfoRow icon={Shield} label="Safety Rating">
                  {safetyRating}
                </InfoRow>
              )}
              {isBroker && brokerAuthority !== undefined && (
                <InfoRow icon={Shield} label="Broker Authority">
                  <span className="flex items-center gap-1.5">
                    {brokerAuthority
                      ? <CheckCircle className="size-3.5 text-muted-foreground" />
                      : <AlertCircle className="size-3.5 text-muted-foreground" />}
                    {brokerAuthority ? 'Active' : 'Inactive'}
                  </span>
                </InfoRow>
              )}
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Information">
            <div className="divide-y divide-border">
              <InfoRow icon={Mail} label="Email">
                {user.email}
              </InfoRow>
              {phoneNumber && (
                <InfoRow icon={Phone} label="Phone">
                  {formatPhone(phoneNumber)}
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
                  {[phyCity, phyState].filter(Boolean).join(', ')}
                </InfoRow>
              )}
            </div>
          </Section>

          {/* Fleet — carriers only */}
          {isCarrier && (totalDrivers != null || totalPowerUnits != null) && (
            <Section title="Fleet Information">
              <div className="grid grid-cols-2 gap-4 mt-1">
                {totalPowerUnits != null && (
                  <div className="rounded-lg border bg-muted/40 px-5 py-4 flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
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
                    <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                        Total Drivers
                      </p>
                      <p className="text-2xl font-bold">{totalDrivers.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Preferred Lanes — carriers only */}
          {isCarrier && (
            <PreferredLinesEditor
              initialLines={preferredLines}
              onSave={handleSavePreferredLines}
            />
          )}

          {/* Insurance */}
          {(insuranceCo || cargoIns != null || liabilityIns != null) && (
            <Section title="Insurance">
              <div className="divide-y divide-border">
                {insuranceCo && (
                  <InfoRow icon={Shield} label="Insurance Company">
                    {insuranceCo}
                  </InfoRow>
                )}
              </div>
              {(cargoIns != null || liabilityIns != null) && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {cargoIns != null && (
                    <div className="rounded-lg border bg-muted/40 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Cargo Coverage
                      </p>
                      <p className="text-xl font-bold">${Number(cargoIns).toLocaleString()}</p>
                    </div>
                  )}
                  {liabilityIns != null && (
                    <div className="rounded-lg border bg-muted/40 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Liability Coverage
                      </p>
                      <p className="text-xl font-bold">${Number(liabilityIns).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Bond — brokers only */}
          {isBroker && hasBondInfo && (
            <Section title="Surety Bond">
              <div className="divide-y divide-border">
                {bondCompany && (
                  <InfoRow icon={Shield} label="Bond Company">
                    {bondCompany}
                  </InfoRow>
                )}
                {bondPolicyNumber && (
                  <InfoRow icon={FileText} label="Policy Number">
                    <span className="font-mono">{bondPolicyNumber}</span>
                  </InfoRow>
                )}
                {bondCoverage && (
                  <InfoRow icon={Shield} label="Coverage Amount">
                    {bondCoverage}
                  </InfoRow>
                )}
                {bondEffectiveDate && (
                  <InfoRow icon={FileText} label="Effective Date">
                    {new Date(bondEffectiveDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </InfoRow>
                )}
                {bondAgentName && (
                  <InfoRow icon={FileText} label="Bond Agent">
                    {bondAgentName}
                  </InfoRow>
                )}
                {bondAgentEmail && (
                  <InfoRow icon={Mail} label="Agent Email">
                    {bondAgentEmail}
                  </InfoRow>
                )}
                {bondAgentPhone && (
                  <InfoRow icon={Phone} label="Agent Phone">
                    {formatPhone(bondAgentPhone)}
                  </InfoRow>
                )}
              </div>
            </Section>
          )}

          {/* Tax */}
          {(taxIdType || taxId) && (
            <Section title="Tax Information">
              <div className="divide-y divide-border">
                {taxIdType && (
                  <InfoRow icon={FileText} label="Tax ID Type">
                    {taxIdType}
                  </InfoRow>
                )}
                {taxId && (
                  <InfoRow icon={FileText} label="Tax ID">
                    <span className="font-mono">
                      {taxId.replace(/./g, (char: string, index: number) =>
                        index < taxId.length - 4 ? '•' : char
                      )}
                    </span>
                  </InfoRow>
                )}
                {w9Document && (
                  <InfoRow icon={CheckCircle} label="W9 Document">
                    On file
                  </InfoRow>
                )}
              </div>
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}
