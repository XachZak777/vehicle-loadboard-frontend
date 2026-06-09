import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import {
  useGetMyCarrierBidsQuery,
  useGetPreferredLineLoadsQuery,
  useGetBrokerPublicInfoQuery,
  useUpdateBidMutation,
  useUpdateLoadStatusMutation,
  useGetMySubmittedLoadIdsQuery,
  useRejectAssignedLoadMutation,
} from '../store/services/hauliusApi';
import type { CarrierBidWithLoadDto, LoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { US_STATES } from '../constants';
import { RateModal } from '../components/RateModal';
import { CityMapModal } from '../components/CityMapModal';
import { MapBackground } from '../components/MapBackground';
import {
  MapPin, DollarSign, Clock, CheckCircle, Loader2, Package,
  Calendar, Building2, TrendingUp, Truck, FileText, Pencil,
  PackageCheck, PackageOpen, BadgeCheck, Star, Hash, XCircle,
  SlidersHorizontal, X, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { calcPricePerMile } from '../utils/phone';

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
    filter: b => b.bidStatus === 'PENDING' && (!b.loadStatus || b.loadStatus === 'OPEN'),
    emptyMsg: "You haven't requested any loads yet.",
    emptyIcon: <FileText className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />,
  },
  '/carrier/completed': {
    title: 'Completed Loads',
    description: 'Delivered loads and payment history',
    filter: b => b.bidStatus === 'APPROVED' && COMPLETED_STATUSES.has(b.loadStatus ?? ''),
    emptyMsg: "You don't have any completed loads yet.",
    emptyIcon: <CheckCircle className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />,
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
  ASSIGNED:  { label: 'Confirm Pickup',           next: 'PICKED_UP', icon: <PackageOpen className="size-3.5" /> },
  PICKED_UP: { label: 'Confirm Delivery',          next: 'DELIVERED', icon: <PackageCheck className="size-3.5" /> },
  DELIVERED: { label: 'Confirm Payment Received',  next: 'PAID',      icon: <BadgeCheck className="size-3.5" /> },
};

function BidCard({ bid }: { bid: CarrierBidWithLoadDto }) {
  const [updateBid, { isLoading: isUpdating }] = useUpdateBidMutation();
  const [updateLoadStatus, { isLoading: isStatusUpdating }] = useUpdateLoadStatusMutation();
  const [rejectAssignedLoad, { isLoading: isRejecting }] = useRejectAssignedLoadMutation();
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [cityMap, setCityMap] = useState<{ city: string; state: string; label: string } | null>(null);
  const [ratingSubmittedLocal, setRatingSubmittedLocal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editPickupDate, setEditPickupDate] = useState('');
  const [editPickupTime, setEditPickupTime] = useState('');
  const [editDropDate, setEditDropDate] = useState('');
  const [editDropTime, setEditDropTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery();
  const { data: brokerInfo } = useGetBrokerPublicInfoQuery(bid.brokerId ?? '', { skip: !bid.brokerId });
  const brokerName = brokerInfo?.companyName || brokerInfo?.legalName || 'the broker';

  const openEdit = () => {
    setEditAmount(String(bid.amount));
    setEditPickupDate(bid.requestedPickupDate ?? '');
    setEditPickupTime(bid.requestedPickupTime ?? '');
    setEditDropDate(bid.requestedDropDate ?? '');
    setEditDropTime(bid.requestedDropTime ?? '');
    setEditNotes(bid.notes ?? '');
    setShowEdit(true);
    setExpanded(true);
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
        notes: editNotes.trim() || undefined,
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

  const handleReject = async () => {
    try {
      await rejectAssignedLoad(bid.loadId).unwrap();
      toast.success('Assignment rejected — the load has been returned to the board.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject assignment.');
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

  const pickupLoc = [bid.pickupCity, bid.pickupState].filter(Boolean).join(', ');
  const dropLoc = [bid.dropCity, bid.dropState].filter(Boolean).join(', ');
  const pickupLocFull = [pickupLoc, bid.pickupZip].filter(Boolean).join(' ');
  const dropLocFull = [dropLoc, bid.dropZip].filter(Boolean).join(' ');
  const pickupDateStr = fmtDate(bid.pickupDate);
  const deliveryDateStr = fmtDate(bid.deliveryDate);

  const statusBadge = isApproved ? (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      Assigned
      {bid.loadStatus && bid.loadStatus !== 'ASSIGNED' && (
        <span className="ml-1 opacity-80">· {bid.loadStatus.replace('_', ' ')}</span>
      )}
    </span>
  ) : isPending ? (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      Pending
    </span>
  ) : bid.bidStatus === 'REJECTED' ? (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Rejected
    </span>
  ) : null;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 bg-card hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden rounded-none">
      <div className="p-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        {/* Broker row */}
        {bid.brokerId && (
          <div className="mb-3 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-md">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="size-3.5 flex-shrink-0" />
              <BrokerName brokerId={bid.brokerId} />
            </div>
          </div>
        )}

        {/* Desktop layout (sm+) */}
        <div className="hidden sm:flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              {bid.orderId && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Hash className="size-3" />
                  {bid.orderId}
                </span>
              )}
              <span className="text-base font-semibold text-foreground">{title}</span>
              {statusBadge}
            </div>
            {bid.additionalVehicles && bid.additionalVehicles.length > 0 && (
              <p className="text-xs text-muted-foreground mb-1">
                {bid.additionalVehicles.map(v => [v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ')).join(' • ')}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  {bid.pickupCity ? (
                    <button
                      onClick={e => { e.stopPropagation(); setCityMap({ city: bid.pickupCity!, state: bid.pickupState ?? '', label: `Pickup — ${pickupLoc}` }); }}
                      className="text-sm text-muted-foreground truncate hover:underline decoration-muted-foreground underline-offset-2 cursor-pointer text-left"
                    >
                      {pickupLocFull || '—'}
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                {pickupDateStr && <p className="text-xs text-muted-foreground pl-4">{pickupDateStr}</p>}
              </div>
              <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  {bid.dropCity ? (
                    <button
                      onClick={e => { e.stopPropagation(); setCityMap({ city: bid.dropCity!, state: bid.dropState ?? '', label: `Delivery — ${dropLoc}` }); }}
                      className="text-sm text-muted-foreground truncate hover:underline decoration-muted-foreground underline-offset-2 cursor-pointer text-left"
                    >
                      {dropLocFull || '—'}
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                {deliveryDateStr && <p className="text-xs text-muted-foreground pl-4">{deliveryDateStr}</p>}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            {isApproved ? (
              <div className="text-lg font-bold text-amber-600 leading-tight">
                ${Number(bid.amount ?? bid.price).toLocaleString()}
              </div>
            ) : (
              <>
                {bid.price != null && (
                  <div className="text-lg font-bold text-foreground leading-tight">
                    ${Number(bid.price).toLocaleString()}
                  </div>
                )}
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  Your bid: ${Number(bid.amount).toLocaleString()}
                </div>
              </>
            )}
          </div>
          <div className="flex-shrink-0 p-1 self-start">
            <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Mobile layout (< sm): two rows */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                {bid.orderId && (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                    <Hash className="size-3" />
                    {bid.orderId}
                  </span>
                )}
                <span className="text-base font-semibold text-foreground">{title}</span>
                {statusBadge}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              {isApproved ? (
                <div className="text-lg font-bold text-amber-600 leading-tight">
                  ${Number(bid.amount ?? bid.price).toLocaleString()}
                </div>
              ) : (
                <>
                  {bid.price != null && (
                    <div className="text-lg font-bold text-foreground leading-tight">
                      ${Number(bid.price).toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    Bid: ${Number(bid.amount).toLocaleString()}
                  </div>
                </>
              )}
            </div>
            <div className="flex-shrink-0 p-1 self-start">
              <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-start gap-1">
                <MapPin className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                {bid.pickupCity ? (
                  <button
                    onClick={e => { e.stopPropagation(); setCityMap({ city: bid.pickupCity!, state: bid.pickupState ?? '', label: `Pickup — ${pickupLoc}` }); }}
                    className="text-sm text-muted-foreground hover:underline underline-offset-2 cursor-pointer text-left min-w-0 overflow-hidden"
                  >
                    <span className="block truncate">{pickupLoc}</span>
                  </button>
                ) : <span className="text-sm text-muted-foreground">—</span>}
              </div>
              {pickupDateStr && <p className="text-xs text-muted-foreground pl-4">{pickupDateStr}</p>}
            </div>
            <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>
            <div className="min-w-0 flex-1 overflow-hidden text-right">
              <div className="flex items-start gap-1 flex-row-reverse">
                <MapPin className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                {bid.dropCity ? (
                  <button
                    onClick={e => { e.stopPropagation(); setCityMap({ city: bid.dropCity!, state: bid.dropState ?? '', label: `Delivery — ${dropLoc}` }); }}
                    className="text-sm text-muted-foreground hover:underline underline-offset-2 cursor-pointer text-right min-w-0 overflow-hidden"
                  >
                    <span className="block truncate">{dropLoc}</span>
                  </button>
                ) : <span className="text-sm text-muted-foreground">—</span>}
              </div>
              {deliveryDateStr && <p className="text-xs text-muted-foreground pr-4">{deliveryDateStr}</p>}
            </div>
          </div>
        </div>

        {cityMap && (
          <CityMapModal
            city={cityMap.city}
            state={cityMap.state}
            label={cityMap.label}
            onClose={() => setCityMap(null)}
          />
        )}
      </div>

      {/* Action bar — always visible, no expand needed */}
      {(nextStatusConfig || (isApproved && bid.loadStatus === 'ASSIGNED')) && (
        <div
          className="px-4 pb-3 flex items-center gap-2 flex-wrap"
          onClick={e => e.stopPropagation()}
        >
          {nextStatusConfig && (
            <Button
              size="sm"
              onClick={handleStatusUpdate}
              disabled={isStatusUpdating}
              className="h-7 text-xs px-3 bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
            >
              {isStatusUpdating ? <Loader2 className="size-3.5 animate-spin" /> : nextStatusConfig.icon}
              {isStatusUpdating ? 'Updating…' : nextStatusConfig.label}
            </Button>
          )}
          {isApproved && bid.loadStatus === 'ASSIGNED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={isRejecting}
              className="h-7 text-xs px-3 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 gap-1.5"
            >
              {isRejecting ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
              {isRejecting ? 'Rejecting…' : 'Reject Assignment'}
            </Button>
          )}
        </div>
      )}

      {expanded && (
        <div
          className="border-t border-border bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:via-amber-950/20 dark:to-orange-950/20 p-5 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Status progression removed — shown above in always-visible bar */}

          {/* Carrier's requested schedule */}
          {(bid.requestedPickupDate || bid.requestedPickupTime || bid.requestedDropDate || bid.requestedDropTime) && (
            <div className="p-3 bg-background/60 border border-border space-y-1 rounded">
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>
                Submitted:{' '}
                {new Date(bid.bidCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}

          {/* Edit form for pending bids */}
          {isPending && showEdit && (
            <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 rounded">
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
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Notes (optional)</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Any questions, special requests, or details for the broker…"
                  maxLength={500}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
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

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Link to={`/load/${bid.loadId}`}>
              <Button variant="outline" size="sm">View Load</Button>
            </Link>
            {isApproved && (
              <Button size="sm" variant="outline" asChild
                className="gap-1.5 border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                <Link to={`/carrier/dispatch/${bid.loadId}`} target="_blank" rel="noopener noreferrer">
                  <FileText className="size-3.5" />
                  Dispatch Sheet
                </Link>
              </Button>
            )}
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
        </div>
      )}
    </div>
  );
}

function PreferredLoadCard({ load }: { load: LoadDto }) {
  const ppmVal = calcPricePerMile(load.price, load.distance, load.additionalVehicles);
  const ppm = ppmVal != null ? ppmVal.toFixed(2) : null;
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

        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground truncate flex-1">
              {[load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ')}
            </span>
            {pickupDateStr && <span className="text-muted-foreground text-xs shrink-0">· {pickupDateStr}</span>}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground truncate flex-1">
              {[load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ')}
            </span>
            {deliveryDateStr && <span className="text-muted-foreground text-xs shrink-0">· {deliveryDateStr}</span>}
          </div>
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

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [dropState, setDropState] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');

  const showOrderIdFilter = ['/carrier/assigned', '/carrier/completed'].includes(location.pathname);

  const activeFilterCount = [search, pickupState, dropState, showOrderIdFilter ? orderIdFilter : ''].filter(Boolean).length;
  const clearFilters = () => { setSearch(''); setPickupState(''); setDropState(''); setOrderIdFilter(''); };

  const baseItems = isOffers
    ? (preferredLoads as any[])
    : (bids.filter(config.filter) as any[]);

  const displayItems = useMemo(() => {
    return baseItems.filter((item: any) => {
      if (pickupState && (item.pickupState?.toUpperCase() ?? '') !== pickupState) return false;
      if (dropState && (item.dropState?.toUpperCase() ?? '') !== dropState) return false;
      if (showOrderIdFilter && orderIdFilter && !(item.orderId ?? '').toLowerCase().includes(orderIdFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        const v = [item.vehicleYear, item.vehicleMake, item.vehicleModel].filter(Boolean).join(' ').toLowerCase();
        if (!v.includes(q) && !(item.pickupCity ?? '').toLowerCase().includes(q) && !(item.dropCity ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [baseItems, search, pickupState, dropState, orderIdFilter, showOrderIdFilter]);

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{config.title}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{config.description}</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="size-6 animate-spin text-amber-500" />
            <span className="text-muted-foreground">Loading…</span>
          </div>
        )}

        {!isLoading && baseItems.length === 0 && (
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              {config.emptyIcon}
              <h3 className="text-lg font-semibold mb-2">
                {config.title === 'Assigned Loads' ? 'No Assigned Loads' :
                 config.title === 'Requested Loads' ? 'No Requested Loads' : 'No Offers'}
              </h3>
              <p className="text-muted-foreground mb-4">{config.emptyMsg}</p>
              <Button onClick={() => navigate('/loads')} className="bg-amber-500 hover:bg-amber-600 text-white">
                Browse Load Board
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && baseItems.length > 0 && (
          <>
            {/* Filter toolbar */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-sm text-muted-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-amber-600">{displayItems.length}</span>
                  {' '}load{displayItems.length !== 1 ? 's' : ''}
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                    <X className="size-3" /> Clear filters
                  </button>
                )}
              </div>
              {filtersOpen && (
                <div className={`grid grid-cols-1 gap-2 p-3 rounded-xl border border-border/60 bg-card shadow-sm mb-3 ${showOrderIdFilter ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Search</p>
                    <Input placeholder="Vehicle, city…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pickup State</p>
                    <Select value={pickupState || '_all'} onValueChange={v => setPickupState(v === '_all' ? '' : v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Any state" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">Any state</SelectItem>
                        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Drop State</p>
                    <Select value={dropState || '_all'} onValueChange={v => setDropState(v === '_all' ? '' : v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Any state" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">Any state</SelectItem>
                        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {showOrderIdFilter && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                      <Input placeholder="Order ID…" value={orderIdFilter} onChange={e => setOrderIdFilter(e.target.value)} className="h-8 text-sm" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {displayItems.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-3">No loads match the current filters.</p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-0 ${isOffers ? 'md:grid-cols-2 gap-4' : ''}`}>
                {isOffers
                  ? (displayItems as LoadDto[]).map(load => <PreferredLoadCard key={load.id} load={load} />)
                  : (displayItems as CarrierBidWithLoadDto[]).map(bid => <BidCard key={bid.loadId} bid={bid} />)
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
