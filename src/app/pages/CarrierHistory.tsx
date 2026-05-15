import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useGetMyCarrierBidsQuery, useGetBrokerPublicInfoQuery } from '../store/services/hauliusApi';
import { formatPhone } from '../utils/phone';
import type { CarrierBidWithLoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RateModal } from '../components/RateModal';
import { MapBackground } from '../components/MapBackground';
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


function BrokerContactInline({ brokerId }: { brokerId: string }) {
  const { data, isLoading } = useGetBrokerPublicInfoQuery(brokerId);
  if (isLoading) return <span className="text-xs italic text-muted-foreground">Loading broker info…</span>;
  if (!data) return null;
  const name = data.companyName || data.legalName;
  return (
    <div className="mt-2 p-3 bg-muted text-xs space-y-1 border border-border">
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
          <a href={`tel:${data.phoneNumber}`} className="hover:text-amber-600">{formatPhone(data.phoneNumber)}</a>
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
          <Clock className="w-3 h-3 text-muted-foreground" />
          Pending
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge className="flex items-center gap-1 bg-amber-500 text-white">
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
  const isApproved = bid.bidStatus === 'APPROVED';
  return (
    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{vehicleTitle}</CardTitle>
          {getStatusBadge(bid.bidStatus)}
        </div>
        {(bid.pickupCity || bid.dropCity) && (
          <div className="flex items-center gap-2 mt-2 p-2.5 bg-gradient-to-r from-amber-50/40 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <MapPin className="size-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{bid.pickupCity}, {bid.pickupState}</span>
            </div>
            <span className="text-amber-500 font-bold flex-shrink-0">→</span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <MapPin className="size-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{bid.dropCity}, {bid.dropState}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Bid</p>
            <p className="font-semibold flex items-center gap-1">
              <DollarSign className="size-3.5 text-amber-600" />
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
            <div className="flex items-center gap-2 text-sm mt-2 p-3 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/40 dark:border-amber-500/40">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">Load assigned to you</span>
            </div>
            {bid.brokerId && <BrokerContactInline brokerId={bid.brokerId} />}
          </>
        ) : bid.bidStatus === 'PENDING' ? (
          <div className="flex items-center gap-2 text-sm p-3 bg-muted border border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Waiting for broker approval</span>
          </div>
        ) : null}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <Link to={`/load/${bid.loadId}`}>
            <Button variant="outline" size="sm">View Load</Button>
          </Link>
          {isApproved && bid.brokerId && (
            ratingSubmitted ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
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

  const COMPLETED_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);
  const pendingBids = bids.filter(b => b.bidStatus === 'PENDING');
  const approvedBids = bids.filter(b => b.bidStatus === 'APPROVED' && !COMPLETED_STATUSES.has(b.loadStatus ?? ''));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background map-background-detailed">
        <MapBackground />
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background map-background-detailed">
        <MapBackground />
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
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">My Load History</h1>
        {user?.email && <p className="text-muted-foreground mb-8">{user.email}</p>}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-gray-200 dark:border-gray-700">
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
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Pending</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{pendingBids.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Approved</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{approvedBids.length}</p>
                </div>
                <Truck className="w-8 h-8 text-amber-600 dark:text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 dark:text-orange-400">Total Value</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    ${approvedBids.reduce((s, b) => s + (Number(b.amount) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-500" />
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
