import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, MapPin, DollarSign, Truck, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { toast } from 'sonner';
import * as api from '../services/apiClient';
import type { LoadDto, BidDto } from '../services/apiClient';

export function LoadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [load, setLoad] = useState<LoadDto | null>(null);
  const [bids, setBids] = useState<BidDto[]>([]);
  const [isLoadingLoad, setIsLoadingLoad] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isApprovingBid, setIsApprovingBid] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    setIsLoadingLoad(true);
    api.getLoads()
      .then(all => {
        const found = all.find(l => l.id === id) ?? null;
        setLoad(found);
        if (!found) setLoadError('Load not found.');
      })
      .catch(err => setLoadError(err?.message || 'Failed to load details.'))
      .finally(() => setIsLoadingLoad(false));

    api.getBidsForLoad(id)
      .then(setBids)
      .catch(() => setBids([]));
  }, [id]);

  const myBid = user ? bids.find(b => b.carrierId === user.id) : undefined;
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
    setIsPlacingBid(true);
    try {
      const bid = await api.placeBid({ loadId: id, amount, bookNow: false });
      setBids(prev => [...prev.filter(b => b.id !== bid.id), bid]);
      setBidAmount('');
      toast.success('Bid placed!', { description: `$${amount.toLocaleString()} bid submitted.` });
    } catch (err: any) {
      toast.error('Failed to place bid', { description: err?.message || 'Please try again.' });
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleApproveBid = async (bid: BidDto) => {
    if (!id) return;
    setIsApprovingBid(bid.id);
    try {
      await api.approveBid(id, bid.id);
      toast.success('Bid approved!', { description: 'The carrier has been assigned to this load.' });
      const all = await api.getLoads();
      setLoad(all.find(l => l.id === id) ?? load);
      setBids(await api.getBidsForLoad(id));
    } catch (err: any) {
      toast.error('Failed to approve bid', { description: err?.message || 'Please try again.' });
    } finally {
      setIsApprovingBid(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await api.cancelBooking(id);
      toast.success('Booking cancelled.');
      navigate('/broker/dashboard');
    } catch (err: any) {
      toast.error('Failed to cancel', { description: err?.message || 'Please try again.' });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoadingLoad) {
    return (
      <div className={theme === 'dark' ? 'min-h-screen bg-slate-900 flex items-center justify-center' : 'min-h-screen bg-gray-50 flex items-center justify-center'}>
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (loadError || !load) {
    return (
      <div className={theme === 'dark' ? 'min-h-screen bg-slate-900 flex items-center justify-center' : 'min-h-screen bg-gray-50 flex items-center justify-center'}>
        <Card className={theme === 'dark' ? 'max-w-md bg-slate-800 border-slate-700' : 'max-w-md bg-white border-gray-200'}>
          <CardContent className="p-12 text-center">
            <Truck className={theme === 'dark' ? 'size-12 text-slate-600 mx-auto mb-4' : 'size-12 text-gray-400 mx-auto mb-4'} />
            <h2 className={theme === 'dark' ? 'text-2xl font-bold text-white mb-2' : 'text-2xl font-bold text-gray-900 mb-2'}>Load Not Found</h2>
            <p className={theme === 'dark' ? 'text-slate-400 mb-4' : 'text-gray-600 mb-4'}>
              {loadError || 'The load you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link to="/loads">
              <Button className={theme === 'dark' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold' : 'bg-amber-600 hover:bg-amber-700 text-white font-semibold'}>Back to Load Board</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-slate-900' : 'min-h-screen bg-gray-50'}>
      <header className={theme === 'dark' ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/loads')} className={theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}>
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Truck className={theme === 'dark' ? 'size-8 text-slate-900' : 'size-8 text-white'} />
              </div>
              <div>
                <h1 className={theme === 'dark' ? 'text-3xl font-bold text-white' : 'text-3xl font-bold text-gray-900'}>Load Details</h1>
                <p className={theme === 'dark' ? 'text-sm text-slate-400' : 'text-sm text-gray-600'}>Load ID: {load.id}</p>
              </div>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vehicle & Route */}
        <Card className={theme === 'dark' ? 'mb-6 bg-slate-800 border-slate-700' : 'mb-6 bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className={theme === 'dark' ? 'text-2xl text-white' : 'text-2xl text-gray-900'}>
                  {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle Transport'}
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Vehicle Information</CardDescription>
              </div>
              <div className="text-right">
                {load.price != null && (
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-amber-500' : 'text-3xl font-bold text-amber-600'}>
                    ${load.price.toLocaleString()}
                  </div>
                )}
                {load.status && (
                  <Badge variant={isBooked ? 'secondary' : 'default'} className={`mt-1 ${!isBooked ? 'bg-green-600 text-white' : ''}`}>
                    {load.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={theme === 'dark' ? 'font-semibold text-lg mb-2 flex items-center gap-2 text-white' : 'font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900'}>
                  <span className={theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}>●</span> Pickup Location
                </h3>
                <div className={theme === 'dark' ? 'bg-slate-900 p-4 rounded-lg border border-slate-700' : 'bg-gray-50 p-4 rounded-lg border border-gray-200'}>
                  <div className="flex items-start gap-3">
                    <MapPin className={theme === 'dark' ? 'size-5 text-amber-500 mt-1 flex-shrink-0' : 'size-5 text-amber-600 mt-1 flex-shrink-0'} />
                    <div>
                      <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-gray-900'}>
                        {[load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ') || '—'}
                      </div>
                      {load.pickupType && (
                        <div className={theme === 'dark' ? 'text-sm text-slate-400 mt-1' : 'text-sm text-gray-500 mt-1'}>Type: {load.pickupType}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={theme === 'dark' ? 'font-semibold text-lg mb-2 flex items-center gap-2 text-white' : 'font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900'}>
                  <span className={theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}>●</span> Delivery Location
                </h3>
                <div className={theme === 'dark' ? 'bg-slate-900 p-4 rounded-lg border border-slate-700' : 'bg-gray-50 p-4 rounded-lg border border-gray-200'}>
                  <div className="flex items-start gap-3">
                    <MapPin className={theme === 'dark' ? 'size-5 text-amber-500 mt-1 flex-shrink-0' : 'size-5 text-amber-600 mt-1 flex-shrink-0'} />
                    <div>
                      <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-gray-900'}>
                        {[load.dropStreet, load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ') || '—'}
                      </div>
                      {load.dropType && (
                        <div className={theme === 'dark' ? 'text-sm text-slate-400 mt-1' : 'text-sm text-gray-500 mt-1'}>Type: {load.dropType}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {load.description && (
              <div className="mt-6">
                <h3 className={theme === 'dark' ? 'font-semibold text-lg mb-2 flex items-center gap-2 text-white' : 'font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900'}>
                  <FileText className="size-5" />
                  Additional Notes
                </h3>
                <div className={theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg' : 'bg-amber-50 border border-amber-200 p-4 rounded-lg'}>
                  <p className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>{load.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carrier: Place a bid */}
        {isCarrier && !isBooked && (
          <Card className={theme === 'dark' ? 'mb-6 bg-slate-800 border-slate-700' : 'mb-6 bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {myBid ? 'Your Bid' : 'Place a Bid'}
              </CardTitle>
              <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                {myBid ? `Your current bid: $${Number(myBid.amount).toLocaleString()} · Status: ${myBid.status}` : 'Submit your price to the broker.'}
              </CardDescription>
            </CardHeader>
            {!myBid && (
              <CardContent>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor="bidAmount" className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>Bid Amount ($)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      min="1"
                      placeholder="e.g. 850"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      className={theme === 'dark' ? 'bg-slate-900 border-slate-600 text-white mt-1' : 'bg-white border-gray-300 mt-1'}
                    />
                  </div>
                  <Button
                    onClick={handlePlaceBid}
                    disabled={isPlacingBid || !bidAmount}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                  >
                    {isPlacingBid ? <><Loader2 className="size-4 animate-spin mr-2" />Submitting…</> : 'Submit Bid'}
                  </Button>
                </div>
              </CardContent>
            )}
            {myBid && (
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-500" />
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                    You bid <strong>${Number(myBid.amount).toLocaleString()}</strong>. Waiting for broker approval.
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Broker: View bids & approve */}
        {isBroker && (
          <Card className={theme === 'dark' ? 'mb-6 bg-slate-800 border-slate-700' : 'mb-6 bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Carrier Bids ({bids.length})
              </CardTitle>
              <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                Review and approve a carrier for this load.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className={theme === 'dark' ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>No bids yet.</p>
              ) : (
                <div className="space-y-3">
                  {bids.map(bid => (
                    <div
                      key={bid.id}
                      className={theme === 'dark' ? 'flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700' : 'flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'}
                    >
                      <div>
                        <div className={theme === 'dark' ? 'font-semibold text-white text-lg' : 'font-semibold text-gray-900 text-lg'}>
                          <DollarSign className="inline size-4 mr-1" />
                          {Number(bid.amount).toLocaleString()}
                        </div>
                        <div className={theme === 'dark' ? 'text-sm text-slate-400' : 'text-sm text-gray-500'}>
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
                          {isApprovingBid === bid.id ? <Loader2 className="size-4 animate-spin" /> : 'Approve'}
                        </Button>
                      ) : (
                        <Badge variant={bid.status === 'APPROVED' ? 'default' : 'secondary'} className={bid.status === 'APPROVED' ? 'bg-green-600 text-white' : ''}>
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
                    {isCancelling ? <><Loader2 className="size-4 animate-spin mr-2" />Cancelling…</> : 'Cancel Booking'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-4 text-center">
          <Link to="/loads">
            <Button variant="ghost" className={theme === 'dark' ? 'gap-2 text-slate-300 hover:text-white hover:bg-slate-800' : 'gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100'}>
              <ArrowLeft className="size-4" />
              Back to Load Board
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
