import { useLocation, Link } from 'react-router';
import { useGetMyCarrierBidsQuery } from '../store/services/hauliusApi';
import type { CarrierBidWithLoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, DollarSign, Clock, CheckCircle, Loader2, Tag } from 'lucide-react';

type PageConfig = {
  title: string;
  description: string;
  filter: (bid: CarrierBidWithLoadDto) => boolean;
  icon: React.ReactNode;
  emptyMsg: string;
};

const PAGE_CONFIGS: Record<string, PageConfig> = {
  '/carrier/assigned': {
    title: 'Assigned Loads',
    description: 'Loads where your bid has been approved.',
    filter: b => b.bidStatus === 'APPROVED',
    icon: <CheckCircle className="size-5 text-green-600" />,
    emptyMsg: 'No assigned loads yet. Approved bids will appear here.',
  },
  '/carrier/requested': {
    title: 'Requested Loads',
    description: 'Loads where your bid is pending broker review.',
    filter: b => b.bidStatus === 'PENDING',
    icon: <Clock className="size-5 text-amber-500" />,
    emptyMsg: 'No pending requests. Submit bids from the Load Board to see them here.',
  },
  '/carrier/offers': {
    title: 'Offers',
    description: 'All your bids across all loads.',
    filter: () => true,
    icon: <Tag className="size-5 text-blue-500" />,
    emptyMsg: 'No offers submitted yet. Browse the Load Board to get started.',
  },
};

function statusBadge(status: string) {
  if (status === 'APPROVED') return <Badge className="bg-green-600 text-white text-xs">Approved</Badge>;
  if (status === 'PENDING')  return <Badge variant="secondary" className="text-xs">Pending</Badge>;
  if (status === 'REJECTED') return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
  return <Badge variant="outline" className="text-xs">{status}</Badge>;
}

function BidCard({ bid }: { bid: CarrierBidWithLoadDto }) {
  const title = [bid.vehicleYear, bid.vehicleMake, bid.vehicleModel].filter(Boolean).join(' ') || `Load #${bid.loadId.slice(0, 8)}`;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {(bid.pickupCity || bid.dropCity) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="size-3 flex-shrink-0" />
                <span>
                  {[bid.pickupCity, bid.pickupState].filter(Boolean).join(', ')}
                  {' → '}
                  {[bid.dropCity, bid.dropState].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
          {statusBadge(bid.bidStatus)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 font-semibold text-green-700 dark:text-green-400">
            <DollarSign className="size-3.5" />
            {Number(bid.amount).toLocaleString()}
          </div>
          {bid.bidCreatedAt && (
            <span className="text-xs text-muted-foreground">
              Submitted {new Date(bid.bidCreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          <Link
            to={`/load/${bid.loadId}`}
            className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            View Load →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function CarrierLoadsPage() {
  const location = useLocation();
  const config = PAGE_CONFIGS[location.pathname] ?? PAGE_CONFIGS['/carrier/offers'];
  const { data: bids = [], isLoading } = useGetMyCarrierBidsQuery();

  const filtered = bids.filter(config.filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          {config.icon}
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="size-5 animate-spin text-amber-500" />
            <span className="text-muted-foreground">Loading…</span>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 border rounded-lg">
            <p className="text-muted-foreground">{config.emptyMsg}</p>
            <Link
              to="/loads"
              className="mt-4 inline-block text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Browse Load Board →
            </Link>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(bid => <BidCard key={bid.bidId} bid={bid} />)}
          </div>
        )}
      </div>
    </div>
  );
}
