import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useGetMyCarrierBidsQuery, useGetBrokerPublicInfoQuery } from '../store/services/hauliusApi';
import type { CarrierBidWithLoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RateModal } from '../components/RateModal';
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
  Building2,
  Phone,
  Star,
} from 'lucide-react';

const COMPLETED_STATUSES = ['DELIVERED', 'PAID', 'COMPLETED'];

function BrokerContactInline({ brokerId }: { brokerId: string }) {
  const { data, isLoading } = useGetBrokerPublicInfoQuery(brokerId);
  if (isLoading) return <span className="text-xs italic text-muted-foreground">Loading broker info…</span>;
  if (!data) return null;
  const name = data.companyName || data.legalName;
  return (
    <div className="mt-2 p-3 bg-muted rounded-md text-xs space-y-1">
      <p className="font-semibold text-sm text-foreground">Broker Contact</p>
      {name && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Building2 className="size-3" />
          <span>{name}</span>
        </div>
      )}
      {data.mcNumber && <div className="text-muted-foreground">MC: <span className="font-mono">{data.mcNumber}</span></div>}
      {data.phoneNumber && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Phone className="size-3" />
          <a href={`tel:${data.phoneNumber}`} className="hover:text-amber-600">{data.phoneNumber}</a>
        </div>
      )}
      {data.email && (
        <div className="text-muted-foreground">
          <a href={`mailto:${data.email}`} className="hover:text-amber-600">{data.email}</a>
        </div>
      )}
    </div>
  );
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadge(status: string) {
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
    case 'REJECTED':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function BidCard({ bid }: { bid: CarrierBidWithLoadDto }) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const { data: brokerInfo } = useGetBrokerPublicInfoQuery(bid.brokerId ?? '', { skip: !bid.brokerId });
  const brokerName = brokerInfo?.companyName || brokerInfo?.legalName || 'the broker';
  const vehicleTitle = [bid.vehicleYear, bid.vehicleMake, bid.vehicleModel].filter(Boolean).join(' ') || `Load #${bid.loadId.slice(0, 8)}`;
  const isCompleted = COMPLETED_STATUSES.includes(bid.loadStatus ?? '');
  const isApproved = bid.bidStatus === 'APPROVED';
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg">{vehicleTitle}</CardTitle>
            {(bid.pickupCity || bid.dropCity) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{bid.pickupCity}, {bid.pickupState} → {bid.dropCity}, {bid.dropState}</span>
              </div>
            )}
          </div>
          {getStatusBadge(bid.bidStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Bid</p>
            <p className="font-semibold flex items-center gap-1">
              <DollarSign className="size-3.5 text-green-600" />
              ${Number(bid.amount).toLocaleString()}
            </p>
          </div>
          {bid.price != null && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Listed Price</p>
              <p className="font-semibold">${Number(bid.price).toLocaleString()}</p>
            </div>
          )}
          {bid.loadCreatedAt && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Posted</p>
              <p className="flex items-center gap-1">
                <Calendar className="size-3.5 text-muted-foreground" />
                {fmtDate(bid.loadCreatedAt)}
              </p>
            </div>
          )}
          {bid.pickupDate && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pickup Date</p>
              <p className="flex items-center gap-1">
                <Calendar className="size-3.5 text-amber-500" />
                {fmtDate(bid.pickupDate)}
              </p>
            </div>
          )}
          {bid.deliveryDate && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery Date</p>
              <p className="flex items-center gap-1">
                <Calendar className="size-3.5 text-amber-500" />
                {fmtDate(bid.deliveryDate)}
              </p>
            </div>
          )}
          {bid.bidCreatedAt && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Bid Placed</p>
              <p>{fmtDate(bid.bidCreatedAt)}</p>
            </div>
          )}
        </div>
        {isApproved ? (
          <>
            <div className="flex items-center gap-2 text-sm mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400 font-medium">Load assigned to you</span>
            </div>
            {bid.brokerId && <BrokerContactInline brokerId={bid.brokerId} />}
          </>
        ) : bid.bidStatus === 'PENDING' ? (
          <div className="flex items-center gap-2 text-sm p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700 dark:text-yellow-400">Waiting for broker approval</span>
          </div>
        ) : null}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <Link to={`/load/${bid.loadId}`}>
            <Button variant="outline" size="sm">View Load</Button>
          </Link>
          {isCompleted && bid.brokerId && (
            ratingSubmitted ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle className="size-4" />
                Rating Submitted
              </span>
            ) : (
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setRatingOpen(true)}
              >
                <Star className="size-3.5 mr-1.5" />
                Rate Broker
              </Button>
            )
          )}
        </div>
      </CardContent>

      {bid.brokerId && (
        <RateModal
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          onSubmitted={() => setRatingSubmitted(true)}
          targetId={bid.brokerId}
          targetType="broker"
          targetName={brokerName}
          loadId={bid.loadId}
          vehicleTitle={vehicleTitle}
        />
      )}
    </Card>
  );
}

// Main component
export function CarrierHistory() {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  const { data: bids = [], isLoading, isError, refetch } = useGetMyCarrierBidsQuery(undefined, {
    skip: user?.role !== 'carrier',
  });

  const pendingBids = bids.filter(b => b.bidStatus === 'PENDING');
  const approvedBids = bids.filter(b => b.bidStatus === 'APPROVED');

  if (isLoading) {
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
          <p className="text-lg font-semibold text-red-600">Failed to load bid history</p>
          <Button className="mt-4" onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Load History</h1>
        {user?.email && <p className="text-muted-foreground mb-8">{user.email}</p>}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-3xl font-bold">{bids.length}</p>
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
                    ${approvedBids.reduce((s, b) => s + (Number(b.amount) || 0), 0).toLocaleString()}
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
            <TabsTrigger value="pending">Pending ({pendingBids.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedBids.length})</TabsTrigger>
            <TabsTrigger value="all">All Bids ({bids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBids.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending bids</p>
                  <p className="text-sm mt-2">Browse available loads and place bids</p>
                  <Button className="mt-4" onClick={() => navigate('/loads')}>Browse Loads</Button>
                </CardContent>
              </Card>
            ) : (
              pendingBids.map(bid => <BidCard key={bid.bidId} bid={bid} />)
            )}
          </TabsContent>

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
              approvedBids.map(bid => <BidCard key={bid.bidId} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {bids.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bid history yet</p>
                  <p className="text-sm mt-2">Start bidding on loads to build your history</p>
                  <Button className="mt-4" onClick={() => navigate('/loads')}>Browse Available Loads</Button>
                </CardContent>
              </Card>
            ) : (
              bids.map(bid => <BidCard key={bid.bidId} bid={bid} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
