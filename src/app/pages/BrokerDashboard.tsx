import { useMemo } from 'react';
import { Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import {
  useGetLoadsQuery,
  useGetBidsForLoadQuery,
  useApproveBidMutation,
  useCancelBookingMutation,
  useDeleteLoadMutation,
} from '../store/services/hauliusApi';
import type { LoadDto, BidDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type LoadWithBids = LoadDto & { bids: BidDto[] };

// Sub-component: loads a single load's bids and merges them
function LoadWithBidsLoader({ load, children }: { load: LoadDto; children: (merged: LoadWithBids) => React.ReactNode }) {
  const { data: bids = [] } = useGetBidsForLoadQuery(load.id);
  return <>{children({ ...load, bids })}</>;
}

export function BrokerDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: loads = [], isLoading: fetching, isError, error, refetch } = useGetLoadsQuery();
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
    if (!confirm(`Delete load "${load.vehicleYear} ${load.vehicleMake} ${load.vehicleModel}"?`)) return;
    try {
      await deleteLoad(load.id).unwrap();
      toast.success('Load deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete load');
    }
  };

  const openLoads = loads.filter(l => l.status === 'OPEN');
  const assignedLoads = loads.filter(l => l.status !== 'OPEN' && l.assignedCarrierId);

  const getStatusBadge = (load: LoadDto) => {
    if (load.status === 'OPEN') {
      return <Badge className="bg-amber-500 text-white">Open</Badge>;
    }
    if (load.assignedCarrierId) {
      return <Badge className="bg-green-600 text-white">Assigned</Badge>;
    }
    return <Badge variant="secondary">{load.status}</Badge>;
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold text-red-600">{(error as any)?.message ?? 'Failed to load dashboard'}</p>
          <Button className="mt-4" onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Broker Dashboard</h1>
        {user?.email && (
          <p className="text-muted-foreground mb-8">{user.email}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Loads</p>
                  <p className="text-3xl font-bold">{loads.length}</p>
                </div>
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Loads</p>
                  <p className="text-3xl font-bold">{openLoads.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                  <p className="text-3xl font-bold">{assignedLoads.length}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Bids</p>
                  <p className="text-3xl font-bold">{openLoads.length}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Bids
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({assignedLoads.length})
            </TabsTrigger>
            <TabsTrigger value="myloads">
              All Loads ({loads.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Bids */}
          <TabsContent value="pending" className="space-y-4">
            {openLoads.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending bids right now</p>
                </CardContent>
              </Card>
            ) : (
              openLoads.map(load => (
                <LoadWithBidsLoader key={load.id} load={load}>
                  {(loadWithBids) => {
                    const pendingBids = loadWithBids.bids.filter(b => b.status === 'PENDING');
                    if (pendingBids.length === 0) return null;
                    return (
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4" />
                                {load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}
                              </div>
                            </div>
                            {getStatusBadge(load)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <h4 className="font-semibold text-sm">Incoming Bids</h4>
                          {pendingBids.map(bid => (
                            <div key={bid.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold">${bid.amount.toLocaleString()}</span>
                                  {bid.bookNow && (
                                    <Badge variant="outline" className="text-xs">Book Now</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Carrier ID: {bid.carrierId.slice(0, 8)}…
                                </div>
                                {bid.createdAt && (
                                  <div className="text-xs text-muted-foreground">
                                    Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleApproveBid(load, bid)}
                                disabled={actionLoading}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  }}
                </LoadWithBidsLoader>
              ))
            )}
          </TabsContent>

          {/* Assigned Loads */}
          <TabsContent value="assigned" className="space-y-4">
            {assignedLoads.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No assigned loads yet</p>
                </CardContent>
              </Card>
            ) : (
              assignedLoads.map(load => (
                <Card key={load.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          Carrier: {load.assignedCarrierId?.slice(0, 8)}…
                        </div>
                      </div>
                      {getStatusBadge(load)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}</span>
                    </div>
                    {load.price != null && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">${load.price.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(load)}
                        disabled={actionLoading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* All Loads */}
          <TabsContent value="myloads" className="space-y-4">
            {loads.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted any loads yet</p>
                  <Button asChild>
                    <Link to="/post-load">Post Your First Load</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              loads.map(load => (
                <LoadWithBidsLoader key={load.id} load={load}>
                  {(loadWithBids) => (
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}
                            </p>
                          </div>
                          {getStatusBadge(load)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            {load.createdAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(load.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                            {load.price != null && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold">${load.price.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {loadWithBids.bids.length} {loadWithBids.bids.length === 1 ? 'bid' : 'bids'}
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLoad(load)}
                              disabled={actionLoading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </LoadWithBidsLoader>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
