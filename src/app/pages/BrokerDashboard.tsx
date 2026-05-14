import { useAppSelector } from '../store/hooks';
import {
  useGetMyBrokerLoadsQuery,
  useApproveBidMutation,
  useCancelBookingMutation,
  useDeleteLoadMutation,
} from '../store/services/hauliusApi';
import type { LoadDto, BidDto } from '../store/services/hauliusApi';

// Set to true to show a mock completed load for UI testing (no backend needed)
const USE_MOCK = false;

const MOCK_COMPLETED_LOAD: LoadDto = {
  id: 'mock-completed-001',
  brokerId: 'mock-broker',
  assignedCarrierId: 'mock-carrier-001',
  pickupCity: 'Los Angeles',
  pickupState: 'CA',
  dropCity: 'Phoenix',
  dropState: 'AZ',
  vehicleMake: 'Ford',
  vehicleModel: 'F-150',
  vehicleYear: 2021,
  price: 1200,
  status: 'DELIVERED',
};
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardStats } from '../components/broker/DashboardStats';
import { PendingBidsTab } from '../components/broker/PendingBidsTab';
import { AssignedLoadsTab } from '../components/broker/AssignedLoadsTab';
import { AllLoadsTab } from '../components/broker/AllLoadsTab';

export function BrokerDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const {
    data: loads = [],
    isLoading: fetching,
    isError,
    error,
    refetch,
  } = useGetMyBrokerLoadsQuery();
  const [approveBid, { isLoading: approving }] = useApproveBidMutation();
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [deleteLoad, { isLoading: deleting }] = useDeleteLoadMutation();
  const actionLoading = approving || cancelling || deleting;

  const handleApproveBid = async (load: LoadDto, bid: BidDto) => {
    try {
      await approveBid({ loadId: load.id, bidId: bid.id }).unwrap();
      toast.success('Bid approved — load is now assigned');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to approve bid');
    }
  };

  const handleCancelBooking = async (load: LoadDto) => {
    try {
      await cancelBooking(load.id).unwrap();
      toast.success('Booking cancelled — load is open again');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to cancel booking');
    }
  };

  const handleDeleteLoad = async (load: LoadDto) => {
    if (
      !confirm(
        `Delete load "${load.vehicleYear} ${load.vehicleMake} ${load.vehicleModel}"?`,
      )
    )
      return;
    try {
      await deleteLoad(load.id).unwrap();
      toast.success('Load deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete load');
    }
  };

  const openLoads = loads.filter((l) => l.status === 'OPEN');
  const assignedLoads = [
    ...(USE_MOCK ? [MOCK_COMPLETED_LOAD] : []),
    ...loads.filter((l) => l.status !== 'OPEN' && l.assignedCarrierId),
  ];

  const getStatusBadge = (load: LoadDto) => {
    if (load.status === 'OPEN') {
      return <Badge className='bg-amber-500 text-white'>Open</Badge>;
    }
    if (
      load.status === 'DELIVERED' ||
      load.status === 'PAID' ||
      load.status === 'COMPLETED'
    ) {
      return (
        <Badge className='bg-muted text-muted-foreground'>
          {load.status.charAt(0) + load.status.slice(1).toLowerCase()}
        </Badge>
      );
    }
    if (load.assignedCarrierId) {
      return <Badge className='bg-amber-500 text-white'>Assigned</Badge>;
    }
    return <Badge variant='secondary'>{load.status}</Badge>;
  };

  if (fetching) {
    return (
      <div className='min-h-screen bg-background map-background-detailed'>
        <Navbar />
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
        </div>
      </div>
    );
  }

  // if (isError) {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <Navbar />
  //       <div className="container mx-auto px-4 py-16 text-center">
  //         <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
  //         <p className="text-lg font-semibold text-red-600">{(error as any)?.message ?? 'Failed to load dashboard'}</p>
  //         <Button className="mt-4" onClick={refetch}>Retry</Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className='min-h-screen bg-background map-background-detailed'>
      <Navbar />

      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-2'>Broker Dashboard</h1>
        {user?.email && (
          <p className='text-muted-foreground mb-8'>{user.email}</p>
        )}

        <DashboardStats
          loads={loads}
          openLoads={openLoads}
          assignedLoads={assignedLoads}
        />

        <Tabs defaultValue='pending' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='pending'>Pending Bids</TabsTrigger>
            <TabsTrigger value='assigned'>
              Assigned ({assignedLoads.length})
            </TabsTrigger>
            <TabsTrigger value='myloads'>
              All Loads ({loads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='pending' className='space-y-4'>
            <PendingBidsTab
              openLoads={openLoads}
              getStatusBadge={getStatusBadge}
              onApproveBid={handleApproveBid}
              actionLoading={actionLoading}
            />
          </TabsContent>

          <TabsContent value='assigned' className='space-y-4'>
            <AssignedLoadsTab
              assignedLoads={assignedLoads}
              getStatusBadge={getStatusBadge}
              onCancelBooking={handleCancelBooking}
              actionLoading={actionLoading}
            />
          </TabsContent>

          <TabsContent value='myloads' className='space-y-4'>
            <AllLoadsTab
              loads={loads}
              getStatusBadge={getStatusBadge}
              onDeleteLoad={handleDeleteLoad}
              actionLoading={actionLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
