import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, Calendar, MapPin, Check, X } from 'lucide-react';

export function CarrierOffers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load offers from localStorage
    const allBookings = JSON.parse(localStorage.getItem('load_bookings') || '[]');
    const myOffers = allBookings.filter((booking: any) =>
      booking.carrierId === user.id && booking.status === 'assigned'
    );
    setOffers(myOffers);
  }, [user]);

  const handleAcceptOffer = (booking: any) => {
    const allBookings = JSON.parse(localStorage.getItem('load_bookings') || '[]');
    const updatedBookings = allBookings.map((b: any) =>
      b.id === booking.id ? { ...b, status: 'booked', bookedAt: new Date().toISOString() } : b
    );
    localStorage.setItem('load_bookings', JSON.stringify(updatedBookings));
    setOffers(offers.filter(o => o.id !== booking.id));
  };

  const handleDeclineOffer = (booking: any) => {
    const allBookings = JSON.parse(localStorage.getItem('load_bookings') || '[]');
    const updatedBookings = allBookings.filter((b: any) => b.id !== booking.id);
    localStorage.setItem('load_bookings', JSON.stringify(updatedBookings));
    setOffers(offers.filter(o => o.id !== booking.id));
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Load Offers</h1>
          <p className="text-muted-foreground">Loads directly assigned to you</p>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Offers</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any load offers at the moment.
              </p>
              <Button onClick={() => navigate('/loads')} className="bg-amber-500 hover:bg-amber-600 text-white">
                Browse Load Board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => {
              const postedLoads = JSON.parse(localStorage.getItem('posted_loads') || '[]');
              const load = postedLoads.find((l: any) => l.id === offer.loadId);
              if (!load) return null;

              // Get broker info
              const allUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
              const broker = allUsers.find((u: any) => u.id === load.brokerId);
              const brokerName = broker?.companyName || 'Unknown Broker';

              return (
                <Card key={offer.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {load.year} {load.make} {load.model}
                        </CardTitle>
                        <CardDescription>
                          From {brokerName}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-600">New Offer</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Pickup</div>
                          <div className="text-sm text-muted-foreground">
                            {load.pickupCity}, {load.pickupState}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="size-3" />
                            {new Date(load.pickupDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Delivery</div>
                          <div className="text-sm text-muted-foreground">
                            {load.deliveryCity}, {load.deliveryState}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="size-3" />
                            {new Date(load.deliveryDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-none">
                      <div className="text-2xl font-bold text-amber-600">
                        ${load.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {load.distance} miles
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAcceptOffer(offer)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <Check className="size-4 mr-2" />
                        Accept Offer
                      </Button>
                      <Button
                        onClick={() => handleDeclineOffer(offer)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="size-4 mr-2" />
                        Decline
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
