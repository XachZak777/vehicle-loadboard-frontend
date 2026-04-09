import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useGetLoadsQuery } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Truck, MapPin, Filter, Loader2 } from 'lucide-react';

export function LoadBoard() {
  const theme = useAppSelector((s) => s.theme.theme);
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
    <div className={theme === 'dark' ? 'min-h-screen bg-slate-900' : 'min-h-screen bg-gray-50'}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className={theme === 'dark' ? 'mb-6 bg-slate-800 border-slate-700' : 'mb-6 bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'flex items-center gap-2 text-white' : 'flex items-center gap-2 text-gray-900'}>
              <Filter className="size-5" />
              Filter Loads
            </CardTitle>
            <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Refine your search to find the perfect loads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={theme === 'dark' ? 'text-sm font-medium mb-2 block text-slate-300' : 'text-sm font-medium mb-2 block text-gray-700'}>Search</label>
                <Input
                  placeholder="Search by make, model, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={theme === 'dark' ? 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'}
                />
              </div>
              <div>
                <label className={theme === 'dark' ? 'text-sm font-medium mb-2 block text-slate-300' : 'text-sm font-medium mb-2 block text-gray-700'}>State</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className={theme === 'dark' ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}>
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
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Loading loads…</span>
          </div>
        )}

        {!isLoading && fetchError && (
          <Card className={theme === 'dark' ? 'mb-6 bg-red-900/20 border-red-500/30' : 'mb-6 bg-red-50 border-red-200'}>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 font-medium">{fetchError}</p>
              <Button onClick={() => refetch()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">Retry</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !fetchError && (
          <>
            <div className="mb-4">
              <p className={theme === 'dark' ? 'text-sm text-slate-400' : 'text-sm text-gray-600'}>
                Showing <span className={theme === 'dark' ? 'font-semibold text-amber-500' : 'font-semibold text-amber-600'}>{filteredLoads.length}</span> available load{filteredLoads.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredLoads.map((load) => (
                <Card key={load.id} className={theme === 'dark' ? 'hover:shadow-lg transition-shadow bg-slate-800 border-slate-700' : 'hover:shadow-lg transition-shadow bg-white border-gray-200'}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className={theme === 'dark' ? 'text-xl font-semibold text-white' : 'text-xl font-semibold text-gray-900'}>
                              {[load.vehicleYear, load.vehicleMake, load.vehicleModel].filter(Boolean).join(' ') || 'Vehicle Transport'}
                            </h3>
                            {load.status && (
                              <Badge variant="outline" className={theme === 'dark' ? 'capitalize border-slate-600 text-slate-300 mt-1' : 'capitalize border-gray-300 text-gray-700 mt-1'}>
                                {load.status}
                              </Badge>
                            )}
                          </div>
                          {load.price != null && (
                            <div className="text-right">
                              <div className={theme === 'dark' ? 'text-2xl font-bold text-amber-500' : 'text-2xl font-bold text-amber-600'}>
                                ${load.price.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-start gap-2">
                            <MapPin className={theme === 'dark' ? 'size-5 text-amber-500 mt-0.5 flex-shrink-0' : 'size-5 text-amber-600 mt-0.5 flex-shrink-0'} />
                            <div>
                              <div className={theme === 'dark' ? 'text-sm font-medium text-slate-300' : 'text-sm font-medium text-gray-700'}>Pickup</div>
                              <div className={theme === 'dark' ? 'text-sm text-slate-400' : 'text-sm text-gray-600'}>
                                {[load.pickupCity, load.pickupState].filter(Boolean).join(', ') || '—'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className={theme === 'dark' ? 'size-5 text-amber-500 mt-0.5 flex-shrink-0' : 'size-5 text-amber-600 mt-0.5 flex-shrink-0'} />
                            <div>
                              <div className={theme === 'dark' ? 'text-sm font-medium text-slate-300' : 'text-sm font-medium text-gray-700'}>Delivery</div>
                              <div className={theme === 'dark' ? 'text-sm text-slate-400' : 'text-sm text-gray-600'}>
                                {[load.dropCity, load.dropState].filter(Boolean).join(', ') || '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {load.description && (
                          <div className={theme === 'dark' ? 'mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md' : 'mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md'}>
                            <p className={theme === 'dark' ? 'text-sm text-slate-300' : 'text-sm text-gray-700'}>
                              <span className={theme === 'dark' ? 'font-medium text-amber-500' : 'font-medium text-amber-700'}>Note:</span> {load.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Link to={`/load/${load.id}`} className="flex-1 lg:flex-none">
                          <Button variant="default" className={theme === 'dark' ? 'w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold' : 'w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold'}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLoads.length === 0 && (
                <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}>
                  <CardContent className="p-12 text-center">
                    <Truck className={theme === 'dark' ? 'size-12 text-slate-600 mx-auto mb-4' : 'size-12 text-gray-400 mx-auto mb-4'} />
                    <h3 className={theme === 'dark' ? 'text-lg font-semibold text-white mb-2' : 'text-lg font-semibold text-gray-900 mb-2'}>No loads found</h3>
                    <p className={theme === 'dark' ? 'text-slate-400 mb-4' : 'text-gray-600 mb-4'}>
                      Try adjusting your filters or search terms to find available loads.
                    </p>
                    <Button onClick={() => { setSearchTerm(''); setStateFilter('all'); }}
                      className={theme === 'dark' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold' : 'bg-amber-600 hover:bg-amber-700 text-white font-semibold'}>
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