import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Truck, MapPin, X, Star, CheckCircle, Eye, Hash, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CarrierInfoInline } from './CarrierInfoInline';
import { RateModal } from '../RateModal';
import { useGetCarrierPublicInfoQuery, useGetMySubmittedLoadIdsQuery, useGetBidsForLoadQuery } from '../../store/services/hauliusApi';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { US_STATES } from '../../constants';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';
import { colors } from '../../styles/colors';
import { MessageSquare } from 'lucide-react';

const RATEABLE_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);

function AssignedLoadCard({
  load,
  getStatusBadge,
  onCancelBooking,
  actionLoading,
}: {
  load: LoadDto;
  getStatusBadge: (load: LoadDto) => ReactNode;
  onCancelBooking: (load: LoadDto) => void;
  actionLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingSubmittedLocal, setRatingSubmittedLocal] = useState(false);
  const { data: carrierInfo } = useGetCarrierPublicInfoQuery(load.assignedCarrierId ?? '', {
    skip: !load.assignedCarrierId,
  });
  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery();
  const { data: bids = [] } = useGetBidsForLoadQuery(load.id);
  const approvedBid = bids.find(b => b.status === 'APPROVED');
  const alreadyRated = ratingSubmittedLocal || (submittedLoadIds?.includes(load.id) ?? false);
  const canRate = !!load.assignedCarrierId && RATEABLE_STATUSES.has(load.status ?? '');
  const carrierName = carrierInfo?.companyName || carrierInfo?.legalName || 'the carrier';
  const isMulti = load.additionalVehicles && load.additionalVehicles.length > 0;
  const vehicleTitle = isMulti
    ? `Multi-Vehicle Load (${1 + load.additionalVehicles!.length})`
    : [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || `Load #${load.id.slice(0, 8)}`;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 bg-card hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden rounded-none">
      {/* Clickable header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Carrier info row */}
        <div className="mb-3 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-md flex items-center gap-2">
          <Truck className="size-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {load.assignedCarrierId ? carrierName : 'No carrier assigned'}
          </span>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex items-start gap-3">
          {/* Left: orderId + title + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {load.orderId && (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Hash className="size-3" />
                  {load.orderId}
                </span>
              )}
              <span className="text-base font-semibold truncate">{vehicleTitle}</span>
              {getStatusBadge(load)}
            </div>
            {isMulti && (
              <div className="mb-1 space-y-0.5">
                <p className="text-sm text-foreground/80">
                  {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')}
                </p>
                {load.additionalVehicles!.map((v, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {[v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ')}
                  </p>
                ))}
              </div>
            )}
            {/* Route */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
              <MapPin className="size-3.5 flex-shrink-0" />
              <span>{load.pickupCity}, {load.pickupState}</span>
              <span className="text-amber-500 font-bold">→</span>
              <MapPin className="size-3.5 flex-shrink-0" />
              <span>{load.dropCity}, {load.dropState}</span>
            </div>
          </div>

          {/* Right: price */}
          <div className="flex-shrink-0 text-right">
            {load.price != null && (
              <p className="text-lg font-bold text-amber-600">${load.price.toLocaleString()}</p>
            )}
          </div>

          {/* Chevron */}
          <div className="flex-shrink-0 flex items-center self-center">
            <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Row 1: title + orderId + status + price + chevron */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                {load.orderId && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Hash className="size-3" />
                    {load.orderId}
                  </span>
                )}
                {getStatusBadge(load)}
              </div>
              <span className="text-sm font-semibold">{vehicleTitle}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {load.price != null && (
                <span className="text-base font-bold text-amber-600">${load.price.toLocaleString()}</span>
              )}
              <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {/* Row 2: route */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <MapPin className="size-3 flex-shrink-0" />
            <span>{load.pickupCity}, {load.pickupState}</span>
            <span className="text-amber-500 font-bold">→</span>
            <MapPin className="size-3 flex-shrink-0" />
            <span>{load.dropCity}, {load.dropState}</span>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-border bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:via-amber-950/20 dark:to-orange-950/20 p-4 space-y-3">
          {load.assignedCarrierId && (
            <div className="p-2.5 bg-background/60 border border-border rounded">
              <CarrierInfoInline carrierId={load.assignedCarrierId} />
            </div>
          )}
          {approvedBid?.notes && (
            <div className="flex items-start gap-2 p-2.5 bg-muted/50 border border-border rounded">
              <MessageSquare className="size-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Carrier Notes</p>
                <p className="text-xs text-foreground leading-relaxed">{approvedBid.notes}</p>
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
            <Link to={`/load/${load.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="size-3.5" />
                View Load
              </Button>
            </Link>
            {(load.status === 'ASSIGNED' || load.status === 'PICKED_UP') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancelBooking(load)}
                disabled={actionLoading}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Booking
              </Button>
            )}
            {canRate && (
              alreadyRated ? (
                <span className={`flex items-center gap-1.5 text-sm font-medium ${colors.accentTextStrong}`}>
                  <CheckCircle className="size-4" />
                  Rating Submitted
                </span>
              ) : (
                <Button
                  size="sm"
                  className={colors.accentBtn}
                  onClick={() => setRatingOpen(true)}
                >
                  <Star className="size-3.5 mr-1.5" />
                  Rate Carrier
                </Button>
              )
            )}
          </div>
        </div>
      )}

      {canRate && !alreadyRated && (
        <RateModal
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          onSubmitted={() => setRatingSubmittedLocal(true)}
          targetId={load.assignedCarrierId!}
          targetType="carrier"
          targetName={carrierName}
          loadId={load.id}
          vehicleTitle={vehicleTitle}
        />
      )}
    </div>
  );
}

interface Props {
  assignedLoads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onCancelBooking: (load: LoadDto) => void;
  actionLoading: boolean;
}

export function AssignedLoadsTab({ assignedLoads, getStatusBadge, onCancelBooking, actionLoading }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [dropState, setDropState] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');

  const activeFilterCount = [search, pickupState, dropState, orderIdFilter].filter(Boolean).length;
  const clearFilters = () => { setSearch(''); setPickupState(''); setDropState(''); setOrderIdFilter(''); };

  const filtered = useMemo(() => {
    return assignedLoads.filter(load => {
      if (pickupState && load.pickupState?.toUpperCase() !== pickupState) return false;
      if (dropState && load.dropState?.toUpperCase() !== dropState) return false;
      if (orderIdFilter && !(load.orderId ?? '').toLowerCase().includes(orderIdFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        const v = [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ').toLowerCase();
        if (!v.includes(q) && !(load.pickupCity ?? '').toLowerCase().includes(q) && !(load.dropCity ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [assignedLoads, search, pickupState, dropState, orderIdFilter]);

  if (assignedLoads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No assigned loads yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
            <span className="font-semibold text-amber-600">{filtered.length}</span>
            {' '}load{filtered.length !== 1 ? 's' : ''}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
              <X className="size-3" /> Clear filters
            </button>
          )}
        </div>
        {filtersOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-xl border border-border/60 bg-card shadow-sm">
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

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-3">No loads match the current filters.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
          </CardContent>
        </Card>
      ) : (
        filtered.map(load => (
          <AssignedLoadCard
            key={load.id}
            load={load}
            getStatusBadge={getStatusBadge}
            onCancelBooking={onCancelBooking}
            actionLoading={actionLoading}
          />
        ))
      )}
    </>
  );
}
