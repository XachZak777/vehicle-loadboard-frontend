import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  useGetLoadsQuery,
  useGetBrokerPublicInfoQuery,
} from '../store/services/hauliusApi';
import type { LoadDto } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Truck, MapPin, Filter, Loader2, Star } from 'lucide-react';

// Set to true to show a mock load card for UI testing (no backend needed)
const USE_MOCK = false;

const MOCK_LOAD: LoadDto = {
  id: 'mock-load-001',
  brokerId: 'mock-broker',
  pickupCity: 'Los Angeles',
  pickupState: 'CA',
  pickupZip: '90001',
  dropCity: 'Phoenix',
  dropState: 'AZ',
  dropZip: '85001',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  vehicleYear: 2022,
  price: 850,
  pickupDate: '2026-05-20',
  status: 'OPEN',
};

function BrokerHeaderInline({ brokerId }: { brokerId: string }) {
  const navigate = useNavigate();
  const { data } = useGetBrokerPublicInfoQuery(brokerId, { skip: brokerId === 'mock-broker' });
  const name = brokerId === 'mock-broker' ? 'Swift Logistics LLC' : (data?.companyName || data?.legalName || 'Unknown Company');

  return (
    <div
      className='flex items-center justify-between px-5 py-2.5 border-b border-border bg-muted/30 cursor-pointer'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/company/broker/${brokerId}`);
      }}
    >
      <span className='text-sm font-semibold text-amber-600 hover:underline'>
        {name}
      </span>
      <span className='flex items-center gap-1 text-sm text-muted-foreground'>
        <Star className='size-3.5 fill-amber-400 text-amber-400' />
        0%
      </span>
    </div>
  );
}

function fmtPickupDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function LoadBoard() {
  const {
    data: loads = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetLoadsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const fetchError = isError
    ? (error as any)?.message || 'Failed to load data.'
    : '';

  const filteredLoads = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const apiFiltered = loads.filter((load) => {
      const matchesSearch =
        !q ||
        (load.vehicleMake ?? '').toLowerCase().includes(q) ||
        (load.vehicleModel ?? '').toLowerCase().includes(q) ||
        (load.pickupCity ?? '').toLowerCase().includes(q) ||
        (load.dropCity ?? '').toLowerCase().includes(q) ||
        (load.pickupState ?? '').toLowerCase().includes(q) ||
        (load.dropState ?? '').toLowerCase().includes(q);

      const matchesState =
        stateFilter === 'all' ||
        load.pickupState === stateFilter ||
        load.dropState === stateFilter;

      const isOpen = !load.status || load.status === 'OPEN';
      return matchesSearch && matchesState && isOpen;
    });
    return USE_MOCK ? [MOCK_LOAD, ...apiFiltered] : apiFiltered;
  }, [loads, searchTerm, stateFilter]);

  const states = useMemo(() => {
    const stateSet = new Set<string>();
    loads.forEach((load) => {
      if (load.pickupState) stateSet.add(load.pickupState);
      if (load.dropState) stateSet.add(load.dropState);
    });
    return Array.from(stateSet).sort();
  }, [loads]);

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filters */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='size-5' />
              Filter Loads
            </CardTitle>
            <CardDescription>
              Refine your search to find the perfect loads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium mb-2 block text-foreground'>
                  Search
                </label>
                <Input
                  placeholder='Search by make, model, or city...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block text-foreground'>
                  State
                </label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {isLoading && (
          <div className='flex items-center justify-center py-16 gap-3'>
            <Loader2 className='size-6 animate-spin text-amber-500' />
            <span className='text-muted-foreground'>Loading loads…</span>
          </div>
        )}

        {/* {!isLoading && fetchError && (
          <Card className="mb-6 bg-destructive/10 border-destructive/30">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">{fetchError}</p>
              <Button onClick={() => refetch()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">Retry</Button>
            </CardContent>
          </Card>
        )} */}

        {!isLoading && !fetchError && (
          <>
            <div className='mb-4'>
              <p className='text-sm text-muted-foreground'>
                Showing{' '}
                <span className='font-semibold text-amber-600'>
                  {filteredLoads.length}
                </span>{' '}
                available load{filteredLoads.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              {filteredLoads.map((load) => (
                <Link
                  key={load.id}
                  to={`/load/${load.id}`}
                  className='block group'
                >
                  <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
                    {/* Company header */}
                    {load.brokerId && (
                      <BrokerHeaderInline brokerId={load.brokerId} />
                    )}

                    <CardContent className='p-0'>
                      {/* Vehicle + price row */}
                      <div className='flex items-center justify-between px-5 py-3 border-b border-border'>
                        <h3 className='text-base font-bold text-foreground'>
                          {[
                            load.vehicleYear,
                            load.vehicleMake,
                            load.vehicleModel,
                          ]
                            .filter(Boolean)
                            .join(' ') || 'Vehicle Transport'}
                        </h3>
                        {load.price != null && (
                          <div className='text-right'>
                            <div className='text-xl font-bold text-foreground'>
                              ${load.price.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Route row */}
                      <div className='flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1.5'>
                          <MapPin className='size-4 text-muted-foreground flex-shrink-0' />
                          <div>
                            <div>
                              {[
                                load.pickupCity,
                                load.pickupState,
                                load.pickupZip,
                              ]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </div>
                            {load.pickupDate && (
                              <div className='text-xs'>
                                {fmtPickupDate(load.pickupDate)}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className='text-muted-foreground'>→</span>
                        <div className='flex items-center gap-1.5'>
                          <MapPin className='size-4 text-muted-foreground flex-shrink-0' />
                          <div>
                            <div>
                              {[load.dropCity, load.dropState]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </div>
                            {load.deliveryDate && (
                              <div className='text-xs'>
                                {fmtPickupDate(load.deliveryDate)}
                              </div>
                            )}
                          </div>
                        </div>
                        {load.description && (
                          <div className='ml-auto hidden md:block text-xs italic truncate max-w-xs'>
                            {load.description}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {filteredLoads.length === 0 && (
                <Card>
                  <CardContent className='p-12 text-center'>
                    <Truck className='size-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-foreground mb-2'>
                      No loads found
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                      Try adjusting your filters or search terms to find
                      available loads.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setStateFilter('all');
                      }}
                      className='bg-amber-500 hover:bg-amber-600 text-white font-semibold'
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
