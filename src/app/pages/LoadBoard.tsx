import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useGetLoadsQuery } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Truck, MapPin, Filter, Loader2 } from 'lucide-react';

export function LoadBoard() {
  const { data: loads = [], isLoading, isError, error, refetch } = useGetLoadsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const fetchError = isError ? ((error as any)?.message || 'Failed to load data.') : '';

  const filteredLoads = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return loads.filter((load) => {
      const matchesSearch = !q ||
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
  }, [loads, searchTerm, stateFilter]);

  const states = useMemo(() => {
    const stateSet = new Set<string>();
    loads.forEach(load => {
      if (load.pickupState) stateSet.add(load.pickupState);
      if (load.dropState) stateSet.add(load.dropState);
    });
    return Array.from(stateSet).sort();
  }, [loads]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="size-5" />
              Filter Loads
            </CardTitle>
            <CardDescription>Refine your search to find the perfect loads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Search</label>
                <Input
                  placeholder="Search by make, model, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">State</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="size-6 animate-spin text-amber-500" />
            <span className="text-muted-foreground">Loading loads…</span>
          </div>
        )}

        {!isLoading && fetchError && (
          <Card className="mb-6 bg-destructive/10 border-destructive/30">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">{fetchError}</p>
              <Button onClick={() => refetch()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">Retry</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !fetchError && (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-amber-600">{filteredLoads.length}</span> available load{filteredLoads.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredLoads.map((load) => (
                <Card key={load.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle Transport'}
                            </h3>
                            {load.status && (
                              <Badge variant="outline" className="capitalize mt-1">
                                {load.status}
                              </Badge>
                            )}
                          </div>
                          {load.price != null && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-amber-600">
                                ${load.price.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-foreground">Pickup</div>
                              <div className="text-sm text-muted-foreground">
                                {[load.pickupCity, load.pickupState].filter(Boolean).join(', ') || '—'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-foreground">Delivery</div>
                              <div className="text-sm text-muted-foreground">
                                {[load.dropCity, load.dropState].filter(Boolean).join(', ') || '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {load.description && (
                          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
                            <p className="text-sm text-foreground">
                              <span className="font-medium text-amber-600">Note:</span> {load.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Link to={`/load/${load.id}`} className="flex-1 lg:flex-none">
                          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLoads.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Truck className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No loads found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search terms to find available loads.
                    </p>
                    <Button
                      onClick={() => { setSearchTerm(''); setStateFilter('all'); }}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
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