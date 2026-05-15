import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Shield, Truck,
  ThumbsUp, ThumbsDown, Star, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  useGetBrokerPublicInfoQuery,
  useGetCarrierPublicInfoQuery,
  useGetCompanyRatingsQuery,
} from '../store/services/hauliusApi';
import type { BrokerPublicInfo, CarrierPublicInfo, MyRatingsResponse } from '../store/services/hauliusApi';
import { formatPhone } from '../utils/phone';
import { MapBackground } from '../components/MapBackground';

const TAG_LABELS: Record<string, string> = {
  communication: 'Proper Communication',
  payment: 'On-Time Payment',
  accuracy: 'Accurate Load Details',
  on_time: 'On-Time Pickup & Delivery',
  safe_delivery: 'Vehicle Delivered Safely',
  professional: 'Professional Service',
};

function fmtDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function RatingScoreBadge({ score, total }: { score: number; total: number }) {
  if (total === 0) return <span className="text-sm text-muted-foreground">No ratings yet</span>;
  const color = score >= 80 ? 'text-amber-600' : score >= 50 ? 'text-muted-foreground' : 'text-orange-500';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement';
  return (
    <div className="flex items-center gap-2">
      <span className={`text-3xl font-bold ${color}`}>{score}%</span>
      <div>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-xs text-muted-foreground">Based on {total} rating{total !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, href }: {
  icon: React.ElementType; label: string; value?: string | null; href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="size-7 bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-medium text-foreground hover:text-amber-600 transition-colors break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

function CompanyPageContent({
  type,
  info,
  ratings,
  infoLoading,
}: {
  type: 'Broker' | 'Carrier';
  info?: BrokerPublicInfo | CarrierPublicInfo | null;
  ratings?: MyRatingsResponse | null;
  infoLoading: boolean;
}) {
  const navigate = useNavigate();

  const positive = ratings?.positiveCount ?? 0;
  const negative = ratings?.negativeCount ?? 0;
  const total = positive + negative;
  const score = total > 0 ? Math.round((positive / total) * 100) : 0;
  const tagStats = ratings?.tagStats ?? [];
  const ratingList = ratings?.ratings ?? [];

  const name = info?.companyName || info?.legalName || (infoLoading ? '' : 'Unknown Company');
  const city = type === 'Carrier'
    ? (info as CarrierPublicInfo)?.phyCity
    : (info as BrokerPublicInfo)?.city;
  const state = type === 'Carrier'
    ? (info as CarrierPublicInfo)?.phyState
    : (info as BrokerPublicInfo)?.state;
  const location = [city, state].filter(Boolean).join(', ');

  const operatingStatus = info?.operatingStatus;
  const isActive = operatingStatus?.toUpperCase().includes('ACTIVE') || operatingStatus?.toUpperCase().includes('AUTHORIZED');

  return (
    <div className="space-y-5">
      {/* Back */}
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4 mr-1" /> Back
      </Button>

      {/* Header */}
      <Card className="border-2 border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/40 to-orange-50/20 dark:from-amber-950/20 dark:to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-14 bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Building2 className="size-7 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[11px] border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                  {type}
                </Badge>
                {operatingStatus && (
                  <Badge
                    variant="outline"
                    className={`text-[11px] flex items-center gap-1 ${isActive ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400' : 'border-muted text-muted-foreground'}`}
                  >
                    {isActive
                      ? <CheckCircle className="size-2.5" />
                      : <AlertCircle className="size-2.5" />}
                    {operatingStatus}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight">
                {infoLoading ? <span className="inline-block w-48 h-7 bg-muted animate-pulse" /> : name}
              </h1>
              {location && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="size-3.5" /> {location}
                </p>
              )}
            </div>
            {total > 0 && (
              <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                <div className="text-right">
                  <span className="text-3xl font-bold text-amber-600">{score}%</span>
                  <p className="text-xs text-muted-foreground">positive</p>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ThumbsUp className="size-3 text-amber-500" />{positive}</span>
                  <span className="flex items-center gap-1"><ThumbsDown className="size-3 text-orange-400" />{negative}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Company Info */}
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-border pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Company Info</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-3">
            <InfoItem icon={Shield} label="DOT Number" value={info?.dotNumber} />
            <InfoItem icon={Shield} label="MC Number" value={info?.mcNumber} />
            {type === 'Carrier' && (info as CarrierPublicInfo)?.safetyRating && (
              <InfoItem icon={Shield} label="Safety Rating" value={(info as CarrierPublicInfo).safetyRating} />
            )}
            {type === 'Carrier' && (info as CarrierPublicInfo)?.totalPowerUnits != null && (
              <InfoItem
                icon={Truck}
                label="Power Units"
                value={String((info as CarrierPublicInfo).totalPowerUnits)}
              />
            )}
            <InfoItem
              icon={Phone}
              label="Phone"
              value={info?.phoneNumber ? formatPhone(info.phoneNumber) : null}
              href={info?.phoneNumber ? `tel:${info.phoneNumber}` : undefined}
            />
            {type === 'Broker' && (
              <InfoItem
                icon={Mail}
                label="Email"
                value={(info as BrokerPublicInfo)?.email}
                href={(info as BrokerPublicInfo)?.email ? `mailto:${(info as BrokerPublicInfo).email}` : undefined}
              />
            )}
          </CardContent>
        </Card>

        {/* Rating Summary */}
        <Card className="border-2 border-amber-200 dark:border-amber-800/60">
          <CardHeader className="border-b border-border pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rating Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-4">
            <RatingScoreBadge score={score} total={total} />

            {total > 0 && (
              <>
                <div className="h-2 bg-muted overflow-hidden">
                  <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${score}%` }} />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-7 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <ThumbsUp className="size-3.5 text-amber-600" />
                    </div>
                    <span className="font-semibold">{positive}</span>
                    <span className="text-muted-foreground">positive</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-7 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <ThumbsDown className="size-3.5 text-orange-500" />
                    </div>
                    <span className="font-semibold">{negative}</span>
                    <span className="text-muted-foreground">negative</span>
                  </div>
                </div>
              </>
            )}

            {tagStats.length > 0 && (
              <div className="space-y-2 pt-1">
                {tagStats.map((stat) => {
                  const pct = stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0;
                  return (
                    <div key={stat.tag}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{TAG_LABELS[stat.tag] ?? stat.tag}</span>
                        <span className="font-semibold text-amber-600">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {total === 0 && (
              <p className="text-xs text-muted-foreground">This company hasn't received any ratings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      {ratingList.length > 0 && (
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-border pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Reviews ({ratingList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-3">
            {ratingList.map((r) => (
              <div key={r.id} className="p-4 border-2 border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 flex-shrink-0 ${r.type === 'positive' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {r.type === 'positive'
                      ? <ThumbsUp className="size-3.5 text-amber-600" />
                      : <ThumbsDown className="size-3.5 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{r.fromName || 'Anonymous'}</p>
                      <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                    </div>
                    {r.fromRole && <p className="text-xs text-muted-foreground mt-0.5">{r.fromRole}</p>}
                    {r.loadTitle && <p className="text-xs text-muted-foreground mt-1">Load: {r.loadTitle}</p>}
                    {r.comment && (
                      <p className="text-sm bg-muted px-3 py-2 mt-2">"{r.comment}"</p>
                    )}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {TAG_LABELS[tag] ?? tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {ratingList.length === 0 && total === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          <Star className="size-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No reviews yet</p>
        </div>
      )}
    </div>
  );
}

function BrokerPublicContent({ id }: { id: string }) {
  const { data: info, isLoading } = useGetBrokerPublicInfoQuery(id);
  const { data: ratings, isLoading: ratingsLoading } = useGetCompanyRatingsQuery({ targetType: 'broker', id });

  if (isLoading || ratingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <CompanyPageContent type="Broker" info={info} ratings={ratings} infoLoading={isLoading} />;
}

function CarrierPublicContent({ id }: { id: string }) {
  const { data: info, isLoading } = useGetCarrierPublicInfoQuery(id);
  const { data: ratings, isLoading: ratingsLoading } = useGetCompanyRatingsQuery({ targetType: 'carrier', id });

  if (isLoading || ratingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <CompanyPageContent type="Carrier" info={info} ratings={ratings} infoLoading={isLoading} />;
}

export function CompanyPublicPage() {
  const { type, id } = useParams<{ type: string; id: string }>();

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {type === 'broker' && id
          ? <BrokerPublicContent id={id} />
          : type === 'carrier' && id
            ? <CarrierPublicContent id={id} />
            : <p className="text-muted-foreground">Invalid company link.</p>}
      </div>
    </div>
  );
}
