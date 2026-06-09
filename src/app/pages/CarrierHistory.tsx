import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useGetMyCarrierBidsQuery, useGetBrokerPublicInfoQuery, useGetMySubmittedLoadIdsQuery } from '../store/services/hauliusApi';
import { formatPhone } from '../utils/phone';
import type { CarrierBidWithLoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { US_STATES } from '../constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RateModal } from '../components/RateModal';
import { MapBackground } from '../components/MapBackground';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  TrendingUp,
  Building2,
  Phone,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  SlidersHorizontal,
  X,
} from 'lucide-react';


function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatusChip({ status }: { status: string }) {
  if (status === 'PENDING')
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 flex items-center gap-1"><Clock className="size-3" />Pending</span>;
  if (status === 'APPROVED')
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1"><CheckCircle className="size-3" />Approved</span>;
  if (status === 'REJECTED')
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{status}</span>;
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

const RATEABLE_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);

function BidCard({ bid }: { bid: CarrierBidWithLoadDto }) {
  const [expanded, setExpanded] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingSubmittedLocal, setRatingSubmittedLocal] = useState(false);
  const { data: brokerInfo } = useGetBrokerPublicInfoQuery(bid.brokerId ?? '', { skip: !bid.brokerId });
  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery();

  const brokerName = brokerInfo?.companyName || brokerInfo?.legalName || 'the broker';
  const vehicleTitle = [bid.vehicleYear, bid.vehicleMake, bid.vehicleModel].filter(Boolean).join(' ') || `Load #${bid.loadId.slice(0, 8)}`;
  const extraVehicles = bid.additionalVehicles ?? [];
  const vehicleCount = 1 + extraVehicles.length;
  const isMulti = vehicleCount > 1;
  const isApproved = bid.bidStatus === 'APPROVED';
  const canRateBroker = isApproved && !!bid.brokerId && RATEABLE_STATUSES.has(bid.loadStatus ?? '');
  const alreadyRated = ratingSubmittedLocal || (submittedLoadIds?.includes(bid.loadId) ?? false);

  const pickupLoc = [bid.pickupCity, bid.pickupState].filter(Boolean).join(', ');
  const dropLoc = [bid.dropCity, bid.dropState].filter(Boolean).join(', ');
  const pickupDate = fmtDate(bid.pickupDate);
  const deliveryDate = fmtDate(bid.deliveryDate);

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 bg-card hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden rounded-none">
      {/* ── Collapsed row ── */}
      <div className="p-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>

        {/* Desktop (sm+): single row */}
        <div className="hidden sm:flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-base font-semibold text-foreground">{isMulti ? 'Multi-Vehicle Load' : vehicleTitle}</span>
              {isMulti && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {vehicleCount} Vehicles
                </span>
              )}
              <StatusChip status={bid.bidStatus} />
            </div>
            {isMulti && (
              <p className="text-xs text-muted-foreground mb-1.5">
                {[vehicleTitle, ...extraVehicles.map(v => [v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' '))].slice(0, 2).join(' • ')}
                {vehicleCount > 3 ? ` • +${vehicleCount - 3} more` : ''}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{pickupLoc || '—'}</span>
                </div>
                {pickupDate && <p className="text-xs text-muted-foreground pl-4">{pickupDate}</p>}
              </div>
              {(pickupLoc || dropLoc) && <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{dropLoc || '—'}</span>
                </div>
                {deliveryDate && <p className="text-xs text-muted-foreground pl-4">{deliveryDate}</p>}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            {bid.price != null && (
              <div className="text-lg font-bold text-foreground leading-tight">${Number(bid.price).toLocaleString()}</div>
            )}
            <div className="text-xs text-muted-foreground whitespace-nowrap">Bid: ${Number(bid.amount).toLocaleString()}</div>
          </div>
          <div className="flex-shrink-0 p-1 self-start">
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Mobile (< sm): two rows */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Row 1: title + price + chevron */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-base font-semibold text-foreground">{isMulti ? 'Multi-Vehicle Load' : vehicleTitle}</span>
                {isMulti && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {vehicleCount} Vehicles
                  </span>
                )}
                <StatusChip status={bid.bidStatus} />
              </div>
              {isMulti && (
                <p className="text-xs text-muted-foreground">
                  {[vehicleTitle, ...extraVehicles.map(v => [v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' '))].slice(0, 2).join(' • ')}
                  {vehicleCount > 3 ? ` • +${vehicleCount - 3} more` : ''}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              {bid.price != null && (
                <div className="text-base font-bold text-foreground leading-tight">${Number(bid.price).toLocaleString()}</div>
              )}
              <div className="text-xs text-muted-foreground whitespace-nowrap">Bid: ${Number(bid.amount).toLocaleString()}</div>
            </div>
            <div className="flex-shrink-0 p-1 self-start">
              <ChevronDown className={`size-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {/* Row 2: full-width route */}
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-start gap-1">
                <MapPin className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-sm text-muted-foreground truncate block">{pickupLoc || '—'}</span>
                  {pickupDate && <span className="text-xs text-muted-foreground">{pickupDate}</span>}
                </div>
              </div>
            </div>
            <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>
            <div className="min-w-0 flex-1 overflow-hidden text-right">
              <div className="flex items-start gap-1 flex-row-reverse">
                <MapPin className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-sm text-muted-foreground truncate block">{dropLoc || '—'}</span>
                  {deliveryDate && <span className="text-xs text-muted-foreground">{deliveryDate}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div
          className="border-t border-border bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:via-amber-950/20 dark:to-orange-950/20"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
            {/* Bid details */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Bid Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InfoField label="Your Bid" value={`$${Number(bid.amount).toLocaleString()}`} />
                {bid.price != null && <InfoField label="Listed Price" value={`$${Number(bid.price).toLocaleString()}`} />}
                {bid.orderId && <InfoField label="Order ID" value={`#${bid.orderId}`} />}
                {bid.bidCreatedAt && <InfoField label="Bid Placed" value={fmtDate(bid.bidCreatedAt)} />}
                {bid.requestedPickupDate && <InfoField label="Req. Pickup" value={fmtDate(bid.requestedPickupDate)} />}
                {bid.requestedDropDate && <InfoField label="Req. Delivery" value={fmtDate(bid.requestedDropDate)} />}
              </div>
            </div>

            {/* Vehicles */}
            {isMulti && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Vehicles</p>
                <div className="space-y-2">
                  {[{ year: bid.vehicleYear, make: bid.vehicleMake, model: bid.vehicleModel }, ...extraVehicles.map(v => ({ year: v.vehicleYear, make: v.vehicleMake, model: v.vehicleModel }))].map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm text-foreground">{[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {bid.notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Notes</p>
                <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-md">
                  <MessageSquare className="size-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{bid.notes}</p>
                </div>
              </div>
            )}

            {/* Status banner */}
            {isApproved ? (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/40">
                <TrendingUp className="size-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Load assigned to you</span>
              </div>
            ) : bid.bidStatus === 'PENDING' ? (
              <div className="flex items-center gap-2 p-3 bg-muted border border-border">
                <Clock className="size-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Waiting for broker approval</span>
              </div>
            ) : null}

            {/* Broker contact */}
            {isApproved && bid.brokerId && brokerInfo && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Broker Contact</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(brokerInfo.companyName || brokerInfo.legalName) && (
                    <InfoField label="Company" value={brokerInfo.companyName || brokerInfo.legalName} />
                  )}
                  {brokerInfo.mcNumber && <InfoField label="MC #" value={brokerInfo.mcNumber} />}
                  {brokerInfo.phoneNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                      <a href={`tel:${brokerInfo.phoneNumber}`} className="text-sm font-semibold text-amber-600 hover:underline flex items-center gap-1">
                        <Phone className="size-3.5" />{formatPhone(brokerInfo.phoneNumber)}
                      </a>
                    </div>
                  )}
                  {brokerInfo.email && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <a href={`mailto:${brokerInfo.email}`} className="text-sm font-semibold text-amber-600 hover:underline truncate block">{brokerInfo.email}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Link to={`/load/${bid.loadId}`}>
                <Button variant="outline" size="sm" className="text-xs">View Load</Button>
              </Link>
              {isApproved && (
                <Button size="sm" variant="outline" asChild
                  className="gap-1.5 text-xs border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                  <Link to={`/carrier/dispatch/${bid.loadId}`} target="_blank" rel="noopener noreferrer">
                    <FileText className="size-3.5" />Dispatch Sheet
                  </Link>
                </Button>
              )}
              {canRateBroker && (
                alreadyRated ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <CheckCircle className="size-3.5" />Rating Submitted
                  </span>
                ) : (
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs" onClick={() => setRatingOpen(true)}>
                    <Star className="size-3.5 mr-1.5" />Rate Broker
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {canRateBroker && !alreadyRated && (
        <RateModal
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          onSubmitted={() => setRatingSubmittedLocal(true)}
          targetId={bid.brokerId!}
          targetType="broker"
          targetName={brokerName}
          loadId={bid.loadId}
          vehicleTitle={vehicleTitle}
        />
      )}
    </div>
  );
}

// Main component
export function CarrierHistory() {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  const { data: bids = [], isLoading, isError, refetch } = useGetMyCarrierBidsQuery(undefined, {
    skip: user?.role !== 'carrier',
  });

  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [dropState, setDropState] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');

  const activeFilterCount = [search, pickupState, dropState, orderIdFilter].filter(Boolean).length;
  const clearFilters = () => { setSearch(''); setPickupState(''); setDropState(''); setOrderIdFilter(''); };

  useEffect(() => { setPage(1); }, [activeTab, search, pickupState, dropState, orderIdFilter]);

  const COMPLETED_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);
  const pendingBids = bids.filter(b => b.bidStatus === 'PENDING');
  const approvedBids = bids.filter(b => b.bidStatus === 'APPROVED' && !COMPLETED_STATUSES.has(b.loadStatus ?? ''));
  const completedBids = bids.filter(b => b.bidStatus === 'APPROVED' && COMPLETED_STATUSES.has(b.loadStatus ?? ''));

  const tabBids = activeTab === 'approved' ? approvedBids : activeTab === 'pending' ? pendingBids : bids;

  const filteredBids = useMemo(() => {
    return tabBids.filter(b => {
      if (pickupState && (b.pickupState?.toUpperCase() ?? '') !== pickupState) return false;
      if (dropState && (b.dropState?.toUpperCase() ?? '') !== dropState) return false;
      if (orderIdFilter && !(b.orderId ?? '').toLowerCase().includes(orderIdFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        const vehicle = [b.vehicleYear, b.vehicleMake, b.vehicleModel].filter(Boolean).join(' ').toLowerCase();
        if (!vehicle.includes(q) && !(b.pickupCity ?? '').toLowerCase().includes(q) && !(b.dropCity ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tabBids, search, pickupState, dropState, orderIdFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBids.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedBids = filteredBids.slice((safePage - 1) * pageSize, safePage * pageSize);

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
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">My Load History</h1>
        {user?.email && <p className="text-muted-foreground mb-8">{user.email}</p>}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
          <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400">Completed</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{completedBids.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

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
              <span className="font-semibold text-amber-600">{filteredBids.length}</span>
              {' '}load{filteredBids.length !== 1 ? 's' : ''}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <X className="size-3" /> Clear filters
              </button>
            )}
          </div>
          {filtersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-xl border border-border/60 bg-card shadow-sm mb-3">
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
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                <Input placeholder="Order ID…" value={orderIdFilter} onChange={e => setOrderIdFilter(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All Loads ({bids.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedBids.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {bids.length === 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-semibold mb-1">No bid history yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start bidding on loads to build your history</p>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => navigate('/loads')}>Browse Available Loads</Button>
              </div>
            ) : (
              pagedBids.map(bid => <BidCard key={bid.bidId} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-2">
            {approvedBids.length === 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-semibold mb-1">No approved bids yet</p>
                <p className="text-sm text-muted-foreground">Approved bids will appear here</p>
              </div>
            ) : (
              pagedBids.map(bid => <BidCard key={bid.bidId} bid={bid} />)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-2">
            {pendingBids.length === 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-semibold mb-1">No pending bids</p>
                <p className="text-sm text-muted-foreground mb-4">Browse available loads and place bids</p>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => navigate('/loads')}>Browse Loads</Button>
              </div>
            ) : (
              pagedBids.map(bid => <BidCard key={bid.bidId} bid={bid} />)
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {filteredBids.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 pt-4 pb-2">
            {totalPages > 1 ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                          safePage === p
                            ? 'bg-amber-500 border-amber-500 text-white font-semibold'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : <div />}

            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              <span>Show</span>
              <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[5.5rem]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
