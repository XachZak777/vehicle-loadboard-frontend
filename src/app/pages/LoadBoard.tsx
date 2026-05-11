import { useState, useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useGetLoadsQuery, usePlaceBidMutation, useGetBrokerPublicInfoQuery, type LoadDto } from '../store/services/hauliusApi';
import { useAppSelector } from '../store/hooks';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { MapPin, Loader2, Phone, ChevronDown, Star } from 'lucide-react';

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
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function BrokerHeaderInline({ brokerId }: { brokerId: string }) {
  const navigate = useNavigate();
  const { data } = useGetBrokerPublicInfoQuery(brokerId);
  const name = data?.companyName || data?.legalName || 'Unknown Company';

  return (
    <div
      className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/company/broker/${brokerId}`);
      }}
    >
      <span className="text-sm font-semibold text-amber-600 hover:underline">{name}</span>
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        View ratings
      </span>
    </div>
  );
}

export function LoadBoard() {
  const { data: loads = [], isLoading, isError, error, refetch } = useGetLoadsQuery();

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
        if ((load.trailerType ?? '').toLowerCase() !== trailerType.toLowerCase()) return false;
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
    <div className="min-h-screen bg-background">
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
            {/* Filters Sidebar */}
            <aside className="w-64 flex-shrink-0 space-y-5">
              <h2 className="text-lg font-bold text-amber-500">Filters</h2>

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
            </aside>

            {/* Load List */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-4">
                Showing <span className="font-semibold text-amber-600">{filteredLoads.length}</span> available load{filteredLoads.length !== 1 ? 's' : ''}
              </p>

              <div className="space-y-3">
                {filteredLoads.map(load => (
                  <LoadCard key={load.id} load={load} />
                ))}

                {filteredLoads.length === 0 && (
                  <div className="border rounded-lg p-12 text-center">
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

const LoadCard = memo(function LoadCard({ load }: { load: LoadDto }) {
  const user = useAppSelector(s => s.auth.user);
  const isCarrier = user?.role === 'carrier';
  const [placeBid, { isLoading: isBidding }] = usePlaceBidMutation();

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'vehicle'>('general');
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidPickupDate, setBidPickupDate] = useState('');
  const [bidDeliveryDate, setBidDeliveryDate] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidDetails, setBidDetails] = useState('');

  const pickupDateStr = formatDate(load.pickupDate);
  const deliveryDateStr = formatDate(load.deliveryDate);

  const conditionLabel = load.vehicleCondition
    ? (load.vehicleCondition.toLowerCase() === 'running' ? 'Running' : 'Non-Running')
    : null;
  const conditionColor = load.vehicleCondition?.toLowerCase() === 'running'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

  const vehicleTypeLabel = load.vehicleType
    ? load.vehicleType.charAt(0).toUpperCase() + load.vehicleType.slice(1)
    : null;

  const trailerLabel = load.trailerType
    ? load.trailerType.charAt(0).toUpperCase() + load.trailerType.slice(1)
    : null;

  const handleBidSubmit = async () => {
    const amount = parseFloat(bidAmount);
    if (!bidAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid price offer.');
      return;
    }
    try {
      await placeBid({ loadId: load.id, amount, bookNow: false }).unwrap();
      toast.success('Request submitted successfully!');
      setShowBidForm(false);
      setBidAmount(''); setBidPickupDate(''); setBidDeliveryDate(''); setBidDetails('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="border rounded-lg bg-card hover:shadow-md transition-shadow">
      {load.brokerId && <BrokerHeaderInline brokerId={load.brokerId} />}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    {[load.pickupCity, load.pickupState].filter(Boolean).join(', ') || '—'}
                  </div>
                  {pickupDateStr && (
                    <div className="text-xs text-muted-foreground">{pickupDateStr}</div>
                  )}
                </div>
              </div>
              <div className="text-muted-foreground text-lg">→</div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    {[load.dropCity, load.dropState].filter(Boolean).join(', ') || '—'}
                  </div>
                  {deliveryDateStr && (
                    <div className="text-xs text-muted-foreground">{deliveryDateStr}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="font-bold text-base mb-2">
              {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle Transport'}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {conditionLabel && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conditionColor}`}>
                  {conditionLabel}
                </span>
              )}
              {vehicleTypeLabel && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {vehicleTypeLabel}
                </span>
              )}
              {trailerLabel && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {trailerLabel}
                </span>
              )}
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
            {load.price != null && (
              <div className="text-xl font-bold text-amber-600">
                ${load.price.toLocaleString()}
              </div>
            )}
            {load.price != null && load.distance != null && load.distance > 0 && (
              <div className="text-xs text-muted-foreground">
                ${(load.price / load.distance).toFixed(2)}/mi · {load.distance.toLocaleString()} mi
              </div>
            )}
            {load.contactPhone && (
              <a href={`tel:${load.contactPhone}`}
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                onClick={e => e.stopPropagation()}>
                <Phone className="size-3" />
                {load.contactPhone}
              </a>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Link to={`/load/${load.id}`}>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3">
                  View
                </Button>
              </Link>
              <button onClick={() => setExpanded(v => !v)}
                className="p-1 rounded hover:bg-muted transition-colors">
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border">
            {/* Tabs */}
            <div className="flex gap-1 mb-3 border-b border-border">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                  activeTab === 'general'
                    ? 'bg-amber-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                General Information
              </button>
              <button
                onClick={() => setActiveTab('vehicle')}
                className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                  activeTab === 'vehicle'
                    ? 'bg-amber-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Vehicle Information
              </button>
            </div>

            {activeTab === 'general' && (
              <div className="space-y-2 text-sm text-muted-foreground">
                {load.orderId && <p><span className="font-medium text-foreground">Order ID:</span> {load.orderId}</p>}
                {load.pickupStreet && <p><span className="font-medium text-foreground">Pickup address:</span> {load.pickupStreet}</p>}
                {load.dropStreet && <p><span className="font-medium text-foreground">Delivery address:</span> {load.dropStreet}</p>}
                {load.contactName && <p><span className="font-medium text-foreground">Contact:</span> {load.contactName}</p>}
                {load.contactEmail && <p><span className="font-medium text-foreground">Email:</span> {load.contactEmail}</p>}
                {load.paymentMethod && <p><span className="font-medium text-foreground">Payment:</span> {load.paymentMethod} {load.paymentTiming ? `(${load.paymentTiming})` : ''}</p>}
                {load.description && <p><span className="font-medium text-foreground">Additional Notes:</span> {load.description}</p>}

                {isCarrier && !showBidForm && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => setShowBidForm(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                    >
                      Request This Load
                    </Button>
                  </div>
                )}

                {isCarrier && showBidForm && (
                  <div className="mt-3 p-3 rounded-lg border border-border bg-muted/30 space-y-3">
                    <p className="text-xs font-semibold text-foreground">Submit Request</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Pickup Date</label>
                        <Input
                          type="date"
                          value={bidPickupDate}
                          onChange={e => setBidPickupDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Delivery Date</label>
                        <Input
                          type="date"
                          value={bidDeliveryDate}
                          onChange={e => setBidDeliveryDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Price Offer ($) *</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        className="h-8 text-xs"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Additional Details</label>
                      <textarea
                        value={bidDetails}
                        onChange={e => setBidDetails(e.target.value)}
                        placeholder="Any additional notes..."
                        rows={2}
                        className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleBidSubmit}
                        disabled={isBidding}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                      >
                        {isBidding ? 'Submitting…' : 'Submit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setShowBidForm(false); setBidAmount(''); setBidPickupDate(''); setBidDeliveryDate(''); setBidDetails(''); }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vehicle' && (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold text-foreground">
                      {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {vehicleTypeLabel && (
                        <span className="text-xs text-muted-foreground">{vehicleTypeLabel}</span>
                      )}
                      {conditionLabel && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conditionColor}`}>
                          {conditionLabel}
                        </span>
                      )}
                      {trailerLabel && (
                        <span className="text-xs text-muted-foreground">· {trailerLabel}</span>
                      )}
                    </div>
                    {load.vehicleVin && (
                      <p className="text-xs text-muted-foreground">VIN: {load.vehicleVin}</p>
                    )}
                    {load.vehicleAdditionalInfo && (
                      <p className="text-xs text-muted-foreground">{load.vehicleAdditionalInfo}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
)
