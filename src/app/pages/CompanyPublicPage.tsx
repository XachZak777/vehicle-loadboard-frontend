import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Shield, Truck,
  ThumbsUp, ThumbsDown, Star, CheckCircle, AlertCircle, Loader2, FileCheck,
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

  const carrierInfo = type === 'Carrier' ? (info as CarrierPublicInfo) : null;
  const brokerInfo  = type === 'Broker'  ? (info as BrokerPublicInfo)  : null;

  const street = carrierInfo?.phyStreet ?? brokerInfo?.mailingAddress;
  const city   = carrierInfo?.phyCity   ?? brokerInfo?.city;
  const state  = carrierInfo?.phyState  ?? brokerInfo?.state;
  const zip    = carrierInfo?.phyZip    ?? brokerInfo?.zipCode;
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
      <Card className="border-2 border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/40 to-orange-50/20 dark:from-amber-950/20 dark:to-transparent rounded-none">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Company Info */}
        <div className="space-y-5">
          <Card className="border-2 border-gray-200 dark:border-gray-700 gap-0 rounded-none">
            <CardHeader className="border-b border-border pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Company Info</CardTitle>
            </CardHeader>
            <CardContent className="px-5 !py-3">
              <InfoItem icon={Shield} label="DOT Number" value={info?.dotNumber} />
              <InfoItem icon={Shield} label="MC Number" value={info?.mcNumber} />
              {carrierInfo?.safetyRating && (
                <InfoItem icon={Shield} label="Safety Rating" value={carrierInfo.safetyRating} />
              )}
              {carrierInfo?.totalPowerUnits != null && (
                <InfoItem icon={Truck} label="Power Units" value={String(carrierInfo.totalPowerUnits)} />
              )}
              <InfoItem
                icon={Phone}
                label="Phone"
                value={info?.phoneNumber ? formatPhone(info.phoneNumber) : null}
                href={info?.phoneNumber ? `tel:${info.phoneNumber}` : undefined}
              />
              {brokerInfo?.email && (
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={brokerInfo.email}
                  href={`mailto:${brokerInfo.email}`}
                />
              )}
              {/* Full address */}
              {street && <InfoItem icon={MapPin} label="Street" value={street} />}
              {(city || state || zip) && (
                <InfoItem
                  icon={MapPin}
                  label="City / State"
                  value={[city, state, zip].filter(Boolean).join(', ')}
                />
              )}
            </CardContent>
          </Card>

          {/* Bond Information — brokers only */}
          {brokerInfo && (brokerInfo.bondCompany || brokerInfo.bondAgentFirstName || brokerInfo.bondAgentLastName || brokerInfo.bondAgentPhone) && (
            <Card className="border-2 border-gray-200 dark:border-gray-700 gap-0 rounded-none">
              <CardHeader className="border-b border-border pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bond Information</CardTitle>
              </CardHeader>
              <CardContent className="px-5 !py-3">
                {brokerInfo.bondCompany && (
                  <InfoItem icon={FileCheck} label="Bond Company" value={brokerInfo.bondCompany} />
                )}
                {(brokerInfo.bondAgentFirstName || brokerInfo.bondAgentLastName) && (
                  <InfoItem
                    icon={FileCheck}
                    label="Agent Name"
                    value={[brokerInfo.bondAgentFirstName, brokerInfo.bondAgentLastName].filter(Boolean).join(' ')}
                  />
                )}
                {brokerInfo.bondAgentPhone && (
                  <InfoItem
                    icon={Phone}
                    label="Agent Phone"
                    value={formatPhone(brokerInfo.bondAgentPhone)}
                    href={`tel:${brokerInfo.bondAgentPhone}`}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rating Summary */}
        <Card className="border-2 border-amber-200 dark:border-amber-800/60 gap-0 rounded-none">
          <CardHeader className="border-b border-border pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rating Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-5 !py-4 space-y-4">
            {total === 0 ? (
              <div className="flex flex-col items-center py-6 text-center gap-2">
                <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                  <Star className="size-6 text-muted-foreground opacity-40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No ratings yet</p>
                <p className="text-xs text-muted-foreground/70">Reviews will appear here after completed loads.</p>
              </div>
            ) : (
              <>
                {/* Score hero */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-transparent border border-amber-100 dark:border-amber-900/40">
                  <div className="flex-shrink-0 text-center">
                    <div className={`text-4xl font-bold ${score >= 80 ? 'text-amber-600' : score >= 50 ? 'text-foreground' : 'text-orange-500'}`}>
                      {score}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? 'bg-amber-400' : score >= 50 ? 'bg-amber-300' : 'bg-orange-400'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="inline-flex size-5 rounded-full bg-amber-100 dark:bg-amber-900/40 items-center justify-center">
                          <ThumbsUp className="size-2.5 text-amber-600" />
                        </span>
                        <span className="font-semibold">{positive}</span>
                        <span className="text-muted-foreground">positive</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="inline-flex size-5 rounded-full bg-orange-100 dark:bg-orange-900/40 items-center justify-center">
                          <ThumbsDown className="size-2.5 text-orange-500" />
                        </span>
                        <span className="font-semibold">{negative}</span>
                        <span className="text-muted-foreground">negative</span>
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">{total} review{total !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {tagStats.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highlights</p>
                    {tagStats.map((stat) => {
                      const pct = stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0;
                      return (
                        <div key={stat.tag} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">{TAG_LABELS[stat.tag] ?? stat.tag}</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-amber-600 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      {ratingList.length > 0 && (
        <Card className="border-2 border-gray-200 dark:border-gray-700 gap-0 rounded-none">
          <CardHeader className="border-b border-border pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Reviews ({ratingList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="!p-0">
            {ratingList.map((r) => (
              <div key={r.id} className="flex items-start gap-3 px-5 py-4 border-b border-border last:border-0">
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
