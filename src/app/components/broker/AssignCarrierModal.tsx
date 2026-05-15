import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import {
  Search, MapPin, ArrowRight, Loader2, Truck, ShieldCheck,
  Star, CheckCircle, AlertCircle, Users,
} from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import {
  useLazySearchCarriersQuery,
  useDirectAssignCarrierMutation,
} from '../../store/services/hauliusApi';
import type { LoadDto, CarrierPublicInfo } from '../../store/services/hauliusApi';
import { formatPhone } from '../../utils/phone';

interface Props {
  load: LoadDto;
  open: boolean;
  onClose: () => void;
}

function CarrierResultCard({
  carrier,
  onSelect,
}: {
  carrier: CarrierPublicInfo;
  onSelect: (carrier: CarrierPublicInfo) => void;
}) {
  const name = carrier.companyName || carrier.legalName || carrier.dbaName || 'Unknown Carrier';
  const location = [carrier.phyCity, carrier.phyState].filter(Boolean).join(', ');
  const isActive = carrier.operatingStatus?.toLowerCase().includes('authorized') ||
                   carrier.operatingStatus?.toLowerCase().includes('active');

  return (
    <div className="p-4 border border-border rounded-lg hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-foreground truncate">{name}</span>
            {carrier.operatingStatus && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <ShieldCheck className="size-3" />
                {carrier.operatingStatus}
              </span>
            )}
          </div>

          {/* DOT / MC */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            {carrier.dotNumber && <span>DOT: <span className="font-mono text-foreground">{carrier.dotNumber}</span></span>}
            {carrier.mcNumber && <span>MC: <span className="font-mono text-foreground">{carrier.mcNumber}</span></span>}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-amber-500" />
                {location}
              </span>
            )}
            {carrier.totalPowerUnits != null && (
              <span className="flex items-center gap-1">
                <Truck className="size-3 text-amber-500" />
                {carrier.totalPowerUnits} unit{carrier.totalPowerUnits !== 1 ? 's' : ''}
              </span>
            )}
            {carrier.safetyRating && (
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-amber-500" />
                Safety: {carrier.safetyRating}
              </span>
            )}
            {carrier.ratingScore != null && (
              <span className="flex items-center gap-1">
                <Star className="size-3 text-amber-500" />
                {carrier.ratingScore}% positive
              </span>
            )}
            {carrier.phoneNumber && (
              <span>{formatPhone(carrier.phoneNumber)}</span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onSelect(carrier)}
          className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 gap-1.5"
        >
          <CheckCircle className="size-3.5" />
          Select
        </Button>
      </div>
    </div>
  );
}

export function AssignCarrierModal({ load, open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CarrierPublicInfo | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [consent, setConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [triggerSearch, { data: results = [], isFetching, isUninitialized }] = useLazySearchCarriersQuery();
  const [directAssign] = useDirectAssignCarrierMutation();

  const vehicleTitle = [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')
    || `Load #${load.id.slice(0, 8)}`;

  const handleSearch = () => {
    const q = query.trim();
    if (q.length < 2) return;
    triggerSearch(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleConfirmAssign = async () => {
    if (!selected?.id) return;
    setAssigning(true);
    try {
      await directAssign({ loadId: load.id, carrierId: selected.id }).unwrap();
      toast.success('Carrier assigned successfully');
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setSelected(null);
    setConsent(false);
    onClose();
  };

  const carrierName = selected
    ? (selected.companyName || selected.legalName || selected.dbaName || 'Selected Carrier')
    : '';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !assigning) handleClose(); }}>
      <DialogContent className="max-w-[calc(100vw-24px)] sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-amber-500" />
            Assign Carrier
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Search registered carriers and assign directly to{' '}
            <span className="font-semibold text-foreground">{vehicleTitle}</span>
          </p>
        </DialogHeader>

        {!selected ? (
          <>
            {/* Search input */}
            <div className="px-6 pt-4 pb-3 flex-shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Company name, DOT number, or MC number…"
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={query.trim().length < 2 || isFetching}
                  className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 gap-1.5"
                >
                  {isFetching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  Search
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Enter at least 2 characters, then press Search or Enter</p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {isFetching && (
                <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-sm">Searching carriers…</span>
                </div>
              )}

              {!isFetching && !isUninitialized && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <AlertCircle className="size-8 mb-2 opacity-40" />
                  <p className="text-sm font-medium">No carriers found</p>
                  <p className="text-xs mt-1">Try a different name, DOT or MC number</p>
                </div>
              )}

              {!isFetching && isUninitialized && (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <Search className="size-8 mb-2 opacity-30" />
                  <p className="text-sm">Search to find registered carriers</p>
                </div>
              )}

              {!isFetching && results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {results.length} carrier{results.length !== 1 ? 's' : ''} found
                  </p>
                  {results.map((carrier, i) => (
                    <CarrierResultCard
                      key={carrier.id ?? carrier.dotNumber ?? i}
                      carrier={carrier}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Confirmation step */
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Load */}
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Load</p>
              <p className="font-semibold text-sm">{vehicleTitle}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="size-3.5 flex-shrink-0" />
                <span>{load.pickupCity}, {load.pickupState}</span>
                <ArrowRight className="size-3.5" />
                <span>{load.dropCity}, {load.dropState}</span>
              </div>
              {load.price != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Listed at <span className="font-semibold text-foreground">${load.price.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Carrier being assigned */}
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-800/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Assigning Carrier</p>
              <p className="font-semibold text-sm">{carrierName}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5">
                {selected.dotNumber && <span>DOT: <span className="font-mono">{selected.dotNumber}</span></span>}
                {selected.mcNumber && <span>MC: <span className="font-mono">{selected.mcNumber}</span></span>}
                {[selected.phyCity, selected.phyState].filter(Boolean).length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {[selected.phyCity, selected.phyState].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
              {selected.operatingStatus && (
                <p className="text-xs mt-1 text-muted-foreground">Status: <span className="font-medium text-foreground">{selected.operatingStatus}</span></p>
              )}
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground">
              This carrier will be directly assigned to the load. Any pending bids from other carriers will be automatically declined.
            </p>

            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="assignConsent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(!!v)}
                  className="mt-0.5 shrink-0"
                />
                <label htmlFor="assignConsent" className="text-xs leading-relaxed cursor-pointer select-none text-muted-foreground">
                  I acknowledge and agree that once the carrier has accepted my request, I will be entered into a legal contract with the carrier for the transport of my vehicle(s). I further acknowledge and agree that Haulius is not a party to such contract, and has no obligation or liability whatsoever arising out of such contract. I consent to Haulius adding a provision to this effect in my dispatch sheets. I also understand that any changes that I make to the dispatch sheet after the carrier has accepted my request, unless the carrier has approved the change, may not be binding on the carrier.
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0 gap-2 sm:gap-2">
          {selected ? (
            <>
              <Button variant="outline" onClick={() => { setSelected(null); setConsent(false); }} disabled={assigning}>
                ← Back to Search
              </Button>
              <Button
                onClick={handleConfirmAssign}
                disabled={assigning || !consent}
                className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
              >
                {assigning ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                {assigning ? 'Assigning…' : 'Confirm Assignment'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
