import { useState, useEffect } from 'react';
import { MapBackground } from '../components/MapBackground';
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
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  User,
  Package,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export function AssignedLoads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedBookings, setAssignedBookings] = useState<LoadBooking[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);

  // Helper function to get vehicles from a load (handles backward compatibility)
  const getLoadVehicles = (load: Load) => {
    if (load.vehicles && load.vehicles.length > 0) {
      return load.vehicles;
    }
    // Backward compatibility - convert old single-vehicle fields to array
    return [{
      vehicleType: load.vehicleType || '',
      make: load.make || '',
      model: load.model || '',
      year: load.year || 0,
      vin: load.vin,
      condition: load.condition || 'running' as const,
      vehicleAdditionalInfo: load.vehicleAdditionalInfo
    }];
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user) return;

    const allBookings = getBookings();
    const allLoads = JSON.parse(localStorage.getItem('posted_loads') || '[]');

    if (user.role === 'carrier') {
      // Get loads assigned to this carrier (booked, assigned, picked-up, etc.)
      const carrierBookings = allBookings.filter(
        (booking) => booking.carrierId === user.id && ['booked', 'assigned', 'picked-up'].includes(booking.status)
      );
      setAssignedBookings(carrierBookings);

      // Get the load details for these bookings
      const loadIds = carrierBookings.map(b => b.loadId);
      const carrierLoads = allLoads.filter((load: Load) => loadIds.includes(load.id));
      setLoads(carrierLoads);
    } else {
      // Get loads posted by this broker/dealer that have been assigned (booked, assigned, picked-up)
      const brokerLoads = allLoads.filter((load: Load) => load.brokerId === user.id);
      const brokerLoadIds = brokerLoads.map(l => l.id);
      const brokerBookings = allBookings.filter(
        (booking) => brokerLoadIds.includes(booking.loadId) && ['booked', 'assigned', 'picked-up'].includes(booking.status)
      );
      setAssignedBookings(brokerBookings);
      setLoads(brokerLoads);
    }
  };

  const getLoadById = (loadId: string): Load | undefined => {
    return loads.find(l => l.id === loadId);
  };

  const handleViewDetails = (load: Load, booking: LoadBooking) => {
    // Store the load and booking data for the detail view
    localStorage.setItem('view_load_details', JSON.stringify({ load, booking }));
    navigate(`/load-details/${load.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-amber-500">Assigned</Badge>;
      case 'in-transit':
        return <Badge className="bg-blue-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MapBackground />

      <div className="relative z-10">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assigned Loads</h1>
          <p className="text-muted-foreground">
            {user?.role === 'carrier'
              ? 'View and manage loads assigned to you'
              : 'View and manage loads you have assigned to carriers'}
          </p>
        </div>

        {assignedBookings.length === 0 ? (
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <Package className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Assigned Loads</h3>
              <p className="text-muted-foreground mb-4">
                {user?.role === 'carrier'
                  ? "You don't have any assigned loads at the moment."
                  : "You haven't assigned any loads to carriers yet."}
              </p>
              <Button onClick={() => navigate('/loads')} className="bg-amber-500 hover:bg-amber-600 text-white">
                Browse Load Board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignedBookings.map((booking) => {
              const load = getLoadById(booking.loadId);
              if (!load) return null;

              const perMileRate = load.distance > 0 ? (load.price / load.distance).toFixed(2) : '0.00';

              return (
                <Card
                  key={booking.id}
                  className="border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer"
                  onClick={() => handleViewDetails(load, booking)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {load.orderId && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(load, booking);
                            }}
                            className="mb-3 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 text-sm"
                          >
                            Order ID: {load.orderId}
                          </Button>
                        )}
                        {(() => {
                          const vehicles = getLoadVehicles(load);
                          if (vehicles.length === 1) {
                            const v = vehicles[0];
                            return (
                              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {v.year} {v.make} {v.model}
                              </CardTitle>
                            );
                          } else {
                            return (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Multi-Vehicle Load
                                  </CardTitle>
                                  <Badge className="bg-amber-600 text-white text-xs">
                                    {vehicles.length} Vehicles
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {vehicles.slice(0, 2).map((v, i) => `${v.year} ${v.make} ${v.model}`).join(' • ')}
                                  {vehicles.length > 2 && ` • +${vehicles.length - 2} more`}
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Route Display */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50/40 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 rounded-none border-2 border-amber-200/50 dark:border-amber-800/50">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="size-5 text-amber-600 dark:text-amber-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-xs text-amber-700 dark:text-amber-400">Pickup</div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{load.pickupCity}, {load.pickupState}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="size-3 text-amber-600 dark:text-amber-500" />
                                {new Date(load.pickupDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-amber-600 dark:text-amber-500">
                          <ArrowRight className="size-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="size-5 text-amber-600 dark:text-amber-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-xs text-amber-700 dark:text-amber-400">Delivery</div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{load.deliveryCity}, {load.deliveryState}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="size-3 text-amber-600 dark:text-amber-500" />
                                {new Date(load.deliveryDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                        <span className="font-bold text-lg text-amber-600 dark:text-amber-500">${load.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({load.distance} mi • ${perMileRate}/mi)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {user?.role === 'carrier' ? (
                          <>
                            <Building2 className="size-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Broker:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{booking.brokerName || 'N/A'}</span>
                          </>
                        ) : (
                          <>
                            <User className="size-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Carrier:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{booking.carrierName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {booking.bookedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="size-4" />
                        <span>Assigned: {new Date(booking.bookedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
