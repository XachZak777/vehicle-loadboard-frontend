import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import * as api from '../services/apiClient';
import type { LoadDto, BidDto } from '../services/apiClient';
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
  AlertCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';

type BidWithLoad = BidDto & { load?: LoadDto };

export function CarrierHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bidsWithLoads, setBidsWithLoads] = useState<BidWithLoad[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setFetching(true);
    setError(null);
    try {
      // Get all loads the carrier is associated with
      const loads = await api.getLoads();

      // Get all loads assigned to or bid on by this carrier
      const carrierLoads = await api.getLoadsForCarrier(user.id);

      // Build a combined picture: for each load the carrier can see, find their bids
      const allLoads = [...carrierLoads];
      // Also include any open loads that may have the carrier's bids
      for (const l of loads) {
        if (!allLoads.find(al => al.id === l.id)) {
          if (l.assignedCarrierId === user.id || l.carrierId === user.id) {
            allLoads.push(l);
          }
        }
      }

      const bids: BidWithLoad[] = [];
      for (const load of allLoads) {
        try {
          const loadBids = await api.getBidsForLoad(load.id);
          const myBids = loadBids.filter(b => b.carrierId === user.id);
          for (const bid of myBids) {
            bids.push({ ...bid, load });
          }
        } catch {
          // skip loads where bid fetch fails
        }
      }

      setBidsWithLoads(bids);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load history');
    } finally {
      setFetching(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingBids = bidsWithLoads.filter(b => b.status === 'PENDING');
  const approvedBids = bidsWithLoads.filter(b => b.status === 'APPROVED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-yellow-600" />
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="flex items-center gap-1 bg-green-600 text-white">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <Button className="mt-4" onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Load History</h1>
        {user?.email && (
          <p className="text-muted-foreground mb-8">{user.email}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-3xl font-bold">{bidsWithLoads.length}</p>
                </div>
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{pendingBids.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedBids.length}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-3xl font-bold">
                    ${approvedBids.reduce((s, b) => s + (b.amount || 0), 0).toLocaleString()}
                  </p>
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
              Pending ({pendingBids.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedBids.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Bids ({bidsWithLoads.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="space-y-4">
            {pendingBids.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending bids</p>
                  <p className="text-sm mt-2">Browse available loads and place bids</p>
                  <Button className="mt-4" onClick={() => navigate('/loads')}>
                    Browse Loads
                  </Button>
                </CardContent>
              </Card>
            ) : (
              pendingBids.map(bid => (
                <Card key={bid.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {bid.load
                            ? `${bid.load.vehicleYear} ${bid.load.vehicleMake} ${bid.load.vehicleModel}`
                            : `Load #${bid.loadId.slice(0, 8)}`}
                        </CardTitle>
                        {bid.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Placed: {new Date(bid.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {bid.load && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {bid.load.pickupCity}, {bid.load.pickupState} → {bid.load.dropCity}, {bid.load.dropState}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">Your bid: ${bid.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-700 dark:text-yellow-400">
                        Waiting for broker approval
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Approved */}
          <TabsContent value="approved" className="space-y-4">
            {approvedBids.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No approved bids yet</p>
                  <p className="text-sm mt-2">Approved bids will appear here</p>
                </CardContent>
              </Card>
            ) : (
              approvedBids.map(bid => (
                <Card key={bid.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {bid.load
                            ? `${bid.load.vehicleYear} ${bid.load.vehicleMake} ${bid.load.vehicleModel}`
                            : `Load #${bid.loadId.slice(0, 8)}`}
                        </CardTitle>
                        {bid.updatedAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Approved: {new Date(bid.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {bid.load && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {bid.load.pickupCity}, {bid.load.pickupState} → {bid.load.dropCity}, {bid.load.dropState}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">${bid.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        Load assigned to you
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* All */}
          <TabsContent value="all" className="space-y-4">
            {bidsWithLoads.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bid history yet</p>
                  <p className="text-sm mt-2">Start bidding on loads to build your history</p>
                  <Button className="mt-4" onClick={() => navigate('/loads')}>
                    Browse Available Loads
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bidsWithLoads.map(bid => (
                <Card key={bid.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {bid.load
                            ? `${bid.load.vehicleYear} ${bid.load.vehicleMake} ${bid.load.vehicleModel}`
                            : `Load #${bid.loadId.slice(0, 8)}`}
                        </CardTitle>
                        {bid.load && (
                          <div className="text-sm text-muted-foreground">
                            {bid.load.pickupCity}, {bid.load.pickupState} → {bid.load.dropCity}, {bid.load.dropState}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        {bid.createdAt && (
                          <>
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">${bid.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
