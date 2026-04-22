import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, DollarSign } from 'lucide-react';
import { LoadWithBidsLoader } from './LoadWithBidsLoader';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';

interface Props {
  loads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onDeleteLoad: (load: LoadDto) => void;
  actionLoading: boolean;
}

export function AllLoadsTab({ loads, getStatusBadge, onDeleteLoad, actionLoading }: Props) {
  if (loads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">You haven't posted any loads yet</p>
          <Button asChild>
            <Link to="/post-load">Post Your First Load</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {loads.map(load => (
        <LoadWithBidsLoader key={load.id} load={load}>
          {(loadWithBids) => (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}
                    </p>
                  </div>
                  {getStatusBadge(load)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {load.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(load.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {load.price != null && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">${load.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {loadWithBids.bids.length} {loadWithBids.bids.length === 1 ? 'bid' : 'bids'}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/broker/edit-load/${load.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteLoad(load)}
                      disabled={actionLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </LoadWithBidsLoader>
      ))}
    </>
  );
}
