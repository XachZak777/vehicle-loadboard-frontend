import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, MapPin, DollarSign, Check } from 'lucide-react';
import { CarrierInfoInline } from './CarrierInfoInline';
import { LoadWithBidsLoader } from './LoadWithBidsLoader';
import type { LoadDto, BidDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';

interface Props {
  openLoads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onApproveBid: (load: LoadDto, bid: BidDto) => void;
  actionLoading: boolean;
}

export function PendingBidsTab({ openLoads, getStatusBadge, onApproveBid, actionLoading }: Props) {
  if (openLoads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No pending bids right now</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {openLoads.map(load => (
        <LoadWithBidsLoader key={load.id} load={load}>
          {(loadWithBids) => {
            const pendingBids = loadWithBids.bids.filter(b => b.status === 'PENDING');
            if (pendingBids.length === 0) return null;
            return (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}
                      </div>
                    </div>
                    {getStatusBadge(load)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h4 className="font-semibold text-sm">Incoming Bids</h4>
                  {pendingBids.map(bid => (
                    <div key={bid.id} className="flex items-start justify-between p-3 bg-muted rounded-lg gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="font-semibold">${bid.amount.toLocaleString()}</span>
                          {bid.bookNow && (
                            <Badge variant="outline" className="text-xs">Book Now</Badge>
                          )}
                        </div>
                        <CarrierInfoInline carrierId={bid.carrierId} />
                        {bid.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onApproveBid(load, bid)}
                        disabled={actionLoading}
                        className="flex-shrink-0"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          }}
        </LoadWithBidsLoader>
      ))}
    </>
  );
}
