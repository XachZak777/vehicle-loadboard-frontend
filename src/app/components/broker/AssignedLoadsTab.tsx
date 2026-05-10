import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Truck, MapPin, DollarSign, X, Star, CheckCircle } from 'lucide-react';
import { CarrierInfoInline } from './CarrierInfoInline';
import { RateModal } from '../RateModal';
import { useGetCarrierPublicInfoQuery } from '../../store/services/hauliusApi';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';

const COMPLETED_STATUSES = ['DELIVERED', 'PAID', 'COMPLETED'];

function AssignedLoadCard({
  load,
  getStatusBadge,
  onCancelBooking,
  actionLoading,
}: {
  load: LoadDto;
  getStatusBadge: (load: LoadDto) => ReactNode;
  onCancelBooking: (load: LoadDto) => void;
  actionLoading: boolean;
}) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const { data: carrierInfo } = useGetCarrierPublicInfoQuery(load.assignedCarrierId ?? '', {
    skip: !load.assignedCarrierId || load.assignedCarrierId === 'mock-carrier-001',
  });
  const carrierName = load.assignedCarrierId === 'mock-carrier-001'
    ? 'Swift Logistics LLC'
    : (carrierInfo?.companyName || carrierInfo?.legalName || 'the carrier');
  const vehicleTitle = [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || `Load #${load.id.slice(0, 8)}`;
  const isCompleted = COMPLETED_STATUSES.includes(load.status ?? '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{vehicleTitle}</CardTitle>
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
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancelBooking(load)}
            disabled={actionLoading}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel Booking
          </Button>
          {isCompleted && load.assignedCarrierId && (
            ratingSubmitted ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle className="size-4" />
                Rating Submitted
              </span>
            ) : (
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setRatingOpen(true)}
              >
                <Star className="size-3.5 mr-1.5" />
                Rate Carrier
              </Button>
            )
          )}
        </div>
      </CardContent>

      {load.assignedCarrierId && (
        <RateModal
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          onSubmitted={() => setRatingSubmitted(true)}
          targetId={load.assignedCarrierId}
          targetType="carrier"
          targetName={carrierName}
          loadId={load.id}
          vehicleTitle={vehicleTitle}
        />
      )}
    </Card>
  );
}

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
        <AssignedLoadCard
          key={load.id}
          load={load}
          getStatusBadge={getStatusBadge}
          onCancelBooking={onCancelBooking}
          actionLoading={actionLoading}
        />
      ))}
    </>
  );
}
