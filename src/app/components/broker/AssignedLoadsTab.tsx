import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Truck, MapPin, X, Star, CheckCircle, Eye, Hash } from 'lucide-react';
import { CarrierInfoInline } from './CarrierInfoInline';
import { RateModal } from '../RateModal';
import { useGetCarrierPublicInfoQuery, useGetMySubmittedLoadIdsQuery, useGetBidsForLoadQuery } from '../../store/services/hauliusApi';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';
import { colors } from '../../styles/colors';
import { MessageSquare } from 'lucide-react';

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
    skip: !load.assignedCarrierId,
  });
  const { data: submittedLoadIds } = useGetMySubmittedLoadIdsQuery();
  const { data: bids = [] } = useGetBidsForLoadQuery(load.id);
  const approvedBid = bids.find(b => b.status === 'APPROVED');
  const alreadyRated = ratingSubmittedLocal || (submittedLoadIds?.includes(load.id) ?? false);
  const canRate = !!load.assignedCarrierId && RATEABLE_STATUSES.has(load.status ?? '');
  const carrierName = carrierInfo?.companyName || carrierInfo?.legalName || 'the carrier';
  const isMulti = load.additionalVehicles && load.additionalVehicles.length > 0;
  const vehicleTitle = isMulti
    ? `Multi-Vehicle Load (${1 + load.additionalVehicles!.length})`
    : [load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || `Load #${load.id.slice(0, 8)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            {load.orderId && (
              <Link
                to={`/load/${load.id}`}
                className="inline-flex items-center gap-1 mb-1.5 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
              >
                <Hash className="size-3" />
                {load.orderId}
              </Link>
            )}
            <CardTitle className="text-lg">{vehicleTitle}</CardTitle>
            {isMulti && (
              <div className="mt-0.5 space-y-0.5">
                <p className="text-sm text-foreground/80">
                  {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ')}
                </p>
                {load.additionalVehicles!.map((v, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {[v.vehicleYear, v.vehicleMake, v.vehicleModel].filter(Boolean).join(' ')}
                  </p>
                ))}
              </div>
            )}
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
        {(() => {
          const pickupQ = [load.pickupCity, load.pickupState].filter(Boolean).join(', ');
          const dropQ = [load.dropCity, load.dropState].filter(Boolean).join(', ');
          const pickupUrl = pickupQ ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupQ + ', USA')}` : null;
          const dropUrl = dropQ ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropQ + ', USA')}` : null;
          return (
            <div className="p-3 bg-gradient-to-r from-amber-50/40 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50 space-y-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className={`size-4 ${colors.accentTextStrong} dark:${colors.accentText} flex-shrink-0`} />
                {pickupUrl ? (
                  <a href={pickupUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate hover:underline hover:text-amber-600 transition-colors">
                    {load.pickupCity}, {load.pickupState}
                  </a>
                ) : (
                  <span className="text-sm font-medium truncate">{load.pickupCity}, {load.pickupState}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className={`size-4 ${colors.accentTextStrong} dark:${colors.accentText} flex-shrink-0`} />
                {dropUrl ? (
                  <a href={dropUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate hover:underline hover:text-amber-600 transition-colors">
                    {load.dropCity}, {load.dropState}
                  </a>
                ) : (
                  <span className="text-sm font-medium truncate">{load.dropCity}, {load.dropState}</span>
                )}
              </div>
            </div>
          );
        })()}
        {approvedBid?.notes && (
          <div className="flex items-start gap-2 p-2.5 bg-muted/50 border border-border rounded">
            <MessageSquare className="size-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Carrier Notes</p>
              <p className="text-xs text-foreground leading-relaxed">{approvedBid.notes}</p>
            </div>
          </div>
        )}
        {load.price != null && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-bold ${colors.accentTextStrong} dark:${colors.accentText}`}>${load.price.toLocaleString()}</span>
          </div>
        )}
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <Link to={`/load/${load.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="size-3.5" />
              View Load
            </Button>
          </Link>
          {(load.status === 'ASSIGNED' || load.status === 'PICKED_UP') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancelBooking(load)}
              disabled={actionLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel Booking
            </Button>
          )}
          {canRate && (
            alreadyRated ? (
              <span className={`flex items-center gap-1.5 text-sm font-medium ${colors.accentTextStrong}`}>
                <CheckCircle className="size-4" />
                Rating Submitted
              </span>
            ) : (
              <Button
                size="sm"
                className={colors.accentBtn}
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
