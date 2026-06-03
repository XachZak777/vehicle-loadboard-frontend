import { MapBackground } from '../components/MapBackground';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Building2, Mail, Phone, MapPin, FileText, Shield, CheckCircle,
  ArrowRight, Plus, Trash2, Pencil, Save, X, Lock, type LucideIcon,
} from 'lucide-react';
import {
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
  useGetMyDealerProfileQuery,
  useUpdateCarrierProfileMutation,
  useUpdateBrokerProfileMutation,
  useGetMyBrokerDocumentsQuery,
  useGetMyCarrierDocumentsQuery,
  useDeleteBrokerDocumentMutation,
  useDeleteCarrierDocumentMutation,
  type AdminDocumentDto,
  type BrokerProfile,
  type CarrierProfile,
  type DealerProfile,
  type PreferredLine,
} from '../store/services/hauliusApi';
import { US_STATES } from '../constants';
import { toast } from 'sonner';
import { formatPhone } from '../utils/phone';

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
        <div className="font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

function LockedRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <Lock className="h-3 w-3 text-muted-foreground/50" />
        </div>
        <div className="font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-5 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-4">{children}</CardContent>
    </Card>
  );
}

function EditActions({ onSave, onCancel, isSaving }: { onSave: () => void; onCancel: () => void; isSaving: boolean }) {
  return (
    <div className="flex gap-2 pt-3">
      <Button size="sm" className="gap-1.5" onClick={onSave} disabled={isSaving}>
        <Save className="size-3.5" />{isSaving ? 'Saving…' : 'Save'}
      </Button>
      <Button size="sm" variant="ghost" className="gap-1.5" onClick={onCancel} disabled={isSaving}>
        <X className="size-3.5" />Cancel
      </Button>
    </div>
  );
}

function PreferredLinesEditor({ initialLines, onSave }: { initialLines: PreferredLine[]; onSave: (lines: PreferredLine[]) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState<PreferredLine[]>(initialLines);
  const [isSaving, setIsSaving] = useState(false);

  const addLine = () => setLines(prev => [...prev, { fromState: '', toState: '' }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'fromState' | 'toState', value: string) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const handleSave = async () => {
    setIsSaving(true);
    try { await onSave(lines); setEditing(false); } finally { setIsSaving(false); }
  };

  return (
    <Section
      title="Preferred Lanes"
      action={!editing ? (
        <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setEditing(true)}>
          <Pencil className="size-3" />Edit
        </Button>
      ) : undefined}
    >
      <div className="space-y-3">
        {!editing && (
          lines.length === 0
            ? <p className="text-sm text-muted-foreground py-2">No preferred lanes configured.</p>
            : <div className="flex flex-wrap gap-2">
                {lines.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
                    {l.fromState}<ArrowRight className="size-3 text-muted-foreground" />{l.toState}
                  </span>
                ))}
              </div>
        )}
        {editing && (
          <>
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={line.fromState} onValueChange={v => updateLine(i, 'fromState', v)}>
                  <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="From" /></SelectTrigger>
                  <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                <Select value={line.toState} onValueChange={v => updateLine(i, 'toState', v)}>
                  <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="To" /></SelectTrigger>
                  <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive shrink-0" onClick={() => removeLine(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {lines.length < 10 && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5 w-full" onClick={addLine}>
                <Plus className="size-3.5" />Add Lane
              </Button>
            )}
            <EditActions onSave={handleSave} onCancel={() => { setLines(initialLines); setEditing(false); }} isSaving={isSaving} />
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
  const isDealer = user?.role === 'dealer';

  const { data: brokerProfile, refetch: refetchBroker, isLoading: brokerLoading } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const { data: carrierProfile, refetch: refetchCarrier, isLoading: carrierLoading } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });
  const { data: dealerProfile, refetch: refetchDealer, isLoading: dealerLoading } = useGetMyDealerProfileQuery(undefined, { skip: !isDealer });
  const [updateCarrierProfile] = useUpdateCarrierProfileMutation();
  const [updateBrokerProfile] = useUpdateBrokerProfileMutation();
  const { data: brokerDocs, refetch: refetchBrokerDocs } = useGetMyBrokerDocumentsQuery(undefined, { skip: !isBroker });
  const { data: carrierDocs, refetch: refetchCarrierDocs } = useGetMyCarrierDocumentsQuery(undefined, { skip: !isCarrier });
  const [deleteBrokerDocument] = useDeleteBrokerDocumentMutation();
  const [deleteCarrierDocument] = useDeleteCarrierDocumentMutation();

  useEffect(() => {
    if (isBroker) refetchBroker();
    else if (isCarrier) refetchCarrier();
    else if (isDealer) refetchDealer();
  }, [isBroker, isCarrier, isDealer]);

  // ── edit state ──────────────────────────────────────────────────────────────
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [editingTax, setEditingTax] = useState(false);
  const [editingBond, setEditingBond] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const bp = brokerProfile as BrokerProfile | undefined;
  const cp = carrierProfile as CarrierProfile | undefined;
  const dp = dealerProfile as DealerProfile | undefined;
  const profile = isBroker ? bp : isCarrier ? cp : dp;

  const companyName    = profile?.companyName || bp?.legalName || user.companyName;
  const mcNumber       = bp?.mcNumber  || cp?.mcNumber  || user.mcNumber;
  const dotNumber      = bp?.dotNumber || cp?.dotNumber || user.dotNumber;
  const phoneNumber    = (isDealer ? dp?.businessPhone : profile?.phoneNumber) || user.phoneNumber;
  const mailingAddress = (isDealer ? dp?.companyAddress : profile?.mailingAddress) || user.mailingAddress;
  const city           = profile?.city   || user.city;
  const state          = profile?.state  || user.state;
  const zipCode        = profile?.zipCode || user.zipCode;
  const taxIdType      = (bp?.taxIdType ?? cp?.taxIdType) ?? user.taxIdType;
  const taxId          = (bp?.taxId     ?? cp?.taxId)     ?? user.taxId;

  const dbaName       = cp?.dbaName;
  const insuranceCo   = (isBroker ? bp?.insuranceCompany : cp?.insuranceCompany) ?? user.insuranceCompany;
  const cargoIns      = (isBroker ? bp?.cargoInsurance : cp?.cargoInsurance)    ?? user.cargoInsurance;
  const liabilityIns  = (isBroker ? bp?.liabilityInsurance : cp?.liabilityInsurance) ?? user.liabilityInsurance;
  const preferredLines: PreferredLine[] = (() => {
    try { return cp?.preferredLines ? JSON.parse(cp.preferredLines) : []; } catch { return []; }
  })();

  const bondCompany        = bp?.bondCompany        ?? '';
  const bondPolicyNumber   = bp?.bondPolicyNumber   ?? '';
  const bondCoverage       = bp?.bondCoverage       ?? '';
  const bondEffectiveDate  = bp?.bondEffectiveDate  ?? '';
  const bondAgentFirstName = bp?.bondAgentFirstName ?? '';
  const bondAgentLastName  = bp?.bondAgentLastName  ?? '';
  const bondAgentEmail     = bp?.bondAgentEmail     ?? '';
  const bondAgentPhone     = bp?.bondAgentPhone     ?? '';
  const bondAgentName      = [bp?.bondAgentFirstName, bp?.bondAgentLastName].filter(Boolean).join(' ');
  const hasBondInfo        = bondCompany || bondPolicyNumber || bondCoverage || bondEffectiveDate || bondAgentName;

  const hasAddress = mailingAddress || city || state || zipCode;
  const isLoading  = isBroker ? brokerLoading : isCarrier ? carrierLoading : dealerLoading;

  // ── save helpers ────────────────────────────────────────────────────────────
  const saveCarrier = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateCarrierProfile(patch as any).unwrap();
      refetchCarrier();
      toast.success('Saved.');
    } catch {
      toast.error('Failed to save. Please try again.');
      throw new Error('save failed');
    } finally { setSaving(false); }
  };

  const saveBroker = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateBrokerProfile(patch as any).unwrap();
      refetchBroker();
      toast.success('Saved.');
    } catch {
      toast.error('Failed to save. Please try again.');
      throw new Error('save failed');
    } finally { setSaving(false); }
  };

  const save = isCarrier ? saveCarrier : saveBroker;

  // ── phone ────────────────────────────────────────────────────────────────────
  const [phoneInput, setPhoneInput] = useState(phoneNumber ?? '');
  const handleSavePhone = async () => {
    await save({ phoneNumber: phoneInput });
    setEditingPhone(false);
  };

  // ── insurance ─────────────────────────────────────────────────────────────
  const [insCoInput, setInsCoInput] = useState(insuranceCo ?? '');
  const [cargoInput, setCargoInput] = useState(cargoIns != null ? String(cargoIns) : '');
  const [liabilityInput, setLiabilityInput] = useState(liabilityIns != null ? String(liabilityIns) : '');
  const handleSaveInsurance = async () => {
    const patch: Record<string, unknown> = {};
    if (insCoInput) patch.insuranceCompany = insCoInput;
    if (cargoInput) patch.cargoInsurance = Number(cargoInput);
    if (liabilityInput) patch.liabilityInsurance = Number(liabilityInput);
    await save(patch);
    setEditingInsurance(false);
  };

  // ── tax ───────────────────────────────────────────────────────────────────
  const [taxTypeInput, setTaxTypeInput] = useState<'EIN' | 'SSN' | ''>(taxIdType as 'EIN' | 'SSN' | '' ?? '');
  const [taxIdInput, setTaxIdInput] = useState(taxId ?? '');
  const handleSaveTax = async () => {
    const patch: Record<string, unknown> = {};
    if (taxTypeInput) patch.taxIdType = taxTypeInput;
    if (taxIdInput) patch.taxId = taxIdInput;
    await save(patch);
    setEditingTax(false);
  };

  // ── bond ──────────────────────────────────────────────────────────────────
  const [bondForm, setBondForm] = useState({
    bondCompany, bondPolicyNumber, bondCoverage, bondEffectiveDate,
    bondAgentFirstName, bondAgentLastName, bondAgentEmail, bondAgentPhone,
  });
  const handleSaveBond = async () => {
    const patch: Record<string, unknown> = {};
    Object.entries(bondForm).forEach(([k, v]) => { if (v) patch[k] = v; });
    await saveBroker(patch);
    setEditingBond(false);
  };

  const handleSavePreferredLines = async (lines: PreferredLine[]) => {
    await saveCarrier({ preferredLines: lines.length > 0 ? JSON.stringify(lines) : '' });
  };

  const documents: AdminDocumentDto[] = (isBroker ? brokerDocs : isCarrier ? carrierDocs : undefined) ?? [];
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      if (isBroker) { await deleteBrokerDocument(docId).unwrap(); refetchBrokerDocs(); }
      else if (isCarrier) { await deleteCarrierDocument(docId).unwrap(); refetchCarrierDocs(); }
      toast.success('Document deleted.');
    } catch {
      toast.error('Failed to delete document.');
    }
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-5">

          {isLoading && <div className="flex justify-center py-8 text-muted-foreground text-sm">Loading profile…</div>}

          {/* Header */}
          <div className="flex items-center gap-4 pb-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground leading-tight">{companyName || 'Company Profile'}</h1>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">
                {user.role} · Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Company Information — locked */}
          <Section title="Company Information">
            <div className="divide-y divide-border">
              {dbaName && <LockedRow icon={Building2} label="DBA Name">{dbaName}</LockedRow>}
              {isDealer ? (
                <>
                  {dp?.ownerFirstName && dp?.ownerLastName && <InfoRow icon={FileText} label="Owner">{dp.ownerFirstName} {dp.ownerLastName}</InfoRow>}
                  {dp?.yearEstablished && <InfoRow icon={FileText} label="Year Established">{dp.yearEstablished}</InfoRow>}
                  {dp?.dealerLicenseNumber && <InfoRow icon={Shield} label="Dealer License"><span className="font-mono">{dp.dealerLicenseNumber}</span></InfoRow>}
                  {dp?.auctionAccessNumber && <InfoRow icon={Shield} label="Auction Access #"><span className="font-mono">{dp.auctionAccessNumber}</span></InfoRow>}
                </>
              ) : (
                <>
                  {dotNumber
                    ? <LockedRow icon={Shield} label="DOT Number"><span className="font-mono">{dotNumber}</span></LockedRow>
                    : <div className="py-3 text-sm text-muted-foreground">No DOT number on file.</div>}
                  {mcNumber && <LockedRow icon={Shield} label="MC Number"><span className="font-mono">{mcNumber}</span></LockedRow>}
                </>
              )}
            </div>
          </Section>

          {/* Contact Information — phone editable, address locked */}
          <Section
            title="Contact Information"
            action={!isDealer && !editingPhone ? (
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => { setPhoneInput(phoneNumber ?? ''); setEditingPhone(true); }}>
                <Pencil className="size-3" />Edit Phone
              </Button>
            ) : undefined}
          >
            <div className="divide-y divide-border">
              <InfoRow icon={Mail} label="Email">{user.email}</InfoRow>

              {editingPhone ? (
                <div className="py-3 space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</Label>
                  <Input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="(555) 000-0000" className="h-8 text-sm" />
                  <EditActions onSave={handleSavePhone} onCancel={() => setEditingPhone(false)} isSaving={saving} />
                </div>
              ) : (
                phoneNumber
                  ? <InfoRow icon={Phone} label="Phone">{formatPhone(phoneNumber)}</InfoRow>
                  : !isDealer && <div className="py-3 text-sm text-muted-foreground">No phone on file.</div>
              )}

              {hasAddress ? (
                <LockedRow icon={MapPin} label="Mailing Address">
                  {mailingAddress && <span>{mailingAddress}</span>}
                  {(city || state || zipCode) && (
                    <span className="block text-sm text-muted-foreground font-normal mt-0.5">
                      {[city, state, zipCode].filter(Boolean).join(', ')}
                    </span>
                  )}
                </LockedRow>
              ) : (
                <div className="py-3 text-sm text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-muted-foreground/50" />No address on file.
                </div>
              )}
            </div>
          </Section>

          {/* Insurance — editable for carrier only */}
          {isCarrier && (
            <Section
              title="Insurance"
              action={!editingInsurance ? (
                <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => {
                  setInsCoInput(insuranceCo ?? '');
                  setCargoInput(cargoIns != null ? String(cargoIns) : '');
                  setLiabilityInput(liabilityIns != null ? String(liabilityIns) : '');
                  setEditingInsurance(true);
                }}>
                  <Pencil className="size-3" />Edit
                </Button>
              ) : undefined}
            >
              {editingInsurance ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Insurance Company</Label>
                    <Input value={insCoInput} onChange={e => setInsCoInput(e.target.value)} placeholder="e.g. Progressive Commercial" className="h-8 text-sm mt-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cargo Coverage ($)</Label>
                      <Input type="number" value={cargoInput} onChange={e => setCargoInput(e.target.value)} placeholder="100000" className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Liability Coverage ($)</Label>
                      <Input type="number" value={liabilityInput} onChange={e => setLiabilityInput(e.target.value)} placeholder="1000000" className="h-8 text-sm mt-1" />
                    </div>
                  </div>
                  <EditActions onSave={handleSaveInsurance} onCancel={() => setEditingInsurance(false)} isSaving={saving} />
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {insuranceCo
                      ? <InfoRow icon={Shield} label="Insurance Company">{insuranceCo}</InfoRow>
                      : <p className="text-sm text-muted-foreground py-2">No insurance information on file.</p>}
                  </div>
                  {(cargoIns != null || liabilityIns != null) && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cargoIns != null && (
                        <div className="rounded-lg border bg-muted/40 px-5 py-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Cargo Coverage</p>
                          <p className="text-xl font-bold">${Number(cargoIns).toLocaleString()}</p>
                        </div>
                      )}
                      {liabilityIns != null && (
                        <div className="rounded-lg border bg-muted/40 px-5 py-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Liability Coverage</p>
                          <p className="text-xl font-bold">${Number(liabilityIns).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Section>
          )}

          {/* Carrier: Preferred Lanes */}
          {isCarrier && <PreferredLinesEditor initialLines={preferredLines} onSave={handleSavePreferredLines} />}

          {/* Broker: Surety Bond — editable */}
          {isBroker && (
            <Section
              title="Surety Bond"
              action={!editingBond ? (
                <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => {
                  setBondForm({ bondCompany, bondPolicyNumber, bondCoverage, bondEffectiveDate, bondAgentFirstName, bondAgentLastName, bondAgentEmail, bondAgentPhone });
                  setEditingBond(true);
                }}>
                  <Pencil className="size-3" />Edit
                </Button>
              ) : undefined}
            >
              {editingBond ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bond Company</Label>
                      <Input value={bondForm.bondCompany} onChange={e => setBondForm(f => ({ ...f, bondCompany: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Policy Number</Label>
                      <Input value={bondForm.bondPolicyNumber} onChange={e => setBondForm(f => ({ ...f, bondPolicyNumber: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coverage Amount ($)</Label>
                      <Input type="number" value={bondForm.bondCoverage} onChange={e => setBondForm(f => ({ ...f, bondCoverage: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Effective Date</Label>
                      <Input type="date" value={bondForm.bondEffectiveDate} onChange={e => setBondForm(f => ({ ...f, bondEffectiveDate: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent First Name</Label>
                      <Input value={bondForm.bondAgentFirstName} onChange={e => setBondForm(f => ({ ...f, bondAgentFirstName: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent Last Name</Label>
                      <Input value={bondForm.bondAgentLastName} onChange={e => setBondForm(f => ({ ...f, bondAgentLastName: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent Email</Label>
                      <Input type="email" value={bondForm.bondAgentEmail} onChange={e => setBondForm(f => ({ ...f, bondAgentEmail: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent Phone</Label>
                      <Input value={bondForm.bondAgentPhone} onChange={e => setBondForm(f => ({ ...f, bondAgentPhone: e.target.value }))} className="h-8 text-sm mt-1" />
                    </div>
                  </div>
                  <EditActions onSave={handleSaveBond} onCancel={() => setEditingBond(false)} isSaving={saving} />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {hasBondInfo ? (
                    <>
                      {bp?.bondCompany && <InfoRow icon={Shield} label="Bond Company">{bp.bondCompany}</InfoRow>}
                      {bp?.bondPolicyNumber && <InfoRow icon={FileText} label="Policy Number"><span className="font-mono">{bp.bondPolicyNumber}</span></InfoRow>}
                      {bp?.bondCoverage && <InfoRow icon={Shield} label="Coverage Amount">${Number(bp.bondCoverage).toLocaleString()}</InfoRow>}
                      {bp?.bondEffectiveDate && (
                        <InfoRow icon={FileText} label="Effective Date">
                          {new Date(bp.bondEffectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </InfoRow>
                      )}
                      {bondAgentName && <InfoRow icon={FileText} label="Bond Agent">{bondAgentName}</InfoRow>}
                      {bp?.bondAgentEmail && <InfoRow icon={Mail} label="Agent Email">{bp.bondAgentEmail}</InfoRow>}
                      {bp?.bondAgentPhone && <InfoRow icon={Phone} label="Agent Phone">{formatPhone(bp.bondAgentPhone)}</InfoRow>}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No bond information on file.</p>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Documents — list and delete for brokers and carriers */}
          {(isBroker || isCarrier) && (
            <Section title="Documents">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No documents uploaded yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {documents.map(doc => (
                    <div key={doc.documentId} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.documentType.replace(/_/g, ' ')} · {new Date(doc.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}${doc.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-600 hover:text-amber-700 hover:underline font-medium"
                        >
                          View
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteDocument(doc.documentId)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Tax Information — editable for carriers and brokers */}
          {!isDealer && (
            <Section
              title="Tax Information"
              action={!editingTax ? (
                <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => {
                  setTaxTypeInput(taxIdType as 'EIN' | 'SSN' | '' ?? '');
                  setTaxIdInput(taxId ?? '');
                  setEditingTax(true);
                }}>
                  <Pencil className="size-3" />Edit
                </Button>
              ) : undefined}
            >
              {editingTax ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tax ID Type</Label>
                    <Select value={taxTypeInput} onValueChange={v => setTaxTypeInput(v as 'EIN' | 'SSN')}>
                      <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EIN">EIN</SelectItem>
                        <SelectItem value="SSN">SSN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tax ID</Label>
                    <Input value={taxIdInput} onChange={e => setTaxIdInput(e.target.value)} placeholder="XX-XXXXXXX" className="h-8 text-sm mt-1" />
                  </div>
                  <EditActions onSave={handleSaveTax} onCancel={() => setEditingTax(false)} isSaving={saving} />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {taxIdType && <InfoRow icon={FileText} label="Tax ID Type">{taxIdType}</InfoRow>}
                  {taxId && (
                    <InfoRow icon={FileText} label="Tax ID">
                      <span className="font-mono">
                        {taxId.replace(/./g, (char: string, index: number) => index < taxId.length - 4 ? '•' : char)}
                      </span>
                    </InfoRow>
                  )}
                  {!taxIdType && !taxId && <p className="text-sm text-muted-foreground py-2">No tax information on file.</p>}
                  {user.w9Document && <InfoRow icon={CheckCircle} label="W9 Document">On file</InfoRow>}
                </div>
              )}
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}
