import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import {
  useGetMyCarrierBidsQuery,
  useGetPreferredLineLoadsQuery,
  useGetBrokerPublicInfoQuery,
  useUpdateBidMutation,
  useUpdateLoadStatusMutation,
  useGetMySubmittedLoadIdsQuery,
} from '../store/services/hauliusApi';
import type { CarrierBidWithLoadDto, LoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RateModal } from '../components/RateModal';
import { MapBackground } from '../components/MapBackground';
import {
  MapPin, DollarSign, Clock, CheckCircle, Loader2, Package,
  ArrowRight, Calendar, Building2, TrendingUp, Truck, FileText, Pencil,
  PackageCheck, PackageOpen, BadgeCheck, Star,
} from 'lucide-react';
import { toast } from 'sonner';

type PageConfig = {
  title: string;
  description: string;
  filter: (bid: CarrierBidWithLoadDto) => boolean;
  emptyMsg: string;
  emptyIcon: React.ReactNode;
};

const PAGE_CONFIGS: Record<string, PageConfig> = {
  '/carrier/assigned': {
    title: 'Assigned Loads',
    description: 'Loads where your bid has been approved',
    filter: b => b.bidStatus === 'APPROVED' && !COMPLETED_STATUSES.has(b.loadStatus ?? ''),
    emptyMsg: "You don't have any assigned loads at the moment.",
    emptyIcon: <Truck className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />,
  },
  '/carrier/requested': {
    title: 'Requested Loads',
    description: 'View and manage your load requests',
    filter: b => b.bidStatus === 'PENDING',
    emptyMsg: "You haven't requested any loads yet.",
    emptyIcon: <FileText className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />,
  },
  '/carrier/offers': {
    title: 'Offers',
    description: 'Open loads matching your preferred lanes',
    filter: () => true,
    emptyMsg: 'No loads match your preferred lanes right now. Check back later or update your lanes in My Company.',
    emptyIcon: <Package className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />,
  },
};

function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function BrokerName({ brokerId }: { brokerId: string }) {
  const { data } = useGetBrokerPublicInfoQuery(brokerId);
  return <span>{data?.companyName || data?.legalName || '—'}</span>;
}

const RATEABLE_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);
const COMPLETED_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);

const STATUS_NEXT: Record<string, { label: string; next: string; icon: React.ReactNode }> = {
  ASSIGNED:  { label: 'Confirm Pickup',           next: 'PICKED_UP', icon: <PackageOpen className="size-4" /> },
  PICKED_UP: { label: 'Confirm Delivery',          next: 'DELIVERED', icon: <PackageCheck className="size-4" /> },
  DELIVERED: { label: 'Confirm Payment Received',  next: 'PAID',      icon: <BadgeCheck className="size-4" /> },
};

function BidCard({ bid }: { bid: CarrierBidWithLoadDto }) {
  const [updateBid, { isLoading: isUpdating }] = useUpdateBidMutation();
  const [updateLoadStatus, { isLoading: isStatusUpdating }] = useUpdateLoadStatusMutation();
  const [showEdit, setShowEdit] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingSubmittedLocal, setRatingSubmittedLocal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editPickupDate, setEditPickupDate] = useState('');
  const [editPickupTime, setEditPickupTime] = useState('');
  const [editDropDate, setEditDropDate] = useState('');
  const [editDropTime, setEditDropTime] = useState('');
  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery();
  const { data: brokerInfo } = useGetBrokerPublicInfoQuery(bid.brokerId ?? '', { skip: !bid.brokerId });
  const brokerName = brokerInfo?.companyName || brokerInfo?.legalName || 'the broker';

  const openEdit = () => {
    setEditAmount(String(bid.amount));
    setEditPickupDate(bid.requestedPickupDate ?? '');
    setEditPickupTime(bid.requestedPickupTime ?? '');
    setEditDropDate(bid.requestedDropDate ?? '');
    setEditDropTime(bid.requestedDropTime ?? '');
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    const amount = parseFloat(editAmount);
    if (!editAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    try {
      await updateBid({
        bidId: bid.bidId,
        amount,
        requestedPickupDate: editPickupDate || undefined,
        requestedPickupTime: editPickupTime || undefined,
        requestedDropDate: editDropDate || undefined,
        requestedDropTime: editDropTime || undefined,
      }).unwrap();
      toast.success('Bid updated!');
      setShowEdit(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update bid.');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const updated = await updateLoadStatus(bid.loadId).unwrap();
      const labels: Record<string, string> = {
        PICKED_UP: 'Pickup confirmed — broker has been notified.',
        DELIVERED: 'Delivery confirmed — broker has been notified.',
        PAID: 'Payment confirmed — broker has been notified.',
      };
      toast.success(labels[updated.status ?? ''] ?? 'Status updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status.');
    }
  };

  const title =
    [bid.vehicleYear, bid.vehicleMake, bid.vehicleModel].filter(Boolean).join(' ') ||
    `Load #${bid.loadId.slice(0, 8)}`;
  const isApproved = bid.bidStatus === 'APPROVED';
  const isPending = bid.bidStatus === 'PENDING';
  const nextStatusConfig = isApproved && bid.loadStatus ? STATUS_NEXT[bid.loadStatus] : null;
  const canRateBroker = isApproved && !!bid.brokerId && RATEABLE_STATUSES.has(bid.loadStatus ?? '');
  const alreadyRated = ratingSubmittedLocal || (submittedLoadIds?.includes(bid.loadId) ?? false);

  const cardClass = isApproved
    ? 'border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer'
    : isPending
    ? 'border-[3px] border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 transition-all'
    : 'border-2 border-gray-200 dark:border-gray-700 opacity-80';

  const hasRoute = bid.pickupCity || bid.dropCity;

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
          {isApproved && <Badge className="bg-amber-500 text-white shrink-0">Approved</Badge>}
          {isPending && <Badge className="bg-amber-500 border-2 border-amber-600 text-white shrink-0">Pending</Badge>}
          {bid.bidStatus === 'REJECTED' && <Badge variant="destructive" className="shrink-0">Rejected</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route panel */}
        {hasRoute && (
          isApproved ? (
            /* Amber gradient route for approved — AssignedLoads design */
            (() => {
              const pickupQ = [bid.pickupCity, bid.pickupState].filter(Boolean).join(', ');
              const dropQ = [bid.dropCity, bid.dropState].filter(Boolean).join(', ');
              const pickupUrl = pickupQ ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupQ + ', USA')}` : null;
              const dropUrl = dropQ ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropQ + ', USA')}` : null;
              return (
                <div className="p-4 bg-gradient-to-r from-amber-50/40 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-5 text-amber-600 dark:text-amber-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-amber-700 dark:text-amber-400">Pickup</div>
                          {pickupUrl ? (
                            <a href={pickupUrl} target="_blank" rel="noopener noreferrer"
                              className="font-semibold text-gray-900 dark:text-gray-100 hover:underline hover:text-amber-600 transition-colors">
                              {pickupQ}
                            </a>
                          ) : (
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{pickupQ}</div>
                          )}
                          {bid.pickupDate && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="size-3 text-amber-600" />
                              {fmtDate(bid.pickupDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="size-6 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-5 text-amber-600 dark:text-amber-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-amber-700 dark:text-amber-400">Delivery</div>
                          {dropUrl ? (
                            <a href={dropUrl} target="_blank" rel="noopener noreferrer"
                              className="font-semibold text-gray-900 dark:text-gray-100 hover:underline hover:text-amber-600 transition-colors">
                              {dropQ}
                            </a>
                          ) : (
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{dropQ}</div>
                          )}
                          {bid.deliveryDate && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="size-3 text-amber-600" />
                              {fmtDate(bid.deliveryDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* Gray route for pending/rejected — RequestedLoads design */
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {[bid.pickupCity, bid.pickupState].filter(Boolean).join(', ')}
                  </span>
                  {bid.pickupDate && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="size-3 text-amber-600" />
                      {fmtDate(bid.pickupDate)}
                    </span>
                  )}
                </div>
                <ArrowRight className="size-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mx-1" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {[bid.dropCity, bid.dropState].filter(Boolean).join(', ')}
                  </span>
                  {bid.deliveryDate && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="size-3 text-amber-600" />
                      {fmtDate(bid.deliveryDate)}
                    </span>
                  )}
                </div>
                <MapPin className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              </div>
            </div>
          )
        )}

        {/* Price row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bid.price != null && (
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Load Price:</span>
              <span className="font-bold text-lg text-amber-600 dark:text-amber-500">
                ${Number(bid.price).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Your Bid:</span>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              ${Number(bid.amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Broker */}
        {bid.brokerId && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="size-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Broker:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              <BrokerName brokerId={bid.brokerId} />
            </span>
          </div>
        )}

        {/* Assigned / status banner */}
        {isApproved && (
          <div className="flex items-center justify-between gap-2 p-3 bg-amber-500/10 dark:bg-amber-500/10 border-2 border-amber-500/40 dark:border-amber-500/40">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Load assigned to you
                {bid.loadStatus && bid.loadStatus !== 'ASSIGNED' && (
                  <span className="ml-2 text-xs font-normal opacity-80">· {bid.loadStatus.replace('_', ' ')}</span>
                )}
              </span>
            </div>
            {bid.loadStatus === 'PAID' && (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Complete</span>
            )}
          </div>
        )}

        {/* Carrier's requested schedule */}
        {(bid.requestedPickupDate || bid.requestedPickupTime || bid.requestedDropDate || bid.requestedDropTime) && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your Requested Schedule</p>
            {(bid.requestedPickupDate || bid.requestedPickupTime) && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-3.5 text-amber-500" />
                <span className="text-muted-foreground">Pickup:</span>
                <span className="font-medium">
                  {bid.requestedPickupDate
                    ? new Date(bid.requestedPickupDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                  {bid.requestedPickupTime ? ` at ${bid.requestedPickupTime}` : ''}
                </span>
              </div>
            )}
            {(bid.requestedDropDate || bid.requestedDropTime) && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-3.5 text-amber-500" />
                <span className="text-muted-foreground">Drop:</span>
                <span className="font-medium">
                  {bid.requestedDropDate
                    ? new Date(bid.requestedDropDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                  {bid.requestedDropTime ? ` at ${bid.requestedDropTime}` : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submitted date */}
        {bid.bidCreatedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="size-4" />
            <span>
              Submitted:{' '}
              {new Date(bid.bidCreatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Edit form for pending bids */}
        {isPending && showEdit && (
          <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
            <p className="text-xs font-semibold text-foreground">Edit Your Bid</p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Price Offer ($) *</label>
              <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                className="h-8 text-xs" min="0" step="0.01" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pickup Date</label>
                <Input type="date" value={editPickupDate} onChange={e => setEditPickupDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pickup Time</label>
                <Input type="time" value={editPickupTime} onChange={e => setEditPickupTime(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Drop Date</label>
                <Input type="date" value={editDropDate} onChange={e => setEditDropDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Drop Time</label>
                <Input type="time" value={editDropTime} onChange={e => setEditDropTime(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate} disabled={isUpdating}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                {isUpdating ? 'Saving…' : 'Update Bid'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowEdit(false)} className="text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Status progression (assigned loads only) */}
        {nextStatusConfig && (
          <div className="pt-3 border-t border-border">
            <Button
              size="sm"
              onClick={handleStatusUpdate}
              disabled={isStatusUpdating}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              {isStatusUpdating
                ? <Loader2 className="size-4 animate-spin" />
                : nextStatusConfig.icon}
              {isStatusUpdating ? 'Updating…' : nextStatusConfig.label}
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
          <Link to={`/load/${bid.loadId}`}>
            <Button variant="outline" size="sm">
              View Load
            </Button>
          </Link>
          {isPending && !showEdit && (
            <Button size="sm" variant="outline" onClick={openEdit}
              className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
              <Pencil className="size-3.5 mr-1" />
              Edit Bid
            </Button>
          )}
          {canRateBroker && (
            alreadyRated ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <CheckCircle className="size-4" />
                Rating Submitted
              </span>
            ) : (
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                onClick={() => setRatingOpen(true)}>
                <Star className="size-3.5" />
                Rate Broker
              </Button>
            )
          )}
          {isApproved && (
            <Button size="sm" variant="outline" asChild
              className="gap-1.5 border-border text-muted-foreground hover:text-foreground ml-auto">
              <Link to={`/carrier/dispatch/${bid.bidId}`} target="_blank" rel="noopener noreferrer">
                <FileText className="size-3.5" />
                Dispatch Sheet
              </Link>
            </Button>
          )}
        </div>

        {canRateBroker && !alreadyRated && (
          <RateModal
            open={ratingOpen}
            onClose={() => setRatingOpen(false)}
            onSubmitted={() => setRatingSubmittedLocal(true)}
            targetId={bid.brokerId!}
            targetType="broker"
            targetName={brokerName}
            loadId={bid.loadId}
            vehicleTitle={title}
          />
        )}
      </CardContent>
    </Card>
  );
}

function PreferredLoadCard({ load }: { load: LoadDto }) {
  const ppm = load.price != null && load.distance != null && load.distance > 0
    ? (load.price / load.distance).toFixed(2) : null;
  const vehicleTitle = [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle';
  const pickupDateStr = load.pickupDate
    ? new Date(load.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  const deliveryDateStr = load.deliveryDate
    ? new Date(load.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <Card className="border border-border hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-lg text-foreground leading-tight">{vehicleTitle}</p>
          {load.price != null && (
            <span className="font-bold text-amber-600 dark:text-amber-500 text-lg shrink-0">
              ${Number(load.price).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground">
            {[load.pickupCity, load.pickupState].filter(Boolean).join(', ')}
          </span>
          {pickupDateStr && <span className="text-muted-foreground text-xs">· {pickupDateStr}</span>}
          <ArrowRight className="size-4 text-muted-foreground shrink-0 mx-0.5" />
          <span className="font-medium text-foreground">
            {[load.dropCity, load.dropState].filter(Boolean).join(', ')}
          </span>
          {deliveryDateStr && <span className="text-muted-foreground text-xs">· {deliveryDateStr}</span>}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {load.distance != null && (
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              {Number(load.distance).toLocaleString()} mi
            </span>
          )}
          {ppm && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3.5" />
              {ppm}/mi
            </span>
          )}
          {load.vehicleType && (
            <span className="flex items-center gap-1">
              <Truck className="size-3.5" />
              {load.vehicleType}
            </span>
          )}
        </div>

        <div className="pt-1">
          <Link to={`/load/${load.id}`}>
            <Button size="sm" variant="outline">View Load</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function CarrierLoadsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOffers = location.pathname === '/carrier/offers';
  const config = PAGE_CONFIGS[location.pathname] ?? PAGE_CONFIGS['/carrier/offers'];

  const { data: bids = [], isLoading: bidsLoading } = useGetMyCarrierBidsQuery(undefined, { skip: isOffers });
  const { data: preferredLoads = [], isLoading: loadsLoading } = useGetPreferredLineLoadsQuery(undefined, { skip: !isOffers });
  const isLoading = isOffers ? loadsLoading : bidsLoading;
  const filtered = isOffers ? preferredLoads : bids.filter(config.filter);

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{config.title}</h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="size-6 animate-spin text-amber-500" />
            <span className="text-muted-foreground">Loading…</span>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              {config.emptyIcon}
              <h3 className="text-lg font-semibold mb-2">
                {config.title === 'Assigned Loads' ? 'No Assigned Loads' :
                 config.title === 'Requested Loads' ? 'No Requested Loads' : 'No Offers'}
              </h3>
              <p className="text-muted-foreground mb-4">{config.emptyMsg}</p>
              <Button
                onClick={() => navigate('/loads')}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Browse Load Board
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid gap-4">
            {isOffers
              ? (filtered as LoadDto[]).map(load => <PreferredLoadCard key={load.id} load={load} />)
              : (filtered as CarrierBidWithLoadDto[]).map(bid => <BidCard key={bid.bidId} bid={bid} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
