import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Load } from '../types';
import { LoadBooking } from '../types/user';
import { getBookings, updateBookingStatus } from '../services/loadBookingService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Package,
  ArrowRight,
  X,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export function RequestedLoads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requestedBookings, setRequestedBookings] = useState<LoadBooking[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user) return;

    const allBookings = getBookings();
    const allLoads = JSON.parse(localStorage.getItem('posted_loads') || '[]');

    // Get loads requested by this carrier
    const carrierRequestedBookings = allBookings.filter(
      (booking) => booking.carrierId === user.id && booking.status === 'requested'
    );
    setRequestedBookings(carrierRequestedBookings);

    // Get the load details for these bookings
    const loadIds = carrierRequestedBookings.map(b => b.loadId);
    const requestedLoads = allLoads.filter((load: Load) => loadIds.includes(load.id));
    setLoads(requestedLoads);
  };

  const getLoadById = (loadId: string): Load | undefined => {
    return loads.find(l => l.id === loadId);
  };

  const handleCancelRequest = (booking: LoadBooking) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      // Remove the booking
      const allBookings = getBookings();
      const updatedBookings = allBookings.filter(b => b.id !== booking.id);
      localStorage.setItem('load_bookings', JSON.stringify(updatedBookings));

      toast.success('Request cancelled successfully');
      loadData(); // Reload data
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge className="bg-amber-500 border-2 border-amber-600">Requested</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Requested Loads</h1>
          <p className="text-muted-foreground">
            View and manage your load requests
          </p>
        </div>

        {requestedBookings.length === 0 ? (
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <Package className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Requested Loads</h3>
              <p className="text-muted-foreground mb-4">
                You haven't requested any loads yet.
              </p>
              <Button onClick={() => navigate('/loads')} className="bg-amber-500 hover:bg-amber-600 text-white">
                Browse Load Board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requestedBookings.map((booking) => {
              const load = getLoadById(booking.loadId);
              if (!load) return null;

              const perMileRate = load.distance > 0 ? (load.price / load.distance).toFixed(2) : '0.00';

              return (
                <Card
                  key={booking.id}
                  className="border-[3px] border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {load.year} {load.make} {load.model}
                        </CardTitle>
                        {load.orderId && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Order ID: <span className="font-mono font-semibold">{load.orderId}</span>
                          </div>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Route Display */}
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-none border-2 border-gray-300 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{load.pickupCity}, {load.pickupState}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Calendar className="size-3 text-amber-600" />
                            <span className="whitespace-nowrap">{new Date(load.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        <ArrowRight className="size-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mx-1" />

                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{load.deliveryCity}, {load.deliveryState}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Calendar className="size-3 text-amber-600" />
                            <span className="whitespace-nowrap">{new Date(load.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <MapPin className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Load Price:</span>
                        <span className="font-bold text-lg text-amber-600 dark:text-amber-500">${load.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({load.distance} mi • ${perMileRate}/mi)</span>
                      </div>

                      {booking.requestedPrice && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Your Offer:</span>
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">${parseFloat(booking.requestedPrice).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="size-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Broker:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{booking.brokerName || 'N/A'}</span>
                      </div>

                      {booking.requestedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="size-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{new Date(booking.requestedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div className="p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-none mb-4">
                        <p className="text-sm">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Your Note:</span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">{booking.notes}</span>
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => handleCancelRequest(booking)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="size-4 mr-2" />
                        Cancel Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
