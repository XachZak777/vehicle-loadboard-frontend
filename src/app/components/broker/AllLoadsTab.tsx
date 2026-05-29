import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Building2, Calendar, Edit, Trash2, Users, Copy, SlidersHorizontal, X, Hash } from 'lucide-react';
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
        <LoadWithBidsLoader key={load.id} load={load} >
          {(loadWithBids) => (
            <Card className={`border-2 ${colors.borderDualMode} ${colors.accentHoverCard} transition-all duration-200`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    {load.orderId && (
                      <Link
                        to={`/load/${load.id}`}
                        className="inline-flex items-center gap-1 mb-1.5 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
                      >
                        <Hash className="size-3" />
                        {load.orderId}
                      </Link>
                    )}
                    <CardTitle className="text-lg">
                      {load.additionalVehicles && load.additionalVehicles.length > 0
                        ? `Multi-Vehicle Load (${1 + load.additionalVehicles.length})`
                        : [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')}
                    </CardTitle>
                    {load.additionalVehicles && load.additionalVehicles.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        <p className="text-sm text-foreground/80">
                          {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')}
                        </p>
                        {load.additionalVehicles.map((v, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {[v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ')}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}
                    </p>
                    {companyName && (
                      <div className={`flex items-center gap-1 mt-1.5 text-xs ${colors.accentTextStrong} font-medium`}>
                        <Building2 className="h-3 w-3" />
                        <span>{companyName}</span>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(load)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    {load.createdAt && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(load.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {load.price != null && (
                      <span className="font-semibold">${load.price.toLocaleString()}</span>
                    )}
                    <span className="text-muted-foreground">
                      {loadWithBids.bids.length} {loadWithBids.bids.length === 1 ? 'bid' : 'bids'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {load.status === 'OPEN' && (
                      <Button
                        variant="ghost" size="sm"
                        className={`h-8 w-8 p-0 ${colors.accentText}`}
                        onClick={() => setAssignLoad(load)}
                        disabled={actionLoading}
                        title="Assign Carrier"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${colors.accentText}`} asChild>
                      <Link to={`/broker/edit-load/${load.id}`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-8 w-8 p-0 ${colors.accentText}`}
                      onClick={() => navigate('/post-load', { state: { cloneFrom: load } })}
                      disabled={actionLoading}
                      title="Clone Load"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-8 w-8 p-0 ${colors.accentText}`}
                      onClick={() => onDeleteLoad(load)}
                      disabled={actionLoading}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
