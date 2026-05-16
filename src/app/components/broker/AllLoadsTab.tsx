import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Calendar, Edit, Trash2, Users, Copy } from 'lucide-react';
import { LoadWithBidsLoader } from './LoadWithBidsLoader';
import { AssignCarrierModal } from './AssignCarrierModal';
import type { LoadDto } from '../../store/services/hauliusApi';
import type { ReactNode } from 'react';
import { colors } from '../../styles/colors';
import { useAppSelector } from '../../store/hooks';
import { useGetMyBrokerProfileQuery } from '../../store/services/hauliusApi';

interface Props {
  loads: LoadDto[];
  getStatusBadge: (load: LoadDto) => ReactNode;
  onDeleteLoad: (load: LoadDto) => void;
  actionLoading: boolean;
}


export function AllLoadsTab({ loads, getStatusBadge, onDeleteLoad, actionLoading }: Props) {
  const [assignLoad, setAssignLoad] = useState<LoadDto | null>(null);
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isBroker = user?.role === 'broker';
  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const companyName = brokerProfile?.legalName || brokerProfile?.companyName || user?.companyName;
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
            <Card className={`border-2 ${colors.borderDualMode} ${colors.accentHoverCard} transition-all duration-200`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {load.vehicleYear} {load.vehicleMake} {load.vehicleModel}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {load.pickupCity}, {load.pickupState} → {load.dropCity}, {load.dropState}
                    </p>
                    {companyName && (
                      <div className={`flex items-center gap-1 mt-1.5 text-xs ${colors.accentTextStrong} font-medium`}>
                        <Building2 className="h-3 w-3" />
                        <span>{companyName}</span>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(load)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    {load.createdAt && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(load.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {load.price != null && (
                      <span className="font-semibold">${load.price.toLocaleString()}</span>
                    )}
                    <span className="text-muted-foreground">
                      {loadWithBids.bids.length} {loadWithBids.bids.length === 1 ? 'bid' : 'bids'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {load.status === 'OPEN' && (
                      <Button
                        variant="ghost" size="sm"
                        className={`h-8 w-8 p-0 ${colors.accentText}`}
                        onClick={() => setAssignLoad(load)}
                        disabled={actionLoading}
                        title="Assign Carrier"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${colors.accentText}`} asChild>
                      <Link to={`/broker/edit-load/${load.id}`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-8 w-8 p-0 ${colors.accentText}`}
                      onClick={() => navigate('/post-load', { state: { cloneFrom: load } })}
                      disabled={actionLoading}
                      title="Clone Load"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-8 w-8 p-0 ${colors.accentText}`}
                      onClick={() => onDeleteLoad(load)}
                      disabled={actionLoading}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
