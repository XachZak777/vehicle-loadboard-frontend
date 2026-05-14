import { useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  useGetLoadsQuery, usePlaceBidMutation, useUpdateBidMutation,
  useGetBrokerPublicInfoQuery, useGetMyCarrierBidsQuery, useGetMyCarrierProfileQuery,
  type LoadDto, type CarrierBidWithLoadDto,
} from '../store/services/hauliusApi';
import { useAppSelector } from '../store/hooks';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { MapPin, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { formatPhone } from '../utils/phone';

const VEHICLE_TYPES = ['All Types', 'Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'RV', 'Boat', 'ATV'];
const TRAILER_TYPES = ['All Types', 'Open Trailer', 'Enclosed Trailer'];
const CONDITIONS = ['All Conditions', 'Running', 'Non-Running'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Post Date (Newest)' },
  { value: 'oldest', label: 'Post Date (Oldest)' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'ppm-desc', label: '$/Mile: High to Low' },
  { value: 'ppm-asc', label: '$/Mile: Low to High' },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPaymentLabel(value: string) {
  return value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function BrokerSummaryRow({ brokerId }: { brokerId: string }) {
  const navigate = useNavigate();
  const { data } = useGetBrokerPublicInfoQuery(brokerId);
  const name = data?.companyName || data?.legalName || 'Unknown Company';
  const rating = data?.ratingScore;

  return (
    <div
      className="flex items-center justify-between cursor-pointer"
      onClick={(e) => { e.stopPropagation(); navigate(`/company/broker/${brokerId}`); }}
    >
      <span className="text-sm font-semibold text-amber-600 hover:underline">{name}</span>
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {rating != null ? `${Math.round(rating)}%` : 'N/A'}
      </span>
    </div>
  );
}

function BrokerNameField({ brokerId }: { brokerId: string }) {
  const { data } = useGetBrokerPublicInfoQuery(brokerId);
  return <InfoField label="Company" value={data?.companyName || data?.legalName || '—'} />;
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ConditionIcon({ condition }: { condition: string }) {
  const isRunning = condition.toLowerCase() === 'running';
  return isRunning ? (
    <span className="inline-flex size-4 rounded-full items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
      <CheckCircle className="size-3" />
    </span>
  ) : (
    <span className="inline-flex size-4 rounded-full items-center justify-center bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      <AlertCircle className="size-3" />
    </span>
  );
}

export function LoadBoard() {
  const { data: loads = [], isLoading, isError, error, refetch } = useGetLoadsQuery();
  const user = useAppSelector(s => s.auth.user);
  const isCarrier = user?.role === 'carrier';
  const { data: myCarrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });
  const { data: myCarrierBids = [] } = useGetMyCarrierBidsQuery(undefined, { skip: !isCarrier });
  const myCarrierId = myCarrierProfile?.id;

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupRadius, setPickupRadius] = useState('50');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('50');
  const [vehicleType, setVehicleType] = useState('All Types');
  const [trailerType, setTrailerType] = useState('All Types');
  const [condition, setCondition] = useState('All Conditions');
  const [minPrice, setMinPrice] = useState('');
  const [minPricePerMile, setMinPricePerMile] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const clearFilters = () => {
    setSearchTerm('');
    setPickupLocation('');
    setPickupRadius('50');
    setDeliveryLocation('');
    setDeliveryRadius('50');
    setVehicleType('All Types');
    setTrailerType('All Types');
    setCondition('All Conditions');
    setMinPrice('');
    setMinPricePerMile('');
    setSortBy('newest');
  };

  const filteredLoads = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let result = loads.filter(load => {
      const isOpen = !load.status || load.status === 'OPEN';
      if (!isOpen) return false;

      if (q) {
        const matchesSearch =
          (load.vehicleMake ?? '').toLowerCase().includes(q) ||
          (load.vehicleModel ?? '').toLowerCase().includes(q) ||
          (load.pickupCity ?? '').toLowerCase().includes(q) ||
          (load.dropCity ?? '').toLowerCase().includes(q) ||
          (load.pickupState ?? '').toLowerCase().includes(q) ||
          (load.dropState ?? '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (pickupLocation) {
        const pl = pickupLocation.toLowerCase();
        const matchPickup =
          (load.pickupCity ?? '').toLowerCase().includes(pl) ||
          (load.pickupState ?? '').toLowerCase().includes(pl) ||
          (load.pickupZip ?? '').toLowerCase().includes(pl);
        if (!matchPickup) return false;
      }

      if (deliveryLocation) {
        const dl = deliveryLocation.toLowerCase();
        const matchDelivery =
          (load.dropCity ?? '').toLowerCase().includes(dl) ||
          (load.dropState ?? '').toLowerCase().includes(dl) ||
          (load.dropZip ?? '').toLowerCase().includes(dl);
        if (!matchDelivery) return false;
      }

      if (vehicleType !== 'All Types') {
        if ((load.vehicleType ?? '').toLowerCase() !== vehicleType.toLowerCase()) return false;
      }

      if (trailerType !== 'All Types') {
        const trailerMap: Record<string, string> = { 'Open Trailer': 'open', 'Enclosed Trailer': 'enclosed' };
        const expected = trailerMap[trailerType];
        if (expected && (load.trailerType ?? '').toLowerCase() !== expected) return false;
      }

      if (condition !== 'All Conditions') {
        const cond = condition === 'Running' ? 'running' : 'non-running';
        if ((load.vehicleCondition ?? '').toLowerCase() !== cond) return false;
      }

      if (minPrice && load.price != null) {
        if (load.price < parseFloat(minPrice)) return false;
      }

      if (minPricePerMile && load.price != null && load.distance != null && load.distance > 0) {
        const ppm = load.price / load.distance;
        if (ppm < parseFloat(minPricePerMile)) return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      if (sortBy === 'oldest') return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      if (sortBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'ppm-desc' || sortBy === 'ppm-asc') {
        const ppmA = a.price != null && a.distance != null && a.distance > 0 ? a.price / a.distance : null;
        const ppmB = b.price != null && b.distance != null && b.distance > 0 ? b.price / b.distance : null;
        if (ppmA == null && ppmB == null) return 0;
        if (ppmA == null) return 1;
        if (ppmB == null) return -1;
        return sortBy === 'ppm-desc' ? ppmB - ppmA : ppmA - ppmB;
      }
      return 0;
    });

    return result;
  }, [loads, searchTerm, pickupLocation, deliveryLocation, vehicleType, trailerType, condition, minPrice, minPricePerMile, sortBy]);

  const fetchError = isError ? ((error as any)?.message || 'Failed to load data.') : '';

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="size-6 animate-spin text-amber-500" />
            <span className="text-muted-foreground">Loading loads…</span>
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="mb-6 p-6 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-destructive font-medium">{fetchError}</p>
            <Button onClick={() => refetch()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">Retry</Button>
          </div>
        )}

        {!isLoading && !fetchError && (
          <div className="flex gap-6">
            {/* Filters Sidebar — clips the inner panel as it slides in */}
            <aside
              className="flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out border-r border-r-amber-200 dark:border-r-amber-900"
              style={{ width: filtersOpen ? 272 : 0 }}
            >
              {/* Inner panel slides in from the left inside the clipping container */}
              <div
                className="w-[272px] pr-4 transition-transform duration-300 ease-out"
                style={{ transform: filtersOpen ? 'translateX(0)' : 'translateX(-100%)' }}
              >
                <h2 className="text-lg font-bold text-amber-500 mb-4">Filters</h2>

                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Search</label>
                    <Input placeholder="Make, model, city..." value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)} className="h-9" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Pickup Location</label>
                    <Input placeholder="City, State, or Zip" value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)} className="h-9" />
                    <div className="space-y-0.5">
                      <label className="text-xs text-muted-foreground">Radius (miles)</label>
                      <Input value={pickupRadius} onChange={e => setPickupRadius(e.target.value)} className="h-9" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Delivery Location</label>
                    <Input placeholder="City, State, or Zip" value={deliveryLocation}
                      onChange={e => setDeliveryLocation(e.target.value)} className="h-9" />
                    <div className="space-y-0.5">
                      <label className="text-xs text-muted-foreground">Radius (miles)</label>
                      <Input value={deliveryRadius} onChange={e => setDeliveryRadius(e.target.value)} className="h-9" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Vehicle Type</label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Trailer Type</label>
                    <Select value={trailerType} onValueChange={setTrailerType}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAILER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Condition</label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Min Price ($)</label>
                    <Input type="number" placeholder="0" value={minPrice}
                      onChange={e => setMinPrice(e.target.value)} className="h-9" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Min Price Per Mile ($)</label>
                    <Input type="number" placeholder="0.00" step="0.01" value={minPricePerMile}
                      onChange={e => setMinPricePerMile(e.target.value)} className="h-9" />
                  </div>

                  <Button variant="outline" onClick={clearFilters}
                    className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </aside>

            {/* Load List */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  title={filtersOpen ? 'Hide filters' : 'Show filters'}
                  className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
                >
                  {filtersOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-amber-600">{filteredLoads.length}</span> available load{filteredLoads.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-3">
                {filteredLoads.map(load => (
                  <LoadCard
                    key={load.id}
                    load={load}
                    myCarrierId={myCarrierId}
                    existingBid={myCarrierBids.find(b => b.loadId === load.id)}
                  />
                ))}

                {filteredLoads.length === 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">No loads found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to find available loads.
                    </p>
                    <Button onClick={clearFilters} className="bg-amber-500 hover:bg-amber-600 text-white">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LoadCard = memo(function LoadCard({
  load, myCarrierId, existingBid,
}: {
  load: LoadDto;
  myCarrierId?: string;
  existingBid?: CarrierBidWithLoadDto;
}) {
  const user = useAppSelector(s => s.auth.user);
  const isCarrier = user?.role === 'carrier';
  const [placeBid, { isLoading: isBidding }] = usePlaceBidMutation();
  const [updateBid, { isLoading: isUpdating }] = useUpdateBidMutation();

  const isAssigned = !!myCarrierId && load.assignedCarrierId === myCarrierId;
  const hasPendingBid = existingBid?.bidStatus === 'PENDING';

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'vehicle'>('general');
  const [showBidForm, setShowBidForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [requestedPickupDate, setRequestedPickupDate] = useState('');
  const [requestedPickupTime, setRequestedPickupTime] = useState('');
  const [requestedDropDate, setRequestedDropDate] = useState('');
  const [requestedDropTime, setRequestedDropTime] = useState('');

  const pickupDateStr = formatDate(load.pickupDate);
  const deliveryDateStr = formatDate(load.deliveryDate);
  const vehicleCount = 1 + (load.additionalVehicles?.length ?? 0);
  const isMulti = vehicleCount > 1;
  const ppm = load.price != null && load.distance != null && load.distance > 0
    ? load.price / load.distance : null;

  const vehicleTitle = isMulti
    ? 'Multi-Vehicle Load'
    : [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle';

  const vehicleListText = (() => {
    if (!isMulti) return null;
    const names = [
      [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' '),
      ...(load.additionalVehicles ?? []).map(v =>
        [v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ')
      ),
    ].filter(Boolean);
    if (names.length <= 2) return names.join(' • ');
    return `${names.slice(0, 2).join(' • ')} • +${names.length - 2} more`;
  })();

  const allConditions = [
    load.vehicleCondition,
    ...(load.additionalVehicles ?? []).map(v => v.vehicleCondition),
  ].filter((c): c is string => !!c);

  const pickupLoc = [load.pickupCity, load.pickupState].filter(Boolean).join(', ');
  const dropLoc = [load.dropCity, load.dropState].filter(Boolean).join(', ');
  // Zip is only returned by backend when carrier is assigned; filter(Boolean) handles null
  const pickupLocFull = [pickupLoc, load.pickupZip].filter(Boolean).join(' ');
  const dropLocFull = [dropLoc, load.dropZip].filter(Boolean).join(' ');

  const openBidForm = (editMode: boolean) => {
    setIsEditMode(editMode);
    if (editMode && existingBid) {
      setBidAmount(String(existingBid.amount));
      setRequestedPickupDate(existingBid.requestedPickupDate ?? '');
      setRequestedPickupTime(existingBid.requestedPickupTime ?? '');
      setRequestedDropDate(existingBid.requestedDropDate ?? '');
      setRequestedDropTime(existingBid.requestedDropTime ?? '');
    } else {
      setBidAmount('');
      setRequestedPickupDate(load.pickupDate ?? '');
      setRequestedPickupTime('');
      setRequestedDropDate(load.deliveryDate ?? '');
      setRequestedDropTime('');
    }
    setShowBidForm(true);
  };

  const closeBidForm = () => {
    setShowBidForm(false);
    setBidAmount('');
    setRequestedPickupDate('');
    setRequestedPickupTime('');
    setRequestedDropDate('');
    setRequestedDropTime('');
  };

  const handleBidSubmit = async () => {
    const amount = parseFloat(bidAmount);
    if (!bidAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid price offer.');
      return;
    }
    try {
      if (isEditMode && existingBid) {
        await updateBid({
          bidId: existingBid.bidId,
          amount,
          requestedPickupDate: requestedPickupDate || undefined,
          requestedPickupTime: requestedPickupTime || undefined,
          requestedDropDate: requestedDropDate || undefined,
          requestedDropTime: requestedDropTime || undefined,
        }).unwrap();
        toast.success('Bid updated!');
      } else {
        await placeBid({
          loadId: load.id, amount, bookNow: false,
          requestedPickupDate: requestedPickupDate || undefined,
          requestedPickupTime: requestedPickupTime || undefined,
          requestedDropDate: requestedDropDate || undefined,
          requestedDropTime: requestedDropTime || undefined,
        }).unwrap();
        toast.success('Request submitted!');
      }
      closeBidForm();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 bg-card hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden rounded-none">
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Broker row — only visible when expanded */}
        {expanded && load.brokerId && (
          <div className="mb-3 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
            <BrokerSummaryRow brokerId={load.brokerId} />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Vehicle title + badges + condition icons */}
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-base font-semibold text-foreground">{vehicleTitle}</span>
              {isMulti && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {vehicleCount} Vehicles
                </span>
              )}
              {allConditions.map((c, i) => <ConditionIcon key={i} condition={c} />)}
            </div>

            {/* Vehicle list (multi only) */}
            {isMulti && vehicleListText && (
              <p className="text-xs text-muted-foreground mb-1.5">{vehicleListText}</p>
            )}

            {/* Route */}
            <div className="flex items-start gap-2 mt-1">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {(expanded ? pickupLocFull : pickupLoc) || '—'}
                  </span>
                </div>
                {pickupDateStr && <p className="text-xs text-muted-foreground pl-4">{pickupDateStr}</p>}
              </div>
              <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {(expanded ? dropLocFull : dropLoc) || '—'}
                  </span>
                </div>
                {deliveryDateStr && <p className="text-xs text-muted-foreground pl-4">{deliveryDateStr}</p>}
              </div>
            </div>
          </div>

          {/* Price block */}
          <div className="flex-shrink-0 text-right">
            {load.price != null && (
              <div className="text-lg font-bold text-amber-600 leading-tight">
                ${load.price.toLocaleString()}
              </div>
            )}
            {ppm != null && load.distance != null && (
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {load.distance.toLocaleString()} mi • ${ppm.toFixed(2)}/mi
              </div>
            )}
          </div>

          {/* Chevron */}
          <div className="flex-shrink-0 p-1 self-start">
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="border-t border-border bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:via-amber-950/20 dark:to-orange-950/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {(['general', 'vehicle'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-foreground border-b-2 border-amber-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'general' ? 'General Information' : 'Vehicle Information'}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <div className="p-5 space-y-6">
              {/* BROKER CONTACT */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Broker Contact</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {load.brokerId && <BrokerNameField brokerId={load.brokerId} />}
                  <InfoField label="Phone" value={load.contactPhone ? formatPhone(load.contactPhone) : undefined} />
                  <InfoField label="Email" value={load.contactEmail} />
                  <InfoField label="Order ID" value={load.orderId ? `#${load.orderId}` : undefined} />
                </div>
              </div>

              {/* PAYMENT DETAILS */}
              {(load.paymentMethod || load.paymentTiming) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Payment Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Method" value={load.paymentMethod ? formatPaymentLabel(load.paymentMethod) : undefined} />
                    <InfoField label="Timing" value={load.paymentTiming ? formatPaymentLabel(load.paymentTiming) : undefined} />
                  </div>
                </div>
              )}

              {/* ADDITIONAL NOTES */}
              {load.description && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Additional Notes</p>
                  <p className="text-sm text-foreground">{load.description}</p>
                </div>
              )}

              {isCarrier && !showBidForm && !hasPendingBid && (
                <Button size="sm" onClick={() => openBidForm(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                  Request This Load
                </Button>
              )}

              {isCarrier && !showBidForm && hasPendingBid && (
                <Button size="sm" variant="outline" onClick={() => openBidForm(true)}
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-xs">
                  Edit My Bid
                </Button>
              )}

              {isCarrier && showBidForm && (
                <div className="p-3 border border-border bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-foreground">
                    {isEditMode ? 'Edit Your Bid' : 'Submit Request'}
                  </p>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Price Offer ($) *</label>
                    <Input type="number" placeholder="0.00" value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      className="h-8 text-xs" min="0" step="0.01" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Pickup Date</label>
                      <Input type="date" value={requestedPickupDate}
                        onChange={e => setRequestedPickupDate(e.target.value)}
                        className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Pickup Time</label>
                      <Input type="time" value={requestedPickupTime}
                        onChange={e => setRequestedPickupTime(e.target.value)}
                        className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Drop Date</label>
                      <Input type="date" value={requestedDropDate}
                        onChange={e => setRequestedDropDate(e.target.value)}
                        className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Drop Time</label>
                      <Input type="time" value={requestedDropTime}
                        onChange={e => setRequestedDropTime(e.target.value)}
                        className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleBidSubmit} disabled={isBidding || isUpdating}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                      {(isBidding || isUpdating) ? 'Saving…' : isEditMode ? 'Update Bid' : 'Submit'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={closeBidForm} className="text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div className="p-5 space-y-3">
              <VehicleRow
                index={1}
                year={load.vehicleYear}
                make={load.vehicleMake}
                model={load.vehicleModel}
                type={load.vehicleType}
                condition={load.vehicleCondition}
                vin={isAssigned ? load.vin : undefined}
              />
              {load.additionalVehicles?.map((v, i) => (
                <VehicleRow
                  key={i}
                  index={i + 2}
                  year={v.vehicleYear}
                  make={v.vehicleMake}
                  model={v.vehicleModel}
                  type={v.vehicleType}
                  condition={v.vehicleCondition}
                  vin={isAssigned ? v.vin : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
)

function VehicleRow({ index, year, make, model, type, condition, vin }: {
  index: number;
  year?: number;
  make?: string;
  model?: string;
  type?: string;
  condition?: string;
  vin?: string;
}) {
  const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : null;
  const isRunning = condition?.toLowerCase() === 'running';
  const condLabel = condition ? (isRunning ? 'Running' : 'Non-Running') : null;
  const condColor = isRunning
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
        {index}
      </div>
      <div className="text-sm space-y-1">
        <p className="font-semibold text-foreground">
          {[year, make, model].filter(Boolean).join(' ') || 'Vehicle'}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {typeLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {typeLabel}
            </span>
          )}
          {condLabel && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${condColor}`}>
              {condLabel}
            </span>
          )}
          {vin && (
            <span className="text-xs text-muted-foreground font-mono">VIN: {vin}</span>
          )}
        </div>
      </div>
    </div>
  );
}
