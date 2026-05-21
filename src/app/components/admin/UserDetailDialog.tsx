import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { PhoneInput } from '../ui/PhoneInput';
import {
  CheckCircle, XCircle, Trash2, Eye, FileText, Loader2,
  Building2, ShieldCheck, Mail, MapPin, Phone, ArrowRight, Pencil, X, Upload, Plus,
} from 'lucide-react';
import type {
  AdminUserDto, AdminDocumentDto,
  AdminCarrierProfilePayload, AdminBrokerProfilePayload,
  PreferredLine,
} from '../../store/services/hauliusApi';
import {
  useAdminUpdateCarrierProfileMutation, useAdminUpdateBrokerProfileMutation,
  useAdminUploadCarrierDocumentMutation, useAdminUploadBrokerDocumentMutation,
  useAdminUploadDealerDocumentMutation,
} from '../../store/services/hauliusApi';
import { colors } from '../../styles/colors';
import { formatPhone } from '../../utils/phone';
import { sanitizeDigits } from '../../utils/validation';
import { US_STATES } from '../../constants';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '';
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function ApprovalBadge({ approved, declined }: { approved: boolean; declined: boolean }) {
  if (approved) return <Badge className={colors.accentChip}>Approved</Badge>;
  if (declined) return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
  return <Badge className={colors.accentChip}>Pending</Badge>;
}

type EditForm = {
  companyName: string;
  dbaName: string;
  dotNumber: string;
  mcNumber: string;
  phoneNumber: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  insuranceCompany: string;
  cargoInsurance: string;
  liabilityInsurance: string;
  taxIdType: string;
  taxId: string;
  bondCompany: string;
  bondPolicyNumber: string;
  bondCoverage: string;
  bondEffectiveDate: string;
  bondAgentFirstName: string;
  bondAgentLastName: string;
  bondAgentEmail: string;
  bondAgentPhone: string;
};

function formFromUser(user: AdminUserDto): EditForm {
  return {
    companyName: user.companyName ?? '',
    dbaName: user.dbaName ?? '',
    dotNumber: user.dotNumber ?? '',
    mcNumber: user.mcNumber ?? '',
    phoneNumber: user.phoneNumber ?? '',
    mailingAddress: user.mailingAddress ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    zipCode: user.zipCode ?? '',
    insuranceCompany: user.insuranceCompany ?? '',
    cargoInsurance: user.cargoInsurance != null ? String(user.cargoInsurance) : '',
    liabilityInsurance: user.liabilityInsurance != null ? String(user.liabilityInsurance) : '',
    taxIdType: user.taxIdType ?? 'EIN',
    taxId: user.taxId ?? '',
    bondCompany: user.bondCompany ?? '',
    bondPolicyNumber: user.bondPolicyNumber ?? '',
    bondCoverage: user.bondCoverage ?? '',
    bondEffectiveDate: user.bondEffectiveDate ?? '',
    bondAgentFirstName: user.bondAgentFirstName ?? '',
    bondAgentLastName: user.bondAgentLastName ?? '',
    bondAgentEmail: user.bondAgentEmail ?? '',
    bondAgentPhone: user.bondAgentPhone ?? '',
  };
}

type CarrierDocType = 'w9' | 'insurance' | 'mc-authority';
type BrokerDocType = 'w9' | 'mc-authority';
type DealerDocType = 'dealer-license' | 'corporate-paperwork';
type DocType = CarrierDocType | DealerDocType;

interface Props {
  user: AdminUserDto;
  onClose: () => void;
  onApprove: (u: AdminUserDto) => void;
  onDecline: (u: AdminUserDto) => void;
  onRevoke: (u: AdminUserDto) => void;
  onDelete: (u: AdminUserDto) => void;
  isActing: boolean;
}

export function UserDetailDialog({ user, onClose, onApprove, onDecline, onRevoke, onDelete, isActing }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(() => formFromUser(user));
  const [preferredLinesEdit, setPreferredLinesEdit] = useState<PreferredLine[]>(() => {
    try { return user.preferredLines ? JSON.parse(user.preferredLines) : []; }
    catch { return []; }
  });
  const [uploadType, setUploadType] = useState<DocType>('w9');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adminUpdateCarrier] = useAdminUpdateCarrierProfileMutation();
  const [adminUpdateBroker] = useAdminUpdateBrokerProfileMutation();
  const [adminUploadCarrierDoc] = useAdminUploadCarrierDocumentMutation();
  const [adminUploadBrokerDoc] = useAdminUploadBrokerDocumentMutation();
  const [adminUploadDealerDoc] = useAdminUploadDealerDocumentMutation();

  const isBroker = user.role === 'BROKER';
  const isCarrier = user.role === 'CARRIER';
  const isDealer = user.role === 'DEALER';

  const set = (field: keyof EditForm, value: string) =>
    setEditForm(prev => ({ ...prev, [field]: value }));

  // ── Preferred lanes helpers ─────────────────────────────────────────────
  const addLane = () => setPreferredLinesEdit(prev => [...prev, { fromState: '', toState: '' }]);
  const removeLane = (i: number) => setPreferredLinesEdit(prev => prev.filter((_, idx) => idx !== i));
  const setLane = (i: number, field: 'fromState' | 'toState', value: string) =>
    setPreferredLinesEdit(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user.profileId) { toast.error('No profile ID — cannot save.'); return; }
    setIsSaving(true);
    try {
      if (isDealer) {
        toast.success('Dealer profile is updated via document upload.');
        setIsEditing(false);
        setIsSaving(false);
        return;
      }
      if (isCarrier) {
        const body: AdminCarrierProfilePayload = {
          companyName: editForm.companyName || undefined,
          dbaName: editForm.dbaName || undefined,
          dotNumber: editForm.dotNumber || undefined,
          mcNumber: editForm.mcNumber || undefined,
          phoneNumber: editForm.phoneNumber || undefined,
          mailingAddress: editForm.mailingAddress || undefined,
          city: editForm.city || undefined,
          state: editForm.state || undefined,
          zipCode: editForm.zipCode || undefined,
          insuranceCompany: editForm.insuranceCompany || undefined,
          cargoInsurance: editForm.cargoInsurance ? parseFloat(editForm.cargoInsurance) : undefined,
          liabilityInsurance: editForm.liabilityInsurance ? parseFloat(editForm.liabilityInsurance) : undefined,
          taxIdType: editForm.taxIdType || undefined,
          taxId: editForm.taxId || undefined,
          preferredLines: preferredLinesEdit.length ? JSON.stringify(preferredLinesEdit) : undefined,
        };
        await adminUpdateCarrier({ id: user.profileId, body }).unwrap();
      } else if (isBroker) {
        const body: AdminBrokerProfilePayload = {
          companyName: editForm.companyName || undefined,
          dotNumber: editForm.dotNumber || undefined,
          mcNumber: editForm.mcNumber || undefined,
          phoneNumber: editForm.phoneNumber || undefined,
          mailingAddress: editForm.mailingAddress || undefined,
          city: editForm.city || undefined,
          state: editForm.state || undefined,
          zipCode: editForm.zipCode || undefined,
          taxIdType: editForm.taxIdType || undefined,
          taxId: editForm.taxId || undefined,
          bondCompany: editForm.bondCompany || undefined,
          bondPolicyNumber: editForm.bondPolicyNumber || undefined,
          bondCoverage: editForm.bondCoverage || undefined,
          bondEffectiveDate: editForm.bondEffectiveDate || undefined,
          bondAgentFirstName: editForm.bondAgentFirstName || undefined,
          bondAgentLastName: editForm.bondAgentLastName || undefined,
          bondAgentEmail: editForm.bondAgentEmail || undefined,
          bondAgentPhone: editForm.bondAgentPhone || undefined,
        };
        await adminUpdateBroker({ id: user.profileId, body }).unwrap();
      }
      toast.success('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      toast.error('Failed to save', { description: err?.data?.message || 'Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Document upload ─────────────────────────────────────────────────────
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.profileId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    const fd = new FormData();
    fd.append('file', file);
    try {
      if (isCarrier) {
        await adminUploadCarrierDoc({ carrierId: user.profileId, type: uploadType as CarrierDocType, file: fd }).unwrap();
      } else if (isBroker) {
        await adminUploadBrokerDoc({ brokerId: user.profileId, type: uploadType as BrokerDocType, file: fd }).unwrap();
      } else {
        await adminUploadDealerDoc({ dealerId: user.profileId, type: uploadType as DealerDocType, file: fd }).unwrap();
      }
      toast.success('Document uploaded successfully.');
    } catch (err: any) {
      toast.error('Upload failed', { description: err?.data?.message || 'Please try again.' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Read-only helpers ───────────────────────────────────────────────────
  const infoRow = (label: string, value?: string | null) =>
    value ? (
      <div key={label} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <span className="font-medium text-right max-w-[60%] break-all">{value}</span>
      </div>
    ) : null;

  const preferredLines: PreferredLine[] = (() => {
    try { return user.preferredLines ? JSON.parse(user.preferredLines) : []; }
    catch { return []; }
  })();

  const bondAgentName = [user.bondAgentFirstName, user.bondAgentLastName].filter(Boolean).join(' ');
  const hasBondInfo = user.bondCompany || user.bondPolicyNumber || user.bondCoverage || user.bondEffectiveDate || bondAgentName;

  const docTypeOptions: { value: DocType; label: string }[] = isCarrier
    ? [{ value: 'w9', label: 'W9' }, { value: 'insurance', label: 'Insurance Certificate' }, { value: 'mc-authority', label: 'MC Authority' }]
    : isDealer
      ? [{ value: 'dealer-license', label: "Dealer's License" }, { value: 'corporate-paperwork', label: 'Corporate Paperwork' }]
      : [{ value: 'w9', label: 'W9' }, { value: 'mc-authority', label: 'MC Authority' }];

  // ── Shared field row used in edit mode ──────────────────────────────────
  const field = (label: string, children: React.ReactNode) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );

  const stateSelect = (value: string, onChange: (v: string) => void) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="State" /></SelectTrigger>
      <SelectContent>
        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground border-border">
              {isBroker ? 'Broker' : isDealer ? 'Dealer' : 'Carrier'}
            </Badge>
            {user.email}
          </DialogTitle>
          <DialogDescription>
            Registration submitted {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <ApprovalBadge approved={user.adminApproved} declined={user.declined} />
            {user.emailVerified
              ? <Badge className="bg-muted text-muted-foreground flex items-center gap-1"><Mail className="size-3" />Email Verified</Badge>
              : <Badge variant="outline" className="text-muted-foreground flex items-center gap-1"><Mail className="size-3" />Email Unverified</Badge>
            }
            {user.adminApproved && user.adminApprovedAt && (
              <span className="text-xs text-muted-foreground ml-auto">
                Approved {new Date(user.adminApprovedAt).toLocaleDateString()}
              </span>
            )}
            {user.declined && user.declinedAt && (
              <span className={`text-xs ${colors.errorText} ml-auto`}>
                Rejected {new Date(user.declinedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* ── Company Information ─────────────────────────────────────────── */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className={`size-4 ${colors.accentText}`} />Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {field('Legal Company Name', <Input className="h-8 text-sm" value={editForm.companyName} onChange={e => set('companyName', e.target.value)} />)}
                  {isCarrier && field('DBA Name', <Input className="h-8 text-sm" value={editForm.dbaName} onChange={e => set('dbaName', e.target.value)} placeholder="Optional" />)}
                  {field('DOT Number', <Input className="h-8 text-sm" value={editForm.dotNumber} onChange={e => set('dotNumber', sanitizeDigits(e.target.value))} inputMode="numeric" maxLength={8} />)}
                  {field(isCarrier ? 'MC Number (Optional)' : 'MC Number', <Input className="h-8 text-sm" value={editForm.mcNumber} onChange={e => set('mcNumber', sanitizeDigits(e.target.value))} inputMode="numeric" maxLength={10} />)}
                  {field('Phone Number', <PhoneInput value={editForm.phoneNumber} onChange={v => set('phoneNumber', v)} />)}
                </div>
              ) : (
                <div className="space-y-0">
                  {infoRow('Company Name', user.companyName)}
                  {isCarrier && infoRow('DBA Name', user.dbaName)}
                  {infoRow('DOT Number', user.dotNumber)}
                  {infoRow('MC Number', user.mcNumber)}
                  {infoRow('Phone', user.phoneNumber ? formatPhone(user.phoneNumber) : null)}
                  {!user.companyName && !user.dotNumber && (
                    <p className="text-sm text-muted-foreground py-1">No company information on file.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Address ─────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className={`size-4 ${colors.accentText}`} />Address
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {isEditing ? (
                <div className="space-y-3">
                  {field('Street Address', <Input className="h-8 text-sm" value={editForm.mailingAddress} onChange={e => set('mailingAddress', e.target.value)} placeholder="123 Main St" />)}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {field('City', <Input className="h-8 text-sm" value={editForm.city} onChange={e => set('city', e.target.value)} placeholder="Chicago" />)}
                    {field('State', stateSelect(editForm.state, v => set('state', v)))}
                    {field('ZIP Code', <Input className="h-8 text-sm" value={editForm.zipCode} onChange={e => set('zipCode', sanitizeDigits(e.target.value))} inputMode="numeric" maxLength={10} placeholder="60601" />)}
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {infoRow('Street', user.mailingAddress)}
                  {infoRow('City', user.city)}
                  {infoRow('State', user.state)}
                  {infoRow('Zip Code', user.zipCode)}
                  {!user.mailingAddress && !user.city && (
                    <p className="text-sm text-muted-foreground py-1">No address on file.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Dealer: Business Info ───────────────────────────────────────── */}
          {isDealer && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Phone className={`size-4 ${colors.accentText}`} />Dealer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0">
                {infoRow('Owner', [user.ownerFirstName, user.ownerLastName].filter(Boolean).join(' ') || null)}
                {infoRow('Year Established', user.yearEstablished)}
                {infoRow('Dealer License #', user.dealerLicenseNumber)}
                {infoRow('Auction Access #', user.auctionAccessNumber)}
                {infoRow('How They Found Us', user.howDidYouHear)}
                {!user.ownerFirstName && !user.yearEstablished && (
                  <p className="text-sm text-muted-foreground py-1">No dealer information on file.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Carrier: Insurance ──────────────────────────────────────────── */}
          {isCarrier && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className={`size-4 ${colors.accentText}`} />Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field('Insurance Company', <Input className="h-8 text-sm" value={editForm.insuranceCompany} onChange={e => set('insuranceCompany', e.target.value)} />)}
                    {field('Cargo Insurance ($)', <Input className="h-8 text-sm" value={editForm.cargoInsurance} onChange={e => set('cargoInsurance', sanitizeDigits(e.target.value))} inputMode="numeric" placeholder="500000" />)}
                    {field('Liability Insurance ($)', <Input className="h-8 text-sm" value={editForm.liabilityInsurance} onChange={e => set('liabilityInsurance', sanitizeDigits(e.target.value))} inputMode="numeric" placeholder="1000000" />)}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {infoRow('Insurance Company', user.insuranceCompany)}
                    {infoRow('Cargo Insurance', user.cargoInsurance != null ? `$${Number(user.cargoInsurance).toLocaleString()}` : null)}
                    {infoRow('Liability Insurance', user.liabilityInsurance != null ? `$${Number(user.liabilityInsurance).toLocaleString()}` : null)}
                    {!user.insuranceCompany && user.cargoInsurance == null && (
                      <p className="text-sm text-muted-foreground py-1">No insurance information on file.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Carrier: Preferred Lanes ────────────────────────────────────── */}
          {isCarrier && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className={`size-4 ${colors.accentText}`} />Preferred Lanes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {isEditing ? (
                  <div className="space-y-2">
                    {preferredLinesEdit.map((lane, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Select value={lane.fromState} onValueChange={v => setLane(i, 'fromState', v)}>
                          <SelectTrigger className="h-8 text-sm flex-1"><SelectValue placeholder="From" /></SelectTrigger>
                          <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                        <Select value={lane.toState} onValueChange={v => setLane(i, 'toState', v)}>
                          <SelectTrigger className="h-8 text-sm flex-1"><SelectValue placeholder="To" /></SelectTrigger>
                          <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeLane(i)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="gap-1 mt-1" onClick={addLane}>
                      <Plus className="size-3" />Add Lane
                    </Button>
                    {preferredLinesEdit.length < 3 && (
                      <p className="text-xs text-amber-600">At least 3 preferred lanes recommended.</p>
                    )}
                  </div>
                ) : (
                  preferredLines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No preferred lanes on file.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {preferredLines.map((l, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
                          {l.fromState}<ArrowRight className="size-3 text-muted-foreground" />{l.toState}
                        </span>
                      ))}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Broker: Surety Bond ─────────────────────────────────────────── */}
          {isBroker && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className={`size-4 ${colors.accentText}`} />Surety Bond
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field('Bond Company', <Input className="h-8 text-sm" value={editForm.bondCompany} onChange={e => set('bondCompany', e.target.value)} />)}
                    {field('Policy Number', <Input className="h-8 text-sm" value={editForm.bondPolicyNumber} onChange={e => set('bondPolicyNumber', e.target.value)} />)}
                    {field('Coverage Amount ($)', <Input className="h-8 text-sm" value={editForm.bondCoverage} onChange={e => set('bondCoverage', e.target.value)} inputMode="numeric" />)}
                    {field('Effective Date', <Input className="h-8 text-sm" type="date" value={editForm.bondEffectiveDate} onChange={e => set('bondEffectiveDate', e.target.value)} />)}
                    {field('Agent First Name', <Input className="h-8 text-sm" value={editForm.bondAgentFirstName} onChange={e => set('bondAgentFirstName', e.target.value)} />)}
                    {field('Agent Last Name', <Input className="h-8 text-sm" value={editForm.bondAgentLastName} onChange={e => set('bondAgentLastName', e.target.value)} />)}
                    {field('Agent Email', <Input className="h-8 text-sm" type="email" value={editForm.bondAgentEmail} onChange={e => set('bondAgentEmail', e.target.value)} />)}
                    {field('Agent Phone', <PhoneInput value={editForm.bondAgentPhone} onChange={v => set('bondAgentPhone', v)} />)}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {hasBondInfo ? (
                      <>
                        {infoRow('Bond Company', user.bondCompany)}
                        {infoRow('Policy Number', user.bondPolicyNumber)}
                        {infoRow('Coverage Amount', user.bondCoverage ? `$${Number(user.bondCoverage).toLocaleString()}` : null)}
                        {infoRow('Effective Date', user.bondEffectiveDate ? new Date(user.bondEffectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null)}
                        {infoRow('Bond Agent', bondAgentName || null)}
                        {infoRow('Agent Email', user.bondAgentEmail)}
                        {infoRow('Agent Phone', user.bondAgentPhone ? formatPhone(user.bondAgentPhone) : null)}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground py-1">No bond information on file.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Tax Information ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className={`size-4 ${colors.accentText}`} />Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {field('Tax ID Type',
                    <Select value={editForm.taxIdType} onValueChange={v => set('taxIdType', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EIN">EIN</SelectItem>
                        <SelectItem value="SSN">SSN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {field(editForm.taxIdType === 'SSN' ? 'SSN' : 'EIN', <Input className="h-8 text-sm" value={editForm.taxId} onChange={e => set('taxId', e.target.value)} placeholder={editForm.taxIdType === 'EIN' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'} />)}
                </div>
              ) : (
                <div className="space-y-0">
                  {infoRow('Tax ID Type', user.taxIdType)}
                  {infoRow(user.taxIdType === 'EIN' ? 'EIN' : user.taxIdType === 'SSN' ? 'SSN' : 'Tax ID', user.taxId ?? null)}
                  {!user.taxIdType && !user.taxId && (
                    <p className="text-sm text-muted-foreground py-1">No tax information on file.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Account Details ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className={`size-4 ${colors.accentText}`} />Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Email', user.email)}
              {infoRow('Role', user.role)}
              {infoRow('Email Verified', user.emailVerified ? 'Yes' : 'No')}
              {infoRow('Registered', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null)}
            </CardContent>
          </Card>

          {/* ── Documents ───────────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className={`size-4 ${colors.accentText}`} />Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {user.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {user.documents.map((doc: AdminDocumentDto) => (
                    <li key={doc.documentId} className="flex items-center justify-between gap-2 text-sm border rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <span>{doc.originalName}</span>
                        <Badge variant="outline" className="text-xs">{doc.documentType}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                        <a
                          href={toAbsoluteUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View ${doc.originalName}`}
                          className={`${colors.accentText} hover:text-amber-600`}
                        >
                          <Eye className="size-4" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Upload section — always visible when editing, or when profileId exists */}
              {(isEditing || user.profileId) && (
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Upload className="size-3" />Upload Document
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={uploadType} onValueChange={v => setUploadType(v as DocType)}>
                      <SelectTrigger className="h-8 text-sm w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {docTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-1.5 cursor-pointer h-8 px-3 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                      <Upload className="size-3" />Choose File
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,.heic" className="sr-only" onChange={handleDocumentUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, PNG, JPG, WEBP — max 5MB</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditForm(formFromUser(user)); }} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className={colors.accentBtn}>
                {isSaving ? <Loader2 className="size-4 mr-1 animate-spin" /> : null}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" disabled={isActing} onClick={() => onDelete(user)}>
                  <Trash2 className="size-4 mr-1" /> Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4 mr-1" /> Edit
                </Button>
              </div>
              <div className="flex gap-2">
                {!user.adminApproved && !user.declined && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActing}
                    onClick={() => onDecline(user)}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <XCircle className="size-4 mr-1" /> Decline
                  </Button>
                )}
                {!user.adminApproved && (
                  <Button size="sm" disabled={isActing} onClick={() => onApprove(user)} className={colors.accentBtn}>
                    {isActing ? <Loader2 className="size-4 mr-1 animate-spin" /> : <CheckCircle className="size-4 mr-1" />}
                    {user.declined ? 'Re-Approve' : 'Approve'}
                  </Button>
                )}
                {user.adminApproved && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActing}
                    onClick={() => onRevoke(user)}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <XCircle className="size-4 mr-1" /> Revoke Approval
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
