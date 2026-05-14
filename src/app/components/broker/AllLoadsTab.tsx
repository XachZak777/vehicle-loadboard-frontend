import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Calendar, DollarSign, Edit, MoreVertical, Trash2, Users } from 'lucide-react';
import { LoadWithBidsLoader } from './LoadWithBidsLoader';
import { AssignCarrierModal } from './AssignCarrierModal';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';

interface Props {
  loads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onDeleteLoad: (load: LoadDto) => void;
  actionLoading: boolean;
}


export function AllLoadsTab({ loads, getStatusBadge, onDeleteLoad, actionLoading }: Props) {
  const [assignLoad, setAssignLoad] = useState<LoadDto | null>(null);
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
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={actionLoading}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {load.status === 'OPEN' && (
                          <>
                            <DropdownMenuItem onClick={() => setAssignLoad(load)}>
                              <Users className="h-4 w-4 mr-2 text-amber-500" />
                              Assign Carrier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/broker/edit-load/${load.id}`} className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteLoad(load)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </LoadWithBidsLoader>
      ))}

      {assignLoad && (
        <AssignCarrierModal
          load={assignLoad}
          open={!!assignLoad}
          onClose={() => setAssignLoad(null)}
        />
      )}
    </>
  );
}
