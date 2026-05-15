import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  useGetAdminUsersQuery,
  useGetAdminUsersApprovedQuery,
  useGetAdminUsersPendingQuery,
  useGetAdminUsersRejectedQuery,
  useApproveCarrierMutation,
  useDeclineCarrierMutation,
  useRevokeCarrierMutation,
  useApproveBrokerMutation,
  useDeclineBrokerMutation,
  useRevokeBrokerMutation,
  useDeleteAdminUserMutation,
  type AdminUserDto,
} from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, AlertCircle, Users, Truck, Building2, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserDetailDialog } from '../components/admin/UserDetailDialog';
import { DeleteConfirmDialog } from '../components/admin/DeleteConfirmDialog';
import { UserRow } from '../components/admin/UserRow';

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();

  // Separate queries for each status — each hits its own endpoint
  const { data: allUsers    = [], isLoading: loadingAll,      isError: errorAll,      refetch: refetchAll }      = useGetAdminUsersQuery();
  const { data: approved    = [], isLoading: loadingApproved, isError: errorApproved, refetch: refetchApproved } = useGetAdminUsersApprovedQuery();
  const { data: pending     = [], isLoading: loadingPending,  isError: errorPending,  refetch: refetchPending }  = useGetAdminUsersPendingQuery();
  const { data: rejected    = [], isLoading: loadingRejected, isError: errorRejected, refetch: refetchRejected } = useGetAdminUsersRejectedQuery();

  const [approveCarrier]  = useApproveCarrierMutation();
  const [declineCarrier]  = useDeclineCarrierMutation();
  const [revokeCarrier]   = useRevokeCarrierMutation();
  const [approveBroker]   = useApproveBrokerMutation();
  const [declineBroker]   = useDeclineBrokerMutation();
  const [revokeBroker]    = useRevokeBrokerMutation();
  const [deleteUser]      = useDeleteAdminUserMutation();

  const [selectedUser, setSelectedUser]   = useState<AdminUserDto | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<AdminUserDto | null>(null);
  const [isActing, setIsActing]           = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);

  const carriers = allUsers.filter(u => u.role === 'CARRIER');
  const brokers  = allUsers.filter(u => u.role === 'BROKER');

  const refetchAll_ = () => {
    refetchAll();
    refetchApproved();
    refetchPending();
    refetchRejected();
  };

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

  const handleRevoke = async (user: AdminUserDto) => {
    setIsActing(true);
    try {
      if (!user.profileId) throw new Error('No profile ID');
      if (user.role === 'CARRIER') await revokeCarrier(user.profileId).unwrap();
      else await revokeBroker(user.profileId).unwrap();
      refetchAll_();
      toast.success('Approval revoked — moved back to Pending', { description: user.email });
      setSelectedUser(null);
    } catch (e: any) {
      toast.error('Failed to revoke approval', { description: e?.data?.message ?? e?.message });
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

  const isLoading = loadingAll || loadingApproved || loadingPending || loadingRejected;
  const isError   = errorAll   || errorApproved   || errorPending   || errorRejected;

  const statsCards = [
    { label: 'Total Users',    value: allUsers.length,  icon: Users,     color: 'text-blue-500' },
    { label: 'Pending Review', value: pending.length,   icon: Clock,     color: 'text-amber-500' },
    { label: 'Rejected',       value: rejected.length,  icon: XCircle,   color: 'text-red-500' },
    { label: 'Carriers',       value: carriers.length,  icon: Truck,     color: 'text-green-500' },
    { label: 'Brokers',        value: brokers.length,   icon: Building2, color: 'text-purple-500' },
  ];

  const UserTable = ({ rows }: { rows: AdminUserDto[] }) =>
    rows.length === 0 ? (
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
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Review registrations, approve or decline users</p>
          </div>
          <Button variant="outline" size="sm" onClick={refetchAll_}>
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            <Button variant="outline" onClick={refetchAll_}>Retry</Button>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending
                <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {pending.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {approved.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                <Badge className="ml-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {rejected.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="all">
                All
                <Badge className="ml-2 bg-muted text-muted-foreground">
                  {allUsers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <UserTable rows={pending} />
            </TabsContent>

            <TabsContent value="approved">
              <UserTable rows={approved} />
            </TabsContent>

            <TabsContent value="rejected">
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                <XCircle className="size-4 shrink-0" />
                <span>
                  These registrations were actively declined. You can re-approve them or permanently delete their account.
                </span>
              </div>
              <UserTable rows={rejected} />
            </TabsContent>

            <TabsContent value="all">
              <UserTable rows={allUsers} />
            </TabsContent>
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
          onRevoke={handleRevoke}
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
