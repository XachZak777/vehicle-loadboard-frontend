import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Clock,
  MapPin,
  Check,
  Calendar,
  Truck,
  ArrowRight,
  ChevronRight,
  Loader2,
  Users,
} from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { CarrierInfoInline } from './CarrierInfoInline';
import { LoadWithBidsLoader } from './LoadWithBidsLoader';
import { AssignCarrierModal } from './AssignCarrierModal';
import type { LoadDto, BidDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';
import { colors } from '../../styles/colors';

interface Props {
  openLoads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onApproveBid: (load: LoadDto, bid: BidDto) => Promise<void>;
  actionLoading: boolean;
}

interface PendingApproval {
  load: LoadDto;
  bid: BidDto;
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeStr: string | undefined) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return ` at ${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function PendingBidsTab({ openLoads, getStatusBadge, onApproveBid, actionLoading }: Props) {
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [approveConsent, setApproveConsent] = useState(false);
  const [assignCarrierLoad, setAssignCarrierLoad] = useState<LoadDto | null>(null);

  const handleConfirmApprove = async () => {
    if (!pendingApproval) return;
    setConfirming(true);
    try {
      await onApproveBid(pendingApproval.load, pendingApproval.bid);
      setPendingApproval(null);
      setApproveConsent(false);
    } finally {
      setConfirming(false);
    }
  };

  if (openLoads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No pending bids right now</p>
          <p className="text-xs mt-1 opacity-70">Bids placed by carriers on your loads will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {openLoads.map(load => (
        <LoadWithBidsLoader key={load.id} load={load}>
          {(loadWithBids) => {
            const pendingBids = loadWithBids.bids.filter(b => b.status === 'PENDING');
            if (pendingBids.length === 0) return null;

            return (
              <Card className="overflow-hidden">
                {/* Load header */}
                <CardHeader className="bg-muted/40 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className={`w-4 h-4 ${colors.accentText} flex-shrink-0`} />
                        <CardTitle className="text-base">
                          {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{load.pickupCity}, {load.pickupState}</span>
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{load.dropCity}, {load.dropState}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {getStatusBadge(load)}
                      {load.price && (
                        <span className="text-xs text-muted-foreground">
                          Listed: <span className="font-semibold text-foreground">${load.price.toLocaleString()}</span>
                        </span>
                      )}
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssignCarrierLoad(load)}
                          disabled={actionLoading}
                          className={`gap-1.5 ${colors.accentBorderMedium} ${colors.accentTextStrong} hover:${colors.accentBgFaint} dark:hover:${colors.accentBgMuted} text-xs h-7`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          Assign Carrier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="px-4 py-2 border-b bg-muted/20">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {pendingBids.length} Pending {pendingBids.length === 1 ? 'Bid' : 'Bids'}
                    </span>
                  </div>

                  <div className="divide-y">
                    {pendingBids.map((bid, idx) => (
                      <div key={bid.id} className="p-4 hover:bg-muted/20 transition-colors">
                        {/* Bid amount row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-amber-600">
                              ${bid.amount.toLocaleString()}
                            </span>
                            {load.price && bid.amount < load.price && (
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                −${(load.price - bid.amount).toLocaleString()} off ask
                              </Badge>
                            )}
                            {load.price && bid.amount > load.price && (
                              <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                                +${(bid.amount - load.price).toLocaleString()} over ask
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setPendingApproval({ load, bid })}
                            disabled={actionLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Carrier info */}
                        <div className="mb-3">
                          <CarrierInfoInline carrierId={bid.carrierId} />
                        </div>

                        {/* Schedule */}
                        {(bid.requestedPickupDate || bid.requestedPickupTime || bid.requestedDropDate || bid.requestedDropTime) && (
                          <div className="mt-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/20 rounded border border-amber-200/60 dark:border-amber-800/30 space-y-1">
                            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                              Carrier's Requested Schedule
                            </p>
                            {(bid.requestedPickupDate || bid.requestedPickupTime) && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3 text-amber-500" />
                                <span>Pickup:</span>
                                <span className="font-medium text-foreground">
                                  {formatDate(bid.requestedPickupDate)}
                                  {formatTime(bid.requestedPickupTime)}
                                </span>
                              </div>
                            )}
                            {(bid.requestedDropDate || bid.requestedDropTime) && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3 text-amber-500" />
                                <span>Drop-off:</span>
                                <span className="font-medium text-foreground">
                                  {formatDate(bid.requestedDropDate)}
                                  {formatTime(bid.requestedDropTime)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {bid.createdAt && (
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Submitted {new Date(bid.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }}
        </LoadWithBidsLoader>
      ))}

      {/* Direct carrier assignment modal */}
      {assignCarrierLoad && (
        <AssignCarrierModal
          load={assignCarrierLoad}
          open={!!assignCarrierLoad}
          onClose={() => setAssignCarrierLoad(null)}
        />
      )}

      {/* Approval confirmation dialog */}
      <Dialog open={!!pendingApproval} onOpenChange={(open) => { if (!open && !confirming) { setPendingApproval(null); setApproveConsent(false); } }}>
        <DialogContent className="max-w-[calc(100vw-24px)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Bid Approval</DialogTitle>
          </DialogHeader>

          {pendingApproval && (
            <div className="space-y-4 py-1">
              {/* Load summary */}
              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Load</p>
                <p className="font-semibold text-sm">
                  {pendingApproval.load.vehicleYear} {pendingApproval.load.vehicleMake} {pendingApproval.load.vehicleModel}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{pendingApproval.load.pickupCity}, {pendingApproval.load.pickupState}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{pendingApproval.load.dropCity}, {pendingApproval.load.dropState}</span>
                </div>
              </div>

              {/* Bid amount */}
              <div className="flex items-center justify-between p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/30">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Approved Bid Amount</p>
                  {pendingApproval.load.price && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Listed at ${pendingApproval.load.price.toLocaleString()}
                    </p>
                  )}
                </div>
                <span className="text-3xl font-bold text-amber-600">
                  ${pendingApproval.bid.amount.toLocaleString()}
                </span>
              </div>

              {/* Carrier info */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Carrier</p>
                <CarrierInfoInline carrierId={pendingApproval.bid.carrierId} />
              </div>

              {/* Schedule */}
              {(pendingApproval.bid.requestedPickupDate || pendingApproval.bid.requestedPickupTime ||
                pendingApproval.bid.requestedDropDate || pendingApproval.bid.requestedDropTime) && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Requested Schedule</p>
                  {(pendingApproval.bid.requestedPickupDate || pendingApproval.bid.requestedPickupTime) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="text-muted-foreground">Pickup:</span>
                      <span className="font-medium">
                        {formatDate(pendingApproval.bid.requestedPickupDate)}
                        {formatTime(pendingApproval.bid.requestedPickupTime)}
                      </span>
                    </div>
                  )}
                  {(pendingApproval.bid.requestedDropDate || pendingApproval.bid.requestedDropTime) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="text-muted-foreground">Drop-off:</span>
                      <span className="font-medium">
                        {formatDate(pendingApproval.bid.requestedDropDate)}
                        {formatTime(pendingApproval.bid.requestedDropTime)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <p className="text-xs text-muted-foreground">
                Approving this bid will assign the load to this carrier. Other pending bids will be automatically declined.
              </p>

              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="approveConsent"
                    checked={approveConsent}
                    onCheckedChange={(v) => setApproveConsent(!!v)}
                    className="mt-0.5 shrink-0"
                  />
                  <label htmlFor="approveConsent" className="text-xs leading-relaxed cursor-pointer select-none text-muted-foreground">
                    I acknowledge and agree that once the carrier has accepted my request, I will be entered into a legal contract with the carrier for the transport of my vehicle(s). I further acknowledge and agree that Haulius is not a party to such contract, and has no obligation or liability whatsoever arising out of such contract. I consent to Haulius adding a provision to this effect in my dispatch sheets. I also understand that any changes that I make to the dispatch sheet after the carrier has accepted my request, unless the carrier has approved the change, may not be binding on the carrier.
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => { setPendingApproval(null); setApproveConsent(false); }}
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={confirming || !approveConsent}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
