import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import {
  CheckCircle, XCircle, Trash2, Eye, FileText, Loader2,
  Building2, ShieldCheck, Mail, MapPin, Phone, ArrowRight,
} from 'lucide-react';
import type { AdminUserDto, AdminDocumentDto } from '../../store/services/hauliusApi';
import { colors } from '../../styles/colors';
import { formatPhone } from '../../utils/phone';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '';
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function ApprovalBadge({ approved, declined }: { approved: boolean; declined: boolean }) {
  if (approved)
    return <Badge className={colors.accentChip}>Approved</Badge>;
  if (declined)
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
  return <Badge className={colors.accentChip}>Pending</Badge>;
}

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
  const infoRow = (label: string, value?: string | null) =>
    value ? (
      <div key={label} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <span className="font-medium text-right max-w-[60%] break-all">{value}</span>
      </div>
    ) : null;

  const isBroker = user.role === 'BROKER';
  const isCarrier = user.role === 'CARRIER';

  const bondAgentName = [user.bondAgentFirstName, user.bondAgentLastName].filter(Boolean).join(' ');
  const hasBondInfo = user.bondCompany || user.bondPolicyNumber || user.bondCoverage || user.bondEffectiveDate || bondAgentName;

  const preferredLines: { fromState: string; toState: string }[] = (() => {
    try { return user.preferredLines ? JSON.parse(user.preferredLines) : []; }
    catch { return []; }
  })();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBroker
              ? <Badge variant="outline" className="text-muted-foreground border-border">Broker</Badge>
              : <Badge variant="outline" className="text-muted-foreground border-border">Carrier</Badge>
            }
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
            {user.adminApprovedAt && user.adminApproved && (
              <span className="text-xs text-muted-foreground ml-auto">
                Approved {new Date(user.adminApprovedAt).toLocaleDateString()}
              </span>
            )}
            {user.declinedAt && user.declined && (
              <span className={`text-xs ${colors.errorText} ml-auto`}>
                Rejected {new Date(user.declinedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Company */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className={`size-4 ${colors.accentText}`} />Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Company Name', user.companyName)}
              {isCarrier && infoRow('DBA Name', user.dbaName)}
              {infoRow('DOT Number', user.dotNumber)}
              {infoRow('MC Number', user.mcNumber)}
              {infoRow('Phone', user.phoneNumber ? formatPhone(user.phoneNumber) : null)}
              {!user.companyName && !user.dotNumber && (
                <p className="text-sm text-muted-foreground py-1">No company information on file.</p>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className={`size-4 ${colors.accentText}`} />Address
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Street', user.mailingAddress)}
              {infoRow('City', user.city)}
              {infoRow('State', user.state)}
              {infoRow('Zip Code', user.zipCode)}
              {(!user.mailingAddress && !user.city) && (
                <p className="text-sm text-muted-foreground py-1">No address on file.</p>
              )}
            </CardContent>
          </Card>

          {/* Carrier: Insurance */}
          {isCarrier && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className={`size-4 ${colors.accentText}`} />Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0">
                {infoRow('Insurance Company', user.insuranceCompany)}
                {infoRow('Cargo Insurance', user.cargoInsurance != null ? `$${Number(user.cargoInsurance).toLocaleString()}` : null)}
                {infoRow('Liability Insurance', user.liabilityInsurance != null ? `$${Number(user.liabilityInsurance).toLocaleString()}` : null)}
                {!user.insuranceCompany && user.cargoInsurance == null && (
                  <p className="text-sm text-muted-foreground py-1">No insurance information on file.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Carrier: Preferred Lanes */}
          {isCarrier && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className={`size-4 ${colors.accentText}`} />Preferred Lanes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {preferredLines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No preferred lanes on file.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {preferredLines.map((l, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
                        {l.fromState}
                        <ArrowRight className="size-3 text-muted-foreground" />
                        {l.toState}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Broker: Surety Bond */}
          {isBroker && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className={`size-4 ${colors.accentText}`} />Surety Bond
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0">
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
              </CardContent>
            </Card>
          )}

          {/* Tax / EIN — full value visible to admin */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className={`size-4 ${colors.accentText}`} />Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Tax ID Type', user.taxIdType)}
              {infoRow(user.taxIdType === 'EIN' ? 'EIN' : user.taxIdType === 'SSN' ? 'SSN' : 'Tax ID', user.taxId ?? null)}
              {!user.taxIdType && !user.taxId && (
                <p className="text-sm text-muted-foreground py-1">No tax information on file.</p>
              )}
            </CardContent>
          </Card>

          {/* Account */}
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

          {/* Documents */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className={`size-4 ${colors.accentText}`} />Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
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
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <Button variant="destructive" size="sm" disabled={isActing} onClick={() => onDelete(user)}>
            <Trash2 className="size-4 mr-1" /> Delete Registration
          </Button>
          <div className="flex gap-2">
            {user.adminApproved ? null : !user.declined ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isActing}
                onClick={() => onDecline(user)}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <XCircle className="size-4 mr-1" /> Decline
              </Button>
            ) : null}
            {!user.adminApproved && (
              <Button
                size="sm"
                disabled={isActing}
                onClick={() => onApprove(user)}
                className={colors.accentBtn}
              >
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
