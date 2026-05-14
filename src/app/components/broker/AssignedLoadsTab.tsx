import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Truck, MapPin, DollarSign, X, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { CarrierInfoInline } from './CarrierInfoInline';
import { RateModal } from '../RateModal';
import { useGetCarrierPublicInfoQuery, useGetMySubmittedLoadIdsQuery } from '../../store/services/hauliusApi';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';

const RATEABLE_STATUSES = new Set(['DELIVERED', 'PAID', 'COMPLETED']);

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
  const [ratingSubmittedLocal, setRatingSubmittedLocal] = useState(false);
  const { data: carrierInfo } = useGetCarrierPublicInfoQuery(load.assignedCarrierId ?? '', {
    skip: !load.assignedCarrierId || load.assignedCarrierId === 'mock-carrier-001',
  });
  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery();
  const alreadyRated = ratingSubmittedLocal || (submittedLoadIds?.includes(load.id) ?? false);
  const canRate = !!load.assignedCarrierId && RATEABLE_STATUSES.has(load.status ?? '');
  const carrierName = load.assignedCarrierId === 'mock-carrier-001'
    ? 'Swift Logistics LLC'
    : (carrierInfo?.companyName || carrierInfo?.legalName || 'the carrier');
  const vehicleTitle = [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || `Load #${load.id.slice(0, 8)}`;

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
      <CardContent className="space-y-3">
        {/* Route display */}
        <div className="p-3 bg-gradient-to-r from-amber-50/40 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <MapPin className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{load.pickupCity}, {load.pickupState}</span>
            </div>
            <ArrowRight className="size-4 text-amber-500 flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <MapPin className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{load.dropCity}, {load.dropState}</span>
            </div>
          </div>
        </div>
        {load.price != null && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-amber-600 dark:text-amber-500">${load.price.toLocaleString()}</span>
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
          {canRate && (
            alreadyRated ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
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

      {canRate && !alreadyRated && (
        <RateModal
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          onSubmitted={() => setRatingSubmittedLocal(true)}
          targetId={load.assignedCarrierId!}
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
