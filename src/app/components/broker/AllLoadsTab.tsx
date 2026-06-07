import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Building2, Calendar, Edit, Trash2, Users, Copy, SlidersHorizontal, X, Hash, MapPin, ChevronDown } from 'lucide-react';
import { LoadWithBidsLoader } from './LoadWithBidsLoader';
import { AssignCarrierModal } from './AssignCarrierModal';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';
import { colors } from '../../styles/colors';
import { useAppSelector } from '../../store/hooks';
import { useGetMyBrokerProfileQuery } from '../../store/services/hauliusApi';
import { US_STATES } from '../../constants';

interface Props {
  loads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onDeleteLoad: (load: LoadDto) => void;
  actionLoading: boolean;
}

interface BrokerLoadCardProps {
  load: LoadDto;
  bids: unknown[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onDeleteLoad: (load: LoadDto) => void;
  actionLoading: boolean;
  navigate: ReturnType<typeof useNavigate>;
  onAssign: (load: LoadDto) => void;
  companyName: string | undefined;
}

function BrokerLoadCard({
  load,
  bids,
  getStatusBadge,
  onDeleteLoad,
  actionLoading,
  navigate,
  onAssign,
  companyName,
}: BrokerLoadCardProps) {
  const [expanded, setExpanded] = useState(false);

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
        {/* Company name row */}
        {companyName && (
          <div className="mb-3 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-md flex items-center gap-2">
            <Building2 className="size-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground font-medium truncate">{companyName}</span>
          </div>
        )}

        {/* Desktop layout */}
        <div className="hidden sm:flex items-start gap-3">
          {/* Left: id + title + status + route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {load.orderId && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                  onClick={e => e.stopPropagation()}
                >
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
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
              <MapPin className="size-3.5 flex-shrink-0" />
              <span>{load.pickupCity}, {load.pickupState}</span>
              <span className="text-amber-500 font-bold">→</span>
              <MapPin className="size-3.5 flex-shrink-0" />
              <span>{load.dropCity}, {load.dropState}</span>
            </div>
          </div>

          {/* Right: price + bid count */}
          <div className="flex-shrink-0 text-right">
            {load.price != null && (
              <p className="text-lg font-bold">${load.price.toLocaleString()}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {bids.length} bid{bids.length !== 1 ? 's' : ''}
            </p>
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
                <span className="text-base font-bold">${load.price.toLocaleString()}</span>
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
          {load.createdAt && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5 flex-shrink-0" />
              <span>
                Posted{' '}
                {new Date(load.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
          {/* Actions */}
          <div className="flex items-center gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
            {load.status === 'OPEN' && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${colors.accentText}`}
                onClick={() => onAssign(load)}
                disabled={actionLoading}
                title="Assign Carrier"
              >
                <Users className="size-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${colors.accentText}`} asChild>
              <Link to={`/broker/edit-load/${load.id}`}>
                <Edit className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${colors.accentText}`}
              onClick={() => navigate('/post-load', { state: { cloneFrom: load } })}
              disabled={actionLoading}
              title="Clone Load"
            >
              <Copy className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${colors.accentText}`}
              onClick={() => onDeleteLoad(load)}
              disabled={actionLoading}
              title="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AllLoadsTab({ loads, getStatusBadge, onDeleteLoad, actionLoading }: Props) {
  const [assignLoad, setAssignLoad] = useState<LoadDto | null>(null);
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isBroker = user?.role === 'broker';
  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const companyName = brokerProfile?.legalName || brokerProfile?.companyName || user?.companyName;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [dropState, setDropState] = useState('');
  const [status, setStatus] = useState('');

  const clearFilters = () => {
    setOrderId('');
    setPickupState('');
    setDropState('');
    setStatus('');
  };

  const activeFilterCount = [orderId, pickupState, dropState, status].filter(Boolean).length;

  const filtered = useMemo(() => {
    return loads.filter(load => {
      if (orderId && !(load.orderId ?? '').toLowerCase().includes(orderId.toLowerCase())) return false;
      if (pickupState && load.pickupState?.toUpperCase() !== pickupState) return false;
      if (dropState && load.dropState?.toUpperCase() !== dropState) return false;
      if (status && load.status !== status) return false;
      return true;
    });
  }, [loads, orderId, pickupState, dropState, status]);

  if (loads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">You haven't posted any loads yet</p>
          <Button asChild>
            <Link to="/post-load">Post Your First Load</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <span className="font-semibold text-amber-600">{filtered.length}</span> load{filtered.length !== 1 ? 's' : ''}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
            >
              <X className="size-3" /> Clear filters
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl border border-border/60 bg-card shadow-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <Input
                placeholder="Search order…"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pickup State</p>
              <Select value={pickupState || '_all'} onValueChange={v => setPickupState(v === '_all' ? '' : v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any state</SelectItem>
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Drop State</p>
              <Select value={dropState || '_all'} onValueChange={v => setDropState(v === '_all' ? '' : v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any state</SelectItem>
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select value={status || '_all'} onValueChange={v => setStatus(v === '_all' ? '' : v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 && loads.length > 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-3">No loads match the current filters.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
          </CardContent>
        </Card>
      )}

      {filtered.map(load => (
        <LoadWithBidsLoader key={load.id} load={load}>
          {(loadWithBids) => (
            <BrokerLoadCard
              load={load}
              bids={loadWithBids.bids}
              getStatusBadge={getStatusBadge}
              onDeleteLoad={onDeleteLoad}
              actionLoading={actionLoading}
              navigate={navigate}
              onAssign={setAssignLoad}
              companyName={companyName}
            />
          )}
        </LoadWithBidsLoader>
      ))}

      {assignLoad && (
        <AssignCarrierModal
          load={assignLoad}
          open={!!assignLoad}
          onClose={() => setAssignLoad(null)}
        />
      )}
    </>
  );
}
