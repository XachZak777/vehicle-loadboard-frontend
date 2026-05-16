import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import {
  CheckCircle, XCircle, Trash2, Eye, FileText, Loader2,
  Building2, ShieldCheck, Mail, MapPin,
} from 'lucide-react';
import type { AdminUserDto, AdminDocumentDto } from '../../store/services/hauliusApi';
import { colors } from '../../styles/colors';

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
      <div key={label} className="flex justify-between py-1 border-b border-border last:border-0 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right max-w-[60%] break-all">{value}</span>
      </div>
    ) : null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.role === 'CARRIER'
              ? <Badge variant="outline" className="text-muted-foreground border-border">Carrier</Badge>
              : <Badge variant="outline" className="text-muted-foreground border-border">Broker</Badge>
            }
            {user.email}
          </DialogTitle>
          <DialogDescription>
            Registration submitted {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <ApprovalBadge approved={user.adminApproved} declined={user.declined} />
            {user.emailVerified
              ? <Badge className="bg-muted text-muted-foreground flex items-center gap-1"><Mail className="size-3" />Email Verified</Badge>
              : <Badge variant="outline" className="text-muted-foreground flex items-center gap-1"><Mail className="size-3" />Email Unverified</Badge>
            }
            {user.fmcsaVerified && (
              <Badge className={`${colors.accentChip} flex items-center gap-1`}>
                <ShieldCheck className="size-3" />FMCSA Verified
              </Badge>
            )}
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

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className={`size-4 ${colors.accentText}`} />Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Company Name', user.companyName)}
              {infoRow('DBA Name', user.dbaName)}
              {infoRow('DOT Number', user.dotNumber)}
              {infoRow('MC Number', user.mcNumber)}
              {infoRow('Phone', user.phoneNumber)}
              {infoRow('Carrier Operation', user.carrierOperation)}
            </CardContent>
          </Card>

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
                <p className="text-sm text-muted-foreground">No address on file.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className={`size-4 ${colors.accentText}`} />Insurance & Tax
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Insurance Company', user.insuranceCompany)}
              {infoRow('Cargo Insurance', user.cargoInsurance ? `$${Number(user.cargoInsurance).toLocaleString()}` : null)}
              {infoRow('Liability Insurance', user.liabilityInsurance ? `$${Number(user.liabilityInsurance).toLocaleString()}` : null)}
              {infoRow('Tax ID Type', user.taxIdType)}
              {infoRow('Tax ID', user.taxId ? '••••••' + user.taxId.slice(-4) : null)}
            </CardContent>
          </Card>

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
              {infoRow('FMCSA Verified', user.fmcsaVerified ? 'Yes' : 'No')}
              {infoRow('Verification Date', user.verificationDate ? new Date(user.verificationDate).toLocaleDateString() : null)}
              {infoRow('Registered', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null)}
            </CardContent>
          </Card>

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
              /* Pending — show Decline button */
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
