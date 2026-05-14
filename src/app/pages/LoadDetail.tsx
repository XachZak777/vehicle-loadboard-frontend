import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  ArrowLeft, MapPin, DollarSign, Truck, FileText, CheckCircle,
  Loader2, Phone, Mail, Building2, ShieldCheck, Star, CalendarDays,
  CreditCard, User, Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../store/hooks';
import {
  useGetLoadsQuery,
  useGetBidsForLoadQuery,
  usePlaceBidMutation,
  useApproveBidMutation,
  useCancelBookingMutation,
  useGetBrokerPublicInfoQuery,
  useGetMyCarrierProfileQuery,
} from '../store/services/hauliusApi';
import type { BidDto } from '../store/services/hauliusApi';
import { CarrierInfoInline } from '../components/broker/CarrierInfoInline';
import { formatPhone } from '../utils/phone';

function vehicleConditionBadge(condition?: string) {
  if (!condition) return null;
  const isRunning = condition.toLowerCase() === 'running';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      isRunning
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }`}>
      {isRunning ? 'Running' : 'Non-Running'}
    </span>
  );
}

export function LoadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [bidAmount, setBidAmount] = useState('');
  const [isApprovingBid, setIsApprovingBid] = useState<string | null>(null);

  const { data: allLoads = [], isLoading: isLoadingLoad } = useGetLoadsQuery();
  const { data: bids = [], refetch: refetchBids } = useGetBidsForLoadQuery(id ?? '', { skip: !id });
  const [placeBid, { isLoading: isPlacingBid }] = usePlaceBidMutation();
  const [approveBid] = useApproveBidMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const load = id ? allLoads.find((l) => l.id === id) ?? null : null;
  const isBooked = !!load?.status && load.status !== 'OPEN';
  const isBroker = user?.role === 'broker';
  const isCarrier = user?.role === 'carrier';

  const { data: myCarrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });
  const myCarrierId = myCarrierProfile?.id;
  const myBid = myCarrierId ? bids.find((b) => b.carrierId === myCarrierId) : undefined;
  const isAssignedCarrier = isCarrier && !!myCarrierId && load?.assignedCarrierId === myCarrierId;
  const showSensitiveInfo = isBroker || isAssignedCarrier;

  // Always fetch broker info when there's a brokerId — needed for broker card visible to all roles
  const { data: brokerInfo } = useGetBrokerPublicInfoQuery(load?.brokerId ?? '', {
    skip: !load?.brokerId,
  });

  const handlePlaceBid = async () => {
    if (!id || !bidAmount) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount.');
      return;
    }
    try {
      await placeBid({ loadId: id, amount, bookNow: false }).unwrap();
      setBidAmount('');
      toast.success('Bid placed!', { description: `$${amount.toLocaleString()} bid submitted.` });
    } catch (err: any) {
      toast.error('Failed to place bid', { description: err?.message || 'Please try again.' });
    }
  };

  const handleApproveBid = async (bid: BidDto) => {
    if (!id) return;
    setIsApprovingBid(bid.id);
    try {
      await approveBid({ loadId: id, bidId: bid.id }).unwrap();
      refetchBids();
      toast.success('Bid approved!', { description: 'The carrier has been assigned to this load.' });
    } catch (err: any) {
      toast.error('Failed to approve bid', { description: err?.message || 'Please try again.' });
    } finally {
      setIsApprovingBid(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!id) return;
    try {
      await cancelBooking(id).unwrap();
      toast.success('Booking cancelled.');
      navigate('/broker/dashboard');
    } catch (err: any) {
      toast.error('Failed to cancel', { description: err?.message || 'Please try again.' });
    }
  };

  if (isLoadingLoad) {
    return (
      <div className="min-h-screen bg-background map-background-detailed flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-background map-background-detailed flex items-center justify-center">
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
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/loads')} className="mb-3 -ml-2 gap-1.5 text-muted-foreground">
            <ArrowLeft className="size-4" />
            Back to Load Board
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <MapPin className="size-5 text-amber-500 flex-shrink-0" />
                {pickupLabel}
                <span className="text-muted-foreground font-normal">→</span>
                {dropLabel}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalVehicles} vehicle{totalVehicles !== 1 ? 's' : ''}
                {load.distance ? ` · ${load.distance.toLocaleString()} mi` : ''}
                {load.trailerType ? ` · ${load.trailerType.charAt(0).toUpperCase() + load.trailerType.slice(1)}` : ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {load.price != null && (
                <div className="text-3xl font-bold text-amber-500">${load.price.toLocaleString()}</div>
              )}
              {load.price != null && load.distance != null && load.distance > 0 && (
                <div className="text-sm text-muted-foreground">${(load.price / load.distance).toFixed(2)}/mi</div>
              )}
              {load.status && (
                <Badge
                  variant={isBooked ? 'secondary' : 'default'}
                  className={`mt-1 ${!isBooked ? 'bg-amber-500 text-white' : ''}`}
                >
                  {load.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Broker / Dealer card — visible to all */}
        {load.brokerId && (
          <Card className="mb-5 border-amber-200 dark:border-amber-800/40">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Posted by</p>
                    {brokerName ? (
                      <Link
                        to={`/company/broker/${load.brokerId}`}
                        className="font-bold text-lg hover:text-amber-600 transition-colors"
                      >
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
                  {load.brokerId && (
                    <Link to={`/company/broker/${load.brokerId}?tab=ratings`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <Star className="size-3.5" />
                        View Ratings
                      </Button>
                    </Link>
                  )}
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

        {/* Route */}
        <Card className="mb-5">
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
                <p className="font-semibold">
                  {showSensitiveInfo
                    ? [load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ') || '—'
                    : [load.pickupCity, load.pickupState].filter(Boolean).join(', ') || '—'}
                </p>
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
                <p className="font-semibold">
                  {showSensitiveInfo
                    ? [load.dropStreet, load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ') || '—'
                    : [load.dropCity, load.dropState].filter(Boolean).join(', ') || '—'}
                </p>
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

        {/* Vehicles */}
        <Card className="mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {totalVehicles > 1 ? `Vehicles (${totalVehicles})` : 'Vehicle'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Primary */}
              <div className="flex items-start gap-3 p-3 bg-muted/40 border border-border">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <div className="text-sm space-y-1 flex-1 min-w-0">
                  <p className="font-semibold">
                    {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {load.vehicleType && (
                      <span className="text-xs text-muted-foreground">
                        {load.vehicleType.charAt(0).toUpperCase() + load.vehicleType.slice(1)}
                      </span>
                    )}
                    {vehicleConditionBadge(load.vehicleCondition)}
                  </div>
                  {showSensitiveInfo && load.vin && <p className="text-xs text-muted-foreground">VIN: {load.vin}</p>}
                </div>
              </div>

              {load.additionalVehicles?.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 2}
                  </div>
                  <div className="text-sm space-y-1 flex-1 min-w-0">
                    <p className="font-semibold">
                      {[v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {v.vehicleType && (
                        <span className="text-xs text-muted-foreground">
                          {v.vehicleType.charAt(0).toUpperCase() + v.vehicleType.slice(1)}
                        </span>
                      )}
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

        {/* Load details */}
        <Card className="mb-5">
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
              {load.price != null && load.distance != null && load.distance > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">$/Mile</p>
                  <p className="font-semibold">${(load.price / load.distance).toFixed(2)}</p>
                </div>
              )}
              {load.trailerType && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Trailer</p>
                  <p className="font-semibold">{load.trailerType.charAt(0).toUpperCase() + load.trailerType.slice(1)}</p>
                </div>
              )}
              {load.paymentMethod && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment</p>
                  <p className="font-semibold flex items-center gap-1">
                    <CreditCard className="size-3.5 text-muted-foreground" />
                    {load.paymentMethod}
                    {load.paymentTiming ? ` (${load.paymentTiming})` : ''}
                  </p>
                </div>
              )}
              {load.orderId && (
                <div>
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

            {load.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  Notes
                </p>
                <p className="text-sm">{load.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carrier: Place a bid */}
        {isCarrier && !isBooked && (
          <Card className="mb-5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{myBid ? 'Your Bid' : 'Place a Bid'}</CardTitle>
              {myBid && (
                <p className="text-sm text-muted-foreground">
                  Current bid: <strong>${Number(myBid.amount).toLocaleString()}</strong> · {myBid.status}
                </p>
              )}
            </CardHeader>
            {!myBid && (
              <CardContent>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor="bidAmount">Bid Amount ($)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      min="1"
                      placeholder="e.g. 850"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handlePlaceBid}
                    disabled={isPlacingBid || !bidAmount}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    {isPlacingBid
                      ? <><Loader2 className="size-4 animate-spin mr-2" />Submitting…</>
                      : 'Submit Bid'}
                  </Button>
                </div>
              </CardContent>
            )}
            {myBid && (
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-amber-500" />
                  <span className="text-muted-foreground text-sm">
                    You bid <strong>${Number(myBid.amount).toLocaleString()}</strong>. Waiting for broker approval.
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Broker: View bids & approve */}
        {isBroker && (
          <Card className="mb-5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Carrier Bids ({bids.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bids yet.</p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-start justify-between p-4 bg-muted border border-border gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-lg flex items-center gap-1">
                          <DollarSign className="size-4" />
                          {Number(bid.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Status: {bid.status}</div>
                        <CarrierInfoInline carrierId={bid.carrierId} />
                      </div>
                      {bid.status === 'PENDING' && !isBooked ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveBid(bid)}
                          disabled={isApprovingBid === bid.id}
                          className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
                        >
                          {isApprovingBid === bid.id
                            ? <Loader2 className="size-4 animate-spin" />
                            : 'Approve'}
                        </Button>
                      ) : (
                        <Badge
                          variant={bid.status === 'APPROVED' ? 'default' : 'secondary'}
                          className={bid.status === 'APPROVED' ? 'bg-amber-500 text-white flex-shrink-0' : 'flex-shrink-0'}
                        >
                          {bid.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isBooked && (
                <div className="mt-4">
                  <Button
                    variant="destructive"
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="w-full"
                  >
                    {isCancelling
                      ? <><Loader2 className="size-4 animate-spin mr-2" />Cancelling…</>
                      : 'Cancel Booking'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
