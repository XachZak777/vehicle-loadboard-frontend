import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
  User,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  Truck,
  Phone,
  FileText,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

export function LoadDetails() {
  const { loadId } = useParams<{ loadId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [load, setLoad] = useState<Load | null>(null);
  const [booking, setBooking] = useState<LoadBooking | null>(null);

  useEffect(() => {
    loadData();
  }, [loadId]);

  const loadData = () => {
    if (!loadId) return;

    // Try to get data from localStorage first
    const storedData = localStorage.getItem('view_load_details');
    if (storedData) {
      const { load: storedLoad, booking: storedBooking } = JSON.parse(storedData);
      if (storedLoad.id === loadId) {
        setLoad(storedLoad);
        setBooking(storedBooking);
        return;
      }
    }

    // Fallback: fetch from localStorage
    const allLoads = JSON.parse(localStorage.getItem('posted_loads') || '[]');
    const foundLoad = allLoads.find((l: Load) => l.id === loadId);

    if (foundLoad) {
      setLoad(foundLoad);

      // Find booking
      const allBookings = getBookings();
      const foundBooking = allBookings.find(b => b.loadId === loadId);
      setBooking(foundBooking || null);
    }
  };

  const handleStatusUpdate = (newStatus: 'assigned' | 'in-transit' | 'delivered') => {
    if (!booking || !user) return;

    try {
      updateBookingStatus(booking.id, newStatus);
      toast.success(`Load status updated to ${newStatus}`);

      // Update local state
      setBooking({ ...booking, status: newStatus });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (!load) {
    return (
      <div className="min-h-screen bg-background map-background-detailed">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <Package className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Load Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The load you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/loads')} className="bg-amber-500 hover:bg-amber-600 text-white">
                Back to Load Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const perMileRate = load.distance > 0 ? (load.price / load.distance).toFixed(2) : '0.00';
  const isBrokerOrDealer = user?.role === 'broker' || user?.role === 'dealer';
  const canUpdateStatus = isBrokerOrDealer && booking && booking.status !== 'delivered';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-amber-500 border-2 border-amber-600 text-lg px-4 py-1">Assigned</Badge>;
      case 'in-transit':
        return <Badge className="bg-blue-500 border-2 border-blue-600 text-lg px-4 py-1">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 border-2 border-green-600 text-lg px-4 py-1">Delivered</Badge>;
      case 'requested':
        return <Badge className="bg-orange-500 border-2 border-orange-600 text-lg px-4 py-1">Requested</Badge>;
      default:
        return <Badge className="text-lg px-4 py-1">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowRight className="size-4 mr-2 rotate-180" />
            Back
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Load Details</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Complete information for this load</p>
            </div>
            {booking && getStatusBadge(booking.status)}
          </div>
        </div>

        <div className="grid gap-8">
          {/* Vehicle Information */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="size-5 text-amber-500" />
                Vehicle Information
                {load.vehicles && load.vehicles.length > 1 && (
                  <Badge className="bg-amber-600 text-white ml-2">
                    {load.vehicles.length} Vehicles
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {(() => {
                const vehicles = load.vehicles && load.vehicles.length > 0
                  ? load.vehicles
                  : [{
                      vehicleType: load.vehicleType || '',
                      make: load.make || '',
                      model: load.model || '',
                      year: load.year || 0,
                      vin: load.vin,
                      condition: load.condition || 'running' as const,
                      vehicleAdditionalInfo: load.vehicleAdditionalInfo
                    }];

                return vehicles.map((vehicle, index) => (
                  <div
                    key={index}
                    className={`${index > 0 ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}
                  >
                    {vehicles.length > 1 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          Vehicle {index + 1}
                        </h3>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vehicle</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                      </div>

                      {vehicle.vin && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">VIN</div>
                          <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">{vehicle.vin}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vehicle Type</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{vehicle.vehicleType}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Condition</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{vehicle.condition}</div>
                      </div>
                    </div>

                    {vehicle.vehicleAdditionalInfo && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-none border-l-4 border-amber-500">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Additional Vehicle Info</div>
                        <div className="text-gray-900 dark:text-gray-100">{vehicle.vehicleAdditionalInfo}</div>
                      </div>
                    )}
                  </div>
                ));
              })()}

              {/* Order ID and Trailer Type - Load-level info */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {load.orderId && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order ID</div>
                      <Badge variant="outline" className="border-2 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400 font-semibold text-base px-3 py-1">
                        {load.orderId}
                      </Badge>
                    </div>
                  )}

                  {load.trailerType && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trailer Type</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{load.trailerType}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="size-5 text-amber-500" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pickup */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-5 text-amber-600 dark:text-amber-500" />
                    <div className="font-bold text-gray-900 dark:text-gray-100">Pickup Location</div>
                  </div>

                  {load.pickupFacilityName && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Facility</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{load.pickupFacilityName}</div>
                    </div>
                  )}

                  {load.pickupStreetAddress && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Address</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{load.pickupStreetAddress}</div>
                    </div>
                  )}

                  <div className="mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">City, State</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{load.pickupCity}, {load.pickupState}</div>
                  </div>

                  <div className="mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">ZIP Code</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{load.pickupZip}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                    <Calendar className="size-4 text-amber-600 dark:text-amber-500" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Date:</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(load.pickupDate).toLocaleDateString()}
                    </div>
                  </div>

                  {load.pickupContactName && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{load.pickupContactName}</div>
                      {load.pickupContactPhone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="size-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{load.pickupContactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-5 text-amber-600 dark:text-amber-500" />
                    <div className="font-bold text-gray-900 dark:text-gray-100">Delivery Location</div>
                  </div>

                  {load.deliveryFacilityName && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Facility</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{load.deliveryFacilityName}</div>
                    </div>
                  )}

                  {load.deliveryStreetAddress && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Address</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{load.deliveryStreetAddress}</div>
                    </div>
                  )}

                  <div className="mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">City, State</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{load.deliveryCity}, {load.deliveryState}</div>
                  </div>

                  <div className="mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">ZIP Code</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{load.deliveryZip}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Calendar className="size-4 text-amber-500" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Date:</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(load.deliveryDate).toLocaleDateString()}
                    </div>
                  </div>

                  {load.deliveryContactName && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{load.deliveryContactName}</div>
                      {load.deliveryContactPhone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="size-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{load.deliveryContactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Distance</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{load.distance} miles</div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Parties */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="size-5 text-amber-500" />
                Payment & Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Load Price</div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">
                    ${load.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${perMileRate}/mile
                  </div>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Method</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{load.paymentMethod}</div>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Terms</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{load.paymentTerms}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {booking && booking.brokerName && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="size-5 text-amber-500" />
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Broker/Dealer</div>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">{booking.brokerName}</div>
                    {booking.brokerPhone && (
                      <div className="flex items-center gap-1 mt-2">
                        <Phone className="size-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{booking.brokerPhone}</span>
                      </div>
                    )}
                  </div>
                )}

                {booking && booking.carrierName && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="size-5 text-amber-500" />
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Carrier</div>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">{booking.carrierName}</div>
                  </div>
                )}
              </div>

              {booking?.requestedPrice && (
                <div className="mt-6 p-5 bg-orange-50/50 dark:bg-orange-950/20 rounded-none border-l-4 border-orange-500">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Carrier Offered Price</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                    ${parseFloat(booking.requestedPrice).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(load.additionalInfo || booking?.notes) && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-amber-500" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {load.additionalInfo && (
                  <div className="mb-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none border-l-4 border-amber-500">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Load Notes</div>
                    <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{load.additionalInfo}</div>
                  </div>
                )}

                {booking?.notes && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-none border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Carrier Notes</div>
                    <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{booking.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Update Buttons (for Broker/Dealer) */}
          {canUpdateStatus && (
            <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="size-5 text-amber-500" />
                  Update Load Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {booking.status !== 'assigned' && (
                    <Button
                      onClick={() => handleStatusUpdate('assigned')}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Mark as Assigned
                    </Button>
                  )}

                  {booking.status !== 'in-transit' && (
                    <Button
                      onClick={() => handleStatusUpdate('in-transit')}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Truck className="size-4 mr-2" />
                      Mark as In Transit
                    </Button>
                  )}

                  <Button
                    onClick={() => handleStatusUpdate('delivered')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Home className="size-4 mr-2" />
                    Mark as Delivered
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
