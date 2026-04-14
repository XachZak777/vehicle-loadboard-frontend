import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  useGetAdminUsersQuery,
  useApproveCarrierMutation,
  useDeclineCarrierMutation,
  useApproveBrokerMutation,
  useDeclineBrokerMutation,
  useDeleteAdminUserMutation,
  type AdminUserDto,
  type AdminDocumentDto,
} from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  Truck,
  Building2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

// ── helpers ──────────────────────────────────────────────────────────────────

function ApprovalBadge({ approved }: { approved: boolean }) {
  return approved
    ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>
    : <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
}

function roleBadge(role: string) {
  return role === 'CARRIER'
    ? <Badge variant="outline" className="text-blue-600 border-blue-300"><Truck className="size-3 mr-1" />Carrier</Badge>
    : <Badge variant="outline" className="text-purple-600 border-purple-300"><Building2 className="size-3 mr-1" />Broker</Badge>;
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function UserDetailDialog({
  user,
  onClose,
  onApprove,
  onDecline,
  onDelete,
  isActing,
}: {
  user: AdminUserDto;
  onClose: () => void;
  onApprove: (u: AdminUserDto) => void;
  onDecline: (u: AdminUserDto) => void;
  onDelete: (u: AdminUserDto) => void;
  isActing: boolean;
}) {
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
            {roleBadge(user.role)}
            {user.email}
          </DialogTitle>
          <DialogDescription>
            Registration submitted {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <ApprovalBadge approved={user.adminApproved} />
            {user.adminApprovedAt && (
              <span className="text-xs text-muted-foreground">
                {user.adminApproved ? 'Approved' : 'Updated'} {new Date(user.adminApprovedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Company / profile fields */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0">
              {infoRow('Company Name', user.companyName)}
              {infoRow('DOT Number', user.dotNumber)}
              {infoRow('MC Number', user.mcNumber)}
              {infoRow('Phone', user.phoneNumber)}
              {infoRow('Address', [user.mailingAddress, user.city, user.state, user.zipCode].filter(Boolean).join(', '))}
              {infoRow('Insurance Company', user.insuranceCompany)}
              {infoRow('Cargo Insurance', user.cargoInsurance ? `$${Number(user.cargoInsurance).toLocaleString()}` : null)}
              {infoRow('Liability Insurance', user.liabilityInsurance ? `$${Number(user.liabilityInsurance).toLocaleString()}` : null)}
              {infoRow('Tax ID Type', user.taxIdType)}
              {infoRow('Tax ID', user.taxId ? '••••••' + user.taxId.slice(-4) : null)}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">Uploaded Documents</CardTitle>
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
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:text-amber-600"
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
          <Button
            variant="destructive"
            size="sm"
            disabled={isActing}
            onClick={() => onDelete(user)}
          >
            <Trash2 className="size-4 mr-1" /> Delete Registration
          </Button>
          <div className="flex gap-2">
            {!user.adminApproved && (
              <Button
                variant="outline"
                size="sm"
                disabled={isActing}
                onClick={() => onDecline(user)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="size-4 mr-1" /> Decline
              </Button>
            )}
            <Button
              size="sm"
              disabled={isActing || user.adminApproved}
              onClick={() => onApprove(user)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isActing ? <Loader2 className="size-4 mr-1 animate-spin" /> : <CheckCircle className="size-4 mr-1" />}
              {user.adminApproved ? 'Approved' : 'Approve'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirmDialog({
  user,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  user: AdminUserDto;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Registration</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{user.email}</strong> and all their data.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Trash2 className="size-4 mr-1" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── User row ──────────────────────────────────────────────────────────────────

function UserRow({
  user,
  onView,
}: {
  user: AdminUserDto;
  onView: (u: AdminUserDto) => void;
}) {
  return (
    <tr className="border-b border-border hover:bg-muted/40 transition-colors">
      <td className="py-3 px-4 text-sm font-medium">{user.email}</td>
      <td className="py-3 px-4">{roleBadge(user.role)}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{user.companyName || '—'}</td>
      <td className="py-3 px-4">
        <ApprovalBadge approved={user.adminApproved} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {user.documents.length > 0
          ? <span className="flex items-center gap-1"><FileText className="size-3" />{user.documents.length}</span>
          : <span className="text-xs">none</span>}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
      </td>
      <td className="py-3 px-4">
        <Button size="sm" variant="ghost" onClick={() => onView(user)}>
          <Eye className="size-4 mr-1" /> Review
        </Button>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();

  const { data: users = [], isLoading, isError, refetch } = useGetAdminUsersQuery();
  const [approveCarrier]  = useApproveCarrierMutation();
  const [declineCarrier]  = useDeclineCarrierMutation();
  const [approveBroker]   = useApproveBrokerMutation();
  const [declineBroker]   = useDeclineBrokerMutation();
  const [deleteUser]      = useDeleteAdminUserMutation();

  const [selectedUser, setSelectedUser]   = useState<AdminUserDto | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<AdminUserDto | null>(null);
  const [isActing, setIsActing]           = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);

  const pending  = users.filter(u => !u.adminApproved);
  const approved = users.filter(u => u.adminApproved);
  const carriers = users.filter(u => u.role === 'CARRIER');
  const brokers  = users.filter(u => u.role === 'BROKER');

  const handleApprove = async (user: AdminUserDto) => {
    setIsActing(true);
    try {
      if (!user.profileId) throw new Error('No profile ID');
      if (user.role === 'CARRIER') await approveCarrier(user.profileId).unwrap();
      else await approveBroker(user.profileId).unwrap();
      toast.success('Registration approved', { description: user.email });
      setSelectedUser(null);
    } catch (e: any) {
      toast.error('Failed to approve', { description: e?.message });
    } finally {
      setIsActing(false);
    }
  };

  const handleDecline = async (user: AdminUserDto) => {
    setIsActing(true);
    try {
      if (!user.profileId) throw new Error('No profile ID');
      if (user.role === 'CARRIER') await declineCarrier(user.profileId).unwrap();
      else await declineBroker(user.profileId).unwrap();
      toast.success('Registration declined', { description: user.email });
      setSelectedUser(null);
    } catch (e: any) {
      toast.error('Failed to decline', { description: e?.message });
    } finally {
      setIsActing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.userId).unwrap();
      toast.success('User deleted', { description: deleteTarget.email });
      setDeleteTarget(null);
      setSelectedUser(null);
    } catch (e: any) {
      toast.error('Failed to delete', { description: e?.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const statsCards = [
    { label: 'Total Users',    value: users.length,    icon: Users,       color: 'text-blue-500' },
    { label: 'Pending Review', value: pending.length,  icon: Clock,       color: 'text-amber-500' },
    { label: 'Carriers',       value: carriers.length, icon: Truck,       color: 'text-green-500' },
    { label: 'Brokers',        value: brokers.length,  icon: Building2,   color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Review registrations, approve or decline users</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`size-6 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <AlertCircle className="size-8" />
            <p>Failed to load users</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending <Badge className="ml-2 bg-amber-100 text-amber-700">{pending.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved <Badge className="ml-2 bg-green-100 text-green-700">{approved.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all">All ({users.length})</TabsTrigger>
            </TabsList>

            {(['pending', 'approved', 'all'] as const).map(tab => {
              const rows = tab === 'pending' ? pending : tab === 'approved' ? approved : users;
              return (
                <TabsContent key={tab} value={tab}>
                  {rows.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Users className="size-10 mx-auto mb-3 opacity-40" />
                      <p>No users in this category</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 text-muted-foreground text-left">
                            <th className="py-3 px-4 font-medium">Email</th>
                            <th className="py-3 px-4 font-medium">Role</th>
                            <th className="py-3 px-4 font-medium">Company</th>
                            <th className="py-3 px-4 font-medium">Status</th>
                            <th className="py-3 px-4 font-medium">Docs</th>
                            <th className="py-3 px-4 font-medium">Registered</th>
                            <th className="py-3 px-4 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(u => (
                            <UserRow key={u.userId} user={u} onView={setSelectedUser} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>

      {/* Detail dialog */}
      {selectedUser && !deleteTarget && (
        <UserDetailDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={handleApprove}
          onDecline={handleDecline}
          onDelete={(u) => setDeleteTarget(u)}
          isActing={isActing}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
