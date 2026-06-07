import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  ArrowLeft, MapPin, Truck, FileText,
  Loader2, Phone, Mail, Building2, ShieldCheck, Star, CalendarDays,
  User, Package, CheckCircle, PackageOpen, PackageCheck, BadgeCheck, MessageSquare, Hash, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../store/hooks';
import {
  useGetLoadQuery,
  useGetBrokerPublicInfoQuery,
  useGetMyCarrierProfileQuery,
  useGetCarrierPublicInfoQuery,
  useUpdateLoadStatusMutation,
  useGetMySubmittedLoadIdsQuery,
  useGetBidsForLoadQuery,
} from '../store/services/hauliusApi';
import { formatPhone, formatPaymentLabel, calcPricePerMile } from '../utils/phone';
import { MapBackground } from '../components/MapBackground';
import { CityMapModal } from '../components/CityMapModal';
import { DispatchSheet } from '../components/DispatchSheet';
import { RateModal } from '../components/RateModal';

function vehicleConditionBadge(condition?: string) {
  if (!condition) return null;
  const isRunning = condition.toLowerCase() === 'running';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      isRunning
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {isRunning ? 'Running' : 'Non-Running'}
    </span>
  );
}

function trailerTypeBadge(trailerType?: string) {
  if (!trailerType) return null;
  const label = trailerType === 'enclosed' ? 'Enclosed Trailer'
    : trailerType === 'open' ? 'Open Trailer'
    : trailerType.charAt(0).toUpperCase() + trailerType.slice(1);
  const colorClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}

export function LoadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [cityMap, setCityMap] = useState<{ city: string; state: string; label: string } | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  const { data: load = null, isLoading: isLoadingLoad } = useGetLoadQuery(id ?? '', { skip: !id });
  const isBooked = !!load?.status && load.status !== 'OPEN';
  const isBroker = user?.role === 'broker';
  const isCarrier = user?.role === 'carrier';

  const { data: myCarrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });
  const myCarrierId = myCarrierProfile?.id;
  const isAssignedCarrier = isCarrier && !!myCarrierId && load?.assignedCarrierId === myCarrierId;
  const showSensitiveInfo = isBroker || isAssignedCarrier;

  // Always fetch broker info when there's a brokerId — needed for broker card visible to all roles
  const { data: brokerInfo } = useGetBrokerPublicInfoQuery(load?.brokerId ?? '', {
    skip: !load?.brokerId,
  });

  const { data: assignedCarrierInfo } = useGetCarrierPublicInfoQuery(load?.assignedCarrierId ?? '', {
    skip: !load?.assignedCarrierId,
  });

  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery(undefined, { skip: !isAssignedCarrier && !isBroker });
  const { data: loadBids = [] } = useGetBidsForLoadQuery(id ?? '', { skip: !id || !isBroker });
  const approvedBid = loadBids.find(b => b.status === 'APPROVED');
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingSubmittedLocal, setRatingSubmittedLocal] = useState(false);
  const [carrierRatingOpen, setCarrierRatingOpen] = useState(false);
  const [carrierRatingSubmittedLocal, setCarrierRatingSubmittedLocal] = useState(false);

  const [updateLoadStatus, { isLoading: isConfirmingStatus }] = useUpdateLoadStatusMutation();

  const STATUS_NEXT: Record<string, { label: string; icon: React.ReactNode }> = {
    ASSIGNED:  { label: 'Confirm Pickup',           icon: <PackageOpen  className="size-3.5" /> },
    PICKED_UP: { label: 'Confirm Delivery',          icon: <PackageCheck className="size-3.5" /> },
    DELIVERED: { label: 'Confirm Payment Received',  icon: <BadgeCheck   className="size-3.5" /> },
  };
  const STATUS_LABELS: Record<string, string> = {
    ASSIGNED:  'Pickup confirmed!',
    PICKED_UP: 'Delivery confirmed!',
    DELIVERED: 'Payment confirmed!',
  };

  const handleAdvanceStatus = async () => {
    if (!id) return;
    try {
      await updateLoadStatus(id).unwrap();
      toast.success(STATUS_LABELS[load?.status ?? ''] ?? 'Status updated!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status.');
    }
  };

  const RATEABLE_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);
  const canRateBroker = isAssignedCarrier && !!load?.brokerId && RATEABLE_STATUSES.has(load?.status ?? '');
  const alreadyRated = ratingSubmittedLocal || (submittedLoadIds?.includes(id ?? '') ?? false);
  const canRateCarrier = isBroker && !!load?.assignedCarrierId && RATEABLE_STATUSES.has(load?.status ?? '');
  const carrierAlreadyRated = carrierRatingSubmittedLocal || (submittedLoadIds?.includes(id ?? '') ?? false);

if (isLoadingLoad) {
    return (
      <div className="min-h-screen bg-background map-background-detailed flex items-center justify-center">
        <MapBackground />
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-background map-background-detailed flex items-center justify-center">
        <MapBackground />
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Truck className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Load Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The load you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/loads">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                Back to Load Board
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVehicles = 1 + (load.additionalVehicles?.length ?? 0);
  const brokerName = brokerInfo?.companyName || brokerInfo?.legalName;
  const pickupLabel = [load.pickupCity, load.pickupState].filter(Boolean).join(', ') || '—';
  const dropLabel = [load.dropCity, load.dropState].filter(Boolean).join(', ') || '—';

  const formatDate = (d?: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-2 gap-1.5 text-muted-foreground">
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {/* Load card — BidCard-style */}
        <div className="border-2 border-gray-200 dark:border-gray-700 bg-card hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden rounded-none">

          {/* Broker row */}
          {load.brokerId && (
            <div className="mx-4 mt-4 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-md">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="size-3.5 flex-shrink-0" />
                {brokerName ? (
                  <Link to={`/company/broker/${load.brokerId}`} className="hover:text-amber-600 transition-colors">{brokerName}</Link>
                ) : (
                  <span>Loading…</span>
                )}
              </div>
            </div>
          )}

          {/* Compact header — always visible */}
          <div className="p-4 cursor-pointer select-none" onClick={() => setDetailsExpanded(v => !v)}>

            {/* Desktop */}
            <div className="hidden sm:flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {load.orderId && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                      <Hash className="size-3" />
                      {load.orderId}
                    </span>
                  )}
                  <span className="text-base font-semibold text-foreground">
                    {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Load'}
                  </span>
                  {load.status && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isBooked
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {load.status === 'OPEN' ? 'Open'
                        : load.status === 'ASSIGNED' ? 'Assigned'
                        : `Assigned · ${load.status.replace('_', ' ')}`}
                    </span>
                  )}
                </div>
                {load.additionalVehicles && load.additionalVehicles.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {load.additionalVehicles.map(v => [v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ')).join(' • ')}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                      <button
                        onClick={e => { e.stopPropagation(); if (load.pickupCity) setCityMap({ city: load.pickupCity, state: load.pickupState ?? '', label: `Pickup — ${pickupLabel}` }); }}
                        className="text-sm text-muted-foreground truncate hover:underline decoration-muted-foreground underline-offset-2 cursor-pointer text-left"
                      >
                        {pickupLabel}
                      </button>
                    </div>
                    {load.pickupDate && (
                      <p className="text-xs text-muted-foreground pl-4">
                        {new Date(load.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                      <button
                        onClick={e => { e.stopPropagation(); if (load.dropCity) setCityMap({ city: load.dropCity, state: load.dropState ?? '', label: `Delivery — ${dropLabel}` }); }}
                        className="text-sm text-muted-foreground truncate hover:underline decoration-muted-foreground underline-offset-2 cursor-pointer text-left"
                      >
                        {dropLabel}
                      </button>
                    </div>
                    {load.deliveryDate && (
                      <p className="text-xs text-muted-foreground pl-4">
                        {new Date(load.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                {load.price != null && (
                  <div className="text-lg font-bold text-amber-600 leading-tight">${load.price.toLocaleString()}</div>
                )}
                {calcPricePerMile(load.price, load.distance, load.additionalVehicles) != null && (
                  <div className="text-xs text-muted-foreground">${calcPricePerMile(load.price, load.distance, load.additionalVehicles)!.toFixed(2)}/mi</div>
                )}
              </div>
              <div className="flex-shrink-0 p-1 self-start">
                <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${detailsExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-2 sm:hidden">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {load.orderId && (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <Hash className="size-3" />
                        {load.orderId}
                      </span>
                    )}
                    <span className="text-base font-semibold text-foreground">
                      {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Load'}
                    </span>
                    {load.status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isBooked
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {load.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {load.price != null && (
                    <div className="text-lg font-bold text-amber-600 leading-tight">${load.price.toLocaleString()}</div>
                  )}
                </div>
                <div className="flex-shrink-0 p-1 self-start">
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${detailsExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-start gap-1">
                    <MapPin className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <button
                      onClick={e => { e.stopPropagation(); if (load.pickupCity) setCityMap({ city: load.pickupCity, state: load.pickupState ?? '', label: `Pickup — ${pickupLabel}` }); }}
                      className="text-sm text-muted-foreground hover:underline underline-offset-2 cursor-pointer text-left min-w-0 overflow-hidden"
                    >
                      <span className="block truncate">{pickupLabel}</span>
                    </button>
                  </div>
                  {load.pickupDate && (
                    <p className="text-xs text-muted-foreground pl-4">
                      {new Date(load.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className="text-amber-500 font-bold flex-shrink-0 pt-0.5">→</span>
                <div className="min-w-0 flex-1 overflow-hidden text-right">
                  <div className="flex items-start gap-1 flex-row-reverse">
                    <MapPin className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <button
                      onClick={e => { e.stopPropagation(); if (load.dropCity) setCityMap({ city: load.dropCity, state: load.dropState ?? '', label: `Delivery — ${dropLabel}` }); }}
                      className="text-sm text-muted-foreground hover:underline underline-offset-2 cursor-pointer text-right min-w-0 overflow-hidden"
                    >
                      <span className="block truncate">{dropLabel}</span>
                    </button>
                  </div>
                  {load.deliveryDate && (
                    <p className="text-xs text-muted-foreground pr-4">
                      {new Date(load.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action bar — always visible */}
          {isAssignedCarrier && STATUS_NEXT[load.status ?? ''] && (
            <div className="px-4 pb-3 flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
              <Button
                size="sm"
                onClick={handleAdvanceStatus}
                disabled={isConfirmingStatus}
                className="h-7 text-xs px-3 bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
              >
                {isConfirmingStatus ? <Loader2 className="size-3.5 animate-spin" /> : STATUS_NEXT[load.status!].icon}
                {isConfirmingStatus ? 'Updating…' : STATUS_NEXT[load.status!].label}
              </Button>
            </div>
          )}

          {/* Expandable details */}
          {detailsExpanded && (
            <div
              className="border-t border-border bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:via-amber-950/20 dark:to-orange-950/20 p-5 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Dispatch Sheet */}
              {isBooked && (
                <DispatchSheet
                  load={load}
                  brokerInfo={brokerInfo}
                  carrierInfo={assignedCarrierInfo}
                  showSensitiveInfo={showSensitiveInfo}
                />
              )}

              {/* Broker card — only when not booked */}
              {!isBooked && load.brokerId && (
                <Card className="border-amber-200 dark:border-amber-800/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <Building2 className="size-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Posted by</p>
                          {brokerName ? (
                            <Link to={`/company/broker/${load.brokerId}`} className="font-bold text-lg hover:text-amber-600 transition-colors">
                              {brokerName}
                            </Link>
                          ) : (
                            <p className="font-bold text-lg text-muted-foreground">Loading…</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {brokerInfo?.ratingScore != null && (
                          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-1.5">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-sm">{brokerInfo.ratingScore}%</span>
                            <span className="text-xs text-muted-foreground">positive</span>
                          </div>
                        )}
                        <Link to={`/company/broker/${load.brokerId}?tab=ratings`}>
                          <Button variant="outline" size="sm" className="text-xs gap-1.5">
                            <Star className="size-3.5" />
                            View Ratings
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  {brokerInfo && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {brokerInfo.mcNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground">MC Number</p>
                            <p className="font-mono font-medium">{brokerInfo.mcNumber}</p>
                          </div>
                        )}
                        {brokerInfo.dotNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground">DOT Number</p>
                            <p className="font-mono font-medium">{brokerInfo.dotNumber}</p>
                          </div>
                        )}
                        {(brokerInfo.city || brokerInfo.state) && (
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium">{[brokerInfo.city, brokerInfo.state].filter(Boolean).join(', ')}</p>
                          </div>
                        )}
                        {brokerInfo.phoneNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <a href={`tel:${brokerInfo.phoneNumber}`} className="font-medium flex items-center gap-1 hover:text-amber-600 transition-colors">
                              <Phone className="size-3.5 text-amber-500" />
                              {formatPhone(brokerInfo.phoneNumber)}
                            </a>
                          </div>
                        )}
                        {brokerInfo.email && (
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <a href={`mailto:${brokerInfo.email}`} className="font-medium flex items-center gap-1 hover:text-amber-600 transition-colors truncate">
                              <Mail className="size-3.5 text-amber-500 flex-shrink-0" />
                              {brokerInfo.email}
                            </a>
                          </div>
                        )}
                        {brokerInfo.operatingStatus && (
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="font-medium flex items-center gap-1">
                              <ShieldCheck className="size-3.5 text-amber-500" />
                              {brokerInfo.operatingStatus}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Route card */}
              {!isBooked && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="size-4 text-amber-500" />
                      Route
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Pickup</p>
                        {(() => {
                          const fullAddr = [load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ');
                          const cityAddr = [load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ');
                          if (showSensitiveInfo && fullAddr) {
                            return (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`} target="_blank" rel="noopener noreferrer" className="font-semibold flex items-center gap-1 hover:text-amber-600 transition-colors">
                                <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                                {fullAddr}
                              </a>
                            );
                          }
                          if (isCarrier && load.pickupCity) {
                            return (
                              <button onClick={() => setCityMap({ city: load.pickupCity!, state: load.pickupState ?? '', label: `Pickup — ${cityAddr}` })} className="font-semibold text-left text-foreground hover:text-foreground cursor-pointer hover:underline decoration-muted-foreground underline-offset-2">
                                {cityAddr}
                              </button>
                            );
                          }
                          return <p className="font-semibold">{cityAddr || '—'}</p>;
                        })()}
                        {load.pickupType && <p className="text-xs text-muted-foreground">Type: {load.pickupType}</p>}
                        {formatDate(load.pickupDate) && (
                          <p className="text-xs flex items-center gap-1 text-muted-foreground">
                            <CalendarDays className="size-3.5" />
                            {formatDate(load.pickupDate)}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery</p>
                        {(() => {
                          const fullAddr = [load.dropStreet, load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ');
                          const cityAddr = [load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ');
                          if (showSensitiveInfo && fullAddr) {
                            return (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`} target="_blank" rel="noopener noreferrer" className="font-semibold flex items-center gap-1 hover:text-amber-600 transition-colors">
                                <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                                {fullAddr}
                              </a>
                            );
                          }
                          if (isCarrier && load.dropCity) {
                            return (
                              <button onClick={() => setCityMap({ city: load.dropCity!, state: load.dropState ?? '', label: `Delivery — ${cityAddr}` })} className="font-semibold text-left text-foreground hover:text-foreground cursor-pointer hover:underline decoration-muted-foreground underline-offset-2">
                                {cityAddr}
                              </button>
                            );
                          }
                          return <p className="font-semibold">{cityAddr || '—'}</p>;
                        })()}
                        {load.dropType && <p className="text-xs text-muted-foreground">Type: {load.dropType}</p>}
                        {formatDate(load.deliveryDate) && (
                          <p className="text-xs flex items-center gap-1 text-muted-foreground">
                            <CalendarDays className="size-3.5" />
                            {formatDate(load.deliveryDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vehicles card */}
              {!isBooked && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {totalVehicles > 1 ? `Vehicles (${totalVehicles})` : 'Vehicle'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/40 border border-border">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                        <div className="text-sm space-y-1 flex-1 min-w-0">
                          <p className="font-semibold">{[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {load.vehicleType && <span className="text-xs text-muted-foreground">{load.vehicleType.charAt(0).toUpperCase() + load.vehicleType.slice(1)}</span>}
                            {vehicleConditionBadge(load.vehicleCondition)}
                          </div>
                          {showSensitiveInfo && load.vin && <p className="text-xs text-muted-foreground">VIN: {load.vin}</p>}
                        </div>
                      </div>
                      {load.additionalVehicles?.map((v, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{i + 2}</div>
                          <div className="text-sm space-y-1 flex-1 min-w-0">
                            <p className="font-semibold">{[v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {v.vehicleType && <span className="text-xs text-muted-foreground">{v.vehicleType.charAt(0).toUpperCase() + v.vehicleType.slice(1)}</span>}
                              {vehicleConditionBadge(v.vehicleCondition)}
                            </div>
                            {showSensitiveInfo && v.vin && <p className="text-xs text-muted-foreground">VIN: {v.vin}</p>}
                            {v.vehicleAdditionalInfo && <p className="text-xs text-muted-foreground">{v.vehicleAdditionalInfo}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Load details card */}
              {!isBooked && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="size-4 text-amber-500" />
                      Load Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      {load.price != null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Price</p>
                          <p className="font-semibold text-amber-600 text-base">${load.price.toLocaleString()}</p>
                        </div>
                      )}
                      {load.distance != null && load.distance > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
                          <p className="font-semibold">{load.distance.toLocaleString()} mi</p>
                        </div>
                      )}
                      {calcPricePerMile(load.price, load.distance, load.additionalVehicles) != null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">$/Mile</p>
                          <p className="font-semibold">${calcPricePerMile(load.price, load.distance, load.additionalVehicles)!.toFixed(2)}</p>
                        </div>
                      )}
                      {load.trailerType && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Trailer</p>
                          <div className="mt-0.5">{trailerTypeBadge(load.trailerType)}</div>
                        </div>
                      )}
                      {load.paymentMethod && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment</p>
                          <p className="font-semibold">
                            {formatPaymentLabel(load.paymentMethod)}
                            {load.paymentTiming ? ` (${formatPaymentLabel(load.paymentTiming)})` : ''}
                          </p>
                        </div>
                      )}
                      {load.orderId && (
                        <div className="col-span-2 sm:col-span-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Order ID</p>
                          <p className="font-mono font-medium">{load.orderId}</p>
                        </div>
                      )}
                      {load.contactName && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact</p>
                          <p className="font-semibold flex items-center gap-1">
                            <User className="size-3.5 text-muted-foreground" />
                            {load.contactName}
                          </p>
                        </div>
                      )}
                      {load.contactPhone && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                          <a href={`tel:${load.contactPhone}`} className="font-semibold flex items-center gap-1 hover:text-amber-600 transition-colors">
                            <Phone className="size-3.5 text-amber-500" />
                            {formatPhone(load.contactPhone)}
                          </a>
                        </div>
                      )}
                      {load.contactEmail && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                          <a href={`mailto:${load.contactEmail}`} className="font-semibold flex items-center gap-1 hover:text-amber-600 transition-colors">
                            <Mail className="size-3.5 text-amber-500" />
                            {load.contactEmail}
                          </a>
                        </div>
                      )}
                    </div>
                    {(load.paymentNotes || load.description) && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        {load.paymentNotes && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                              <FileText className="size-3.5" />
                              Payment Notes
                            </p>
                            <p className="text-sm">{load.paymentNotes}</p>
                          </div>
                        )}
                        {load.description && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                              <FileText className="size-3.5" />
                              Additional Notes
                            </p>
                            <p className="text-sm">{load.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Carrier bid notes */}
              {isBroker && approvedBid?.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="size-4 text-muted-foreground" />
                      Carrier Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{approvedBid.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Rate carrier */}
              {canRateCarrier && (
                <Card>
                  <CardContent className="flex flex-wrap gap-3 items-center py-4">
                    {carrierAlreadyRated ? (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle className="size-4 text-amber-500" />
                        Carrier rating submitted
                      </span>
                    ) : (
                      <Button variant="outline" className="gap-2" onClick={() => setCarrierRatingOpen(true)}>
                        <Star className="size-4 text-amber-500" />
                        Rate Carrier
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rate broker */}
              {canRateBroker && (
                <div className="flex items-center gap-2 pt-1">
                  {alreadyRated ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CheckCircle className="size-4 text-amber-500" />
                      Broker rating submitted
                    </span>
                  ) : (
                    <Button variant="outline" className="gap-2" onClick={() => setRatingOpen(true)}>
                      <Star className="size-4 text-amber-500" />
                      Rate Broker
                    </Button>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {cityMap && (
          <CityMapModal
            city={cityMap.city}
            state={cityMap.state}
            label={cityMap.label}
            onClose={() => setCityMap(null)}
          />
        )}

        {canRateBroker && !alreadyRated && (
          <RateModal
            open={ratingOpen}
            onClose={() => setRatingOpen(false)}
            onSubmitted={() => setRatingSubmittedLocal(true)}
            targetId={load.brokerId!}
            targetType="broker"
            targetName={brokerName ?? ''}
            loadId={id!}
            vehicleTitle={[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')}
          />
        )}

        {canRateCarrier && !carrierAlreadyRated && (
          <RateModal
            open={carrierRatingOpen}
            onClose={() => setCarrierRatingOpen(false)}
            onSubmitted={() => setCarrierRatingSubmittedLocal(true)}
            targetId={load.assignedCarrierId!}
            targetType="carrier"
            targetName={assignedCarrierInfo?.companyName ?? assignedCarrierInfo?.legalName ?? 'Carrier'}
            loadId={id!}
            vehicleTitle={[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')}
          />
        )}

      </div>
    </div>
  );
}
