import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, MapPin, DollarSign, Truck, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../store/hooks';
import {
  useGetLoadsQuery,
  useGetBidsForLoadQuery,
  usePlaceBidMutation,
  useApproveBidMutation,
  useCancelBookingMutation,
} from '../store/services/hauliusApi';
import type { BidDto } from '../store/services/hauliusApi';

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
  const myBid = user ? bids.find((b) => b.carrierId === user.id) : undefined;
  const isBooked = !!load?.status && load.status !== 'OPEN';
  const isBroker = user?.role === 'broker';
  const isCarrier = user?.role === 'carrier';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/loads')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Truck className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Load Details</h1>
              <p className="text-sm text-muted-foreground">Load ID: {load.id}</p>
            </div>
          </div>
        </div>

        {/* Vehicle & Route */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle Transport'}
                </CardTitle>
                <CardDescription>Vehicle Information</CardDescription>
              </div>
              <div className="text-right">
                {load.price != null && (
                  <div className="text-3xl font-bold text-amber-500">
                    ${load.price.toLocaleString()}
                  </div>
                )}
                {load.status && (
                  <Badge
                    variant={isBooked ? 'secondary' : 'default'}
                    className={`mt-1 ${!isBooked ? 'bg-green-600 text-white' : ''}`}
                  >
                    {load.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="text-amber-500">●</span> Pickup Location
                </h3>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        {[load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ') || '—'}
                      </div>
                      {load.pickupType && (
                        <div className="text-sm text-muted-foreground mt-1">Type: {load.pickupType}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="text-amber-500">●</span> Delivery Location
                </h3>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        {[load.dropStreet, load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ') || '—'}
                      </div>
                      {load.dropType && (
                        <div className="text-sm text-muted-foreground mt-1">Type: {load.dropType}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {load.description && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FileText className="size-5" />
                  Additional Notes
                </h3>
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-lg">
                  <p className="text-foreground">{load.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carrier: Place a bid */}
        {isCarrier && !isBooked && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{myBid ? 'Your Bid' : 'Place a Bid'}</CardTitle>
              <CardDescription>
                {myBid
                  ? `Your current bid: $${Number(myBid.amount).toLocaleString()} · Status: ${myBid.status}`
                  : 'Submit your price to the broker.'}
              </CardDescription>
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
                    {isPlacingBid ? (
                      <><Loader2 className="size-4 animate-spin mr-2" />Submitting…</>
                    ) : (
                      'Submit Bid'
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
            {myBid && (
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-500" />
                  <span className="text-muted-foreground">
                    You bid <strong>${Number(myBid.amount).toLocaleString()}</strong>. Waiting for broker approval.
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Broker: View bids & approve */}
        {isBroker && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Carrier Bids ({bids.length})</CardTitle>
              <CardDescription>Review and approve a carrier for this load.</CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bids yet.</p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
                    >
                      <div>
                        <div className="font-semibold text-lg">
                          <DollarSign className="inline size-4 mr-1" />
                          {Number(bid.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Carrier ID: {bid.carrierId} · Status: {bid.status}
                        </div>
                      </div>
                      {bid.status === 'PENDING' && !isBooked ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveBid(bid)}
                          disabled={isApprovingBid === bid.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isApprovingBid === bid.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                      ) : (
                        <Badge
                          variant={bid.status === 'APPROVED' ? 'default' : 'secondary'}
                          className={bid.status === 'APPROVED' ? 'bg-green-600 text-white' : ''}
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
                    {isCancelling ? (
                      <><Loader2 className="size-4 animate-spin mr-2" />Cancelling…</>
                    ) : (
                      'Cancel Booking'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-4 text-center">
          <Link to="/loads">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Load Board
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
