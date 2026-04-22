import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Truck, MapPin, DollarSign, X } from 'lucide-react';
import { CarrierInfoInline } from './CarrierInfoInline';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';

interface Props {
  assignedLoads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onCancelBooking: (load: LoadDto) => void;
  actionLoading: boolean;
}

export function AssignedLoadsTab({ assignedLoads, getStatusBadge, onCancelBooking, actionLoading }: Props) {
  if (assignedLoads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No assigned loads yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {assignedLoads.map(load => (
        <Card key={load.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {load.assignedCarrierId
                    ? <CarrierInfoInline carrierId={load.assignedCarrierId} />
                    : 'No carrier assigned'}
                </div>
              </div>
              {getStatusBadge(load)}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}</span>
            </div>
            {load.price != null && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">${load.price.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancelBooking(load)}
                disabled={actionLoading}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
