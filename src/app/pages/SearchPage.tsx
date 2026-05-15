import { useSearchParams, useNavigate } from 'react-router';
import { Building2, MapPin, Phone, Shield, Truck, ThumbsUp, Search, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useSearchBrokersQuery, useSearchCarriersQuery } from '../store/services/hauliusApi';
import type { BrokerPublicInfo, CarrierPublicInfo } from '../store/services/hauliusApi';
import { MapBackground } from '../components/MapBackground';

function ScoreBar({ score, total }: { score: number; total: number }) {
  if (total === 0) return <span className="text-xs text-muted-foreground">No ratings</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted overflow-hidden">
        <div className="h-full bg-amber-400" style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-amber-600 flex-shrink-0">{score}%</span>
      <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">({total})</span>
    </div>
  );
}

function BrokerCard({ broker }: { broker: BrokerPublicInfo }) {
  const navigate = useNavigate();
  const name = broker.companyName || broker.legalName || 'Unknown Broker';
  const location = [broker.city, broker.state].filter(Boolean).join(', ');
  const ratingScore = broker.ratingScore ?? null;

  return (
    <Card
      className="border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition-all duration-150"
      onClick={() => broker.id && navigate(`/company/broker/${broker.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Building2 className="size-5 text-amber-600 dark:text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-base leading-tight truncate">{name}</p>
                {location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="size-3 flex-shrink-0" /> {location}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-[11px] border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 flex-shrink-0">
                Broker
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {broker.mcNumber && (
                <span className="flex items-center gap-1"><Shield className="size-3" /> MC: {broker.mcNumber}</span>
              )}
              {broker.dotNumber && (
                <span className="flex items-center gap-1"><Shield className="size-3" /> DOT: {broker.dotNumber}</span>
              )}
              {broker.phoneNumber && (
                <span className="flex items-center gap-1 col-span-2"><Phone className="size-3" /> {broker.phoneNumber}</span>
              )}
            </div>
            {ratingScore !== null && (
              <div className="mt-2 flex items-center gap-2">
                <ThumbsUp className="size-3 text-amber-500 flex-shrink-0" />
                <ScoreBar score={ratingScore} total={1} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CarrierCard({ carrier }: { carrier: CarrierPublicInfo }) {
  const navigate = useNavigate();
  const name = carrier.companyName || carrier.legalName || carrier.dbaName || 'Unknown Carrier';
  const location = [carrier.phyCity, carrier.phyState].filter(Boolean).join(', ');
  const ratingScore = carrier.ratingScore ?? null;

  return (
    <Card
      className="border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition-all duration-150"
      onClick={() => carrier.id && navigate(`/company/carrier/${carrier.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Truck className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-base leading-tight truncate">{name}</p>
                {location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="size-3 flex-shrink-0" /> {location}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-[11px] flex-shrink-0">
                Carrier
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {carrier.mcNumber && (
                <span className="flex items-center gap-1"><Shield className="size-3" /> MC: {carrier.mcNumber}</span>
              )}
              {carrier.dotNumber && (
                <span className="flex items-center gap-1"><Shield className="size-3" /> DOT: {carrier.dotNumber}</span>
              )}
              {carrier.safetyRating && (
                <span className="flex items-center gap-1"><Shield className="size-3" /> Safety: {carrier.safetyRating}</span>
              )}
              {carrier.totalPowerUnits != null && (
                <span className="flex items-center gap-1"><Truck className="size-3" /> {carrier.totalPowerUnits} units</span>
              )}
            </div>
            {ratingScore !== null && (
              <div className="mt-2 flex items-center gap-2">
                <ThumbsUp className="size-3 text-amber-500 flex-shrink-0" />
                <ScoreBar score={ratingScore} total={1} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const skip = q.length < 2;
  const { data: brokers = [], isLoading: loadingBrokers } = useSearchBrokersQuery(q, { skip });
  const { data: carriers = [], isLoading: loadingCarriers } = useSearchCarriersQuery(q, { skip });

  const isLoading = loadingBrokers || loadingCarriers;
  const hasResults = brokers.length > 0 || carriers.length > 0;

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {q ? `Search results for "${q}"` : 'Company Search'}
          </h1>
          {!skip && !isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {brokers.length + carriers.length} {brokers.length + carriers.length === 1 ? 'company' : 'companies'} found
            </p>
          )}
        </div>

        {skip && (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="size-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Type at least 2 characters to search</p>
            <p className="text-sm mt-1">Use the search bar above to find brokers and carriers</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!skip && !isLoading && !hasResults && (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="size-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No companies found for "{q}"</p>
            <p className="text-sm mt-1">Try a different company name, MC number, or DOT number</p>
          </div>
        )}

        {!isLoading && hasResults && (
          <div className="space-y-6">
            {brokers.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Building2 className="size-3.5" /> Brokers ({brokers.length})
                </h2>
                <div className="space-y-3">
                  {brokers.map((b) => (
                    <BrokerCard key={b.id ?? b.mcNumber} broker={b} />
                  ))}
                </div>
              </section>
            )}

            {carriers.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Truck className="size-3.5" /> Carriers ({carriers.length})
                </h2>
                <div className="space-y-3">
                  {carriers.map((c) => (
                    <CarrierCard key={c.id ?? c.dotNumber} carrier={c} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
