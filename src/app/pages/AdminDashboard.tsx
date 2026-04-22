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
} from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, AlertCircle, Users, Truck, Building2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { UserDetailDialog } from '../components/admin/UserDetailDialog';
import { DeleteConfirmDialog } from '../components/admin/DeleteConfirmDialog';
import { UserRow } from '../components/admin/UserRow';

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
