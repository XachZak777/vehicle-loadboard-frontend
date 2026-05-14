import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ThumbsUp, ThumbsDown, Mail, Phone, Shield, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  useGetBrokerPublicInfoQuery,
  useGetCarrierPublicInfoQuery,
  useGetCompanyRatingsQuery,
} from '../store/services/hauliusApi';
import type { MyRatingsResponse } from '../store/services/hauliusApi';

// Set to true to preview with mock data (no backend needed)
const USE_MOCK = false;

const MOCK_DATA: MyRatingsResponse = {
  positiveCount: 1,
  negativeCount: 1,
  tagStats: [
    { tag: 'communication', count: 2, total: 2 },
    { tag: 'payment', count: 2, total: 2 },
    { tag: 'accuracy', count: 2, total: 2 },
  ],
  ratings: [
    {
      id: 'mock-1',
      type: 'positive',
      fromName: 'Swift Logistics LLC',
      fromRole: 'Carrier',
      loadTitle: '1900 2 3',
      tags: ['communication', 'payment', 'accuracy'],
      createdAt: '2026-05-10',
    },
    {
      id: 'mock-2',
      type: 'negative',
      fromName: 'Swift Logistics LLC',
      fromRole: 'Carrier',
      loadTitle: '1900 1233 123',
      tags: ['communication', 'payment', 'accuracy'],
      comment: 'adslkasldkasdfk kasdkf laskdf laskdf lkasldf kasldf kalsdkf laskdf laksdf lka sdl fkasldf kalsdfk alskfla skf laksd flaksdlf aksld kald fkalsdkf laksdf lasdlf kasldf kalsdkf laskdf laksdflaksdlf kaldf kalsdkf ladksf laksdl f',
      createdAt: '2026-05-10',
    },
  ],
};

const MOCK_INFO = {
  companyName: 'Swift Logistics LLC',
  email: '123@123.com',
  phoneNumber: '15553456',
  dotNumber: '123456',
  mcNumber: undefined as string | undefined,
};

const TAG_LABELS: Record<string, string> = {
  communication: 'Proper Communication',
  payment: 'On-Time Payment',
  accuracy: 'Accurate Load Details',
};

function ratingLabel(score: number, total: number) {
  if (total === 0) return { text: 'Needs Improvement', color: 'text-muted-foreground' };
  if (score >= 80) return { text: 'Excellent', color: 'text-amber-600' };
  if (score >= 60) return { text: 'Good', color: 'text-muted-foreground' };
  if (score >= 40) return { text: 'Fair', color: 'text-muted-foreground' };
  return { text: 'Needs Improvement', color: 'text-orange-500' };
}

function fmtDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function tagBarColor(pct: number) {
  if (pct >= 80) return 'bg-amber-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-gray-500';
}

function InfoField({ label, value, icon }: { label: string; value?: string | null; icon: React.ReactNode }) {
  return (
    <div className="border border-border px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <div className={`flex items-center gap-2 text-sm font-medium ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
        {icon}
        {value || 'N/A'}
      </div>
    </div>
  );
}

type PublicInfo = {
  companyName?: string;
  legalName?: string;
  email?: string;
  phoneNumber?: string;
  dotNumber?: string;
  mcNumber?: string;
};

function RatingPageContent({
  type,
  info,
  ratings,
  isLoading,
}: {
  type: 'Broker' | 'Carrier';
  info?: PublicInfo | null;
  ratings?: MyRatingsResponse | null;
  isLoading: boolean;
}) {
  const positive = ratings?.positiveCount ?? 0;
  const negative = ratings?.negativeCount ?? 0;
  const total = positive + negative;
  const score = total > 0 ? Math.round((positive / total) * 100) : 0;
  const { text: label, color: labelColor } = ratingLabel(score, total);
  const ratingList = ratings?.ratings ?? [];
  const tagStats = ratings?.tagStats ?? [];

  const name = info?.companyName || info?.legalName || (isLoading ? '…' : 'Unknown Company');

  return (
    <div className="space-y-4">
      {/* Header / Score card */}
      <Card className="border-[3px] border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-1">{name}</h1>
          <Badge variant="outline" className="mb-5">{type}</Badge>

          <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Overall Rating Score</div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-6xl font-bold">{score}%</span>
                <span className={`text-xl font-semibold ${labelColor}`}>{label}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Based on {total} rating{total !== 1 ? 's' : ''}</p>
              <div className="h-2 bg-muted overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center p-4 border-2 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
                <ThumbsUp className="size-5 mx-auto mb-2 text-amber-600 dark:text-amber-500" />
                <div className="text-xl font-bold text-amber-900 dark:text-amber-100">{positive}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400">Positive</div>
              </div>
              <div className="text-center p-4 border-2 border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/20">
                <ThumbsDown className="size-5 mx-auto mb-2 text-orange-600 dark:text-orange-500" />
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">{negative}</div>
                <div className="text-xs text-orange-700 dark:text-orange-400">Negative</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      {tagStats.length > 0 && (
        <Card className="border-2 border-gray-300 dark:border-gray-600">
          <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-gray-100">Performance Breakdown</CardTitle>
            <CardDescription>Detailed feedback statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tagStats.map((stat) => {
                const pct = stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0;
                const barColor = tagBarColor(pct);
                const cfg = stat.tag === 'communication'
                  ? { border: 'border-2 border-amber-300 dark:border-amber-700', bg: 'bg-amber-50/20 dark:bg-amber-950/10', badgeCls: 'bg-amber-500 border-2 border-amber-600', valueCls: 'text-amber-600 dark:text-amber-500' }
                  : stat.tag === 'payment'
                    ? { border: 'border-2 border-amber-300 dark:border-amber-700', bg: 'bg-amber-50/20 dark:bg-amber-950/10', badgeCls: 'bg-amber-500 border-2 border-amber-600', valueCls: 'text-amber-600 dark:text-amber-500' }
                    : { border: 'border-2 border-gray-300 dark:border-gray-700', bg: 'bg-gray-50/20 dark:bg-gray-950/10', badgeCls: 'bg-gray-500 border-2 border-gray-600', valueCls: 'text-gray-600 dark:text-gray-400' };
                return (
                  <div key={stat.tag} className={`p-5 ${cfg.border} ${cfg.bg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-base text-gray-900 dark:text-gray-100">{TAG_LABELS[stat.tag] ?? stat.tag}</div>
                      <Badge className={cfg.badgeCls}>{pct}%</Badge>
                    </div>
                    <div className={`text-3xl font-bold ${cfg.valueCls}`}>{stat.count}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">out of {stat.total} ratings</div>
                    <div className="mt-3 h-1.5 bg-muted overflow-hidden">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company info card */}
      <Card className="border-2 border-gray-300 dark:border-gray-600">
        <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
          <CardTitle className="text-gray-900 dark:text-gray-100">Company Information</CardTitle>
          <CardDescription>Contact and verification details</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="Email Address" value={info?.email} icon={<Mail className="size-4 text-muted-foreground" />} />
            <InfoField label="Phone Number" value={info?.phoneNumber} icon={<Phone className="size-4 text-muted-foreground" />} />
            <InfoField label="DOT Number" value={info?.dotNumber} icon={<Shield className="size-4 text-muted-foreground" />} />
            <InfoField label="MC Number" value={info?.mcNumber} icon={<Shield className="size-4 text-muted-foreground" />} />
          </div>
        </CardContent>
      </Card>

      {/* Ratings list */}
      <Card className="border-2 border-gray-300 dark:border-gray-600">
        <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
          <CardTitle className="text-gray-900 dark:text-gray-100">Recent Reviews</CardTitle>
          <CardDescription>Latest feedback from customers</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {ratingList.length === 0 ? (
            <div className="py-10 text-center">
              <Star className="size-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-lg font-semibold mb-1">No Ratings Yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This company hasn't received any ratings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratingList.map((r) => (
                <div key={r.id} className="p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`mt-0.5 p-2 flex-shrink-0 ${r.type === 'positive' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {r.type === 'positive'
                        ? <ThumbsUp className="size-4 text-amber-600" />
                        : <ThumbsDown className="size-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm">{r.fromName || 'Anonymous'}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(r.createdAt)}</span>
                      </div>
                      {r.fromRole && (
                        <p className="text-xs text-muted-foreground mt-0.5">{r.fromRole}</p>
                      )}
                    </div>
                  </div>
                  {r.loadTitle && (
                    <p className="text-xs text-muted-foreground mb-2">Load: {r.loadTitle}</p>
                  )}
                  {r.comment && (
                    <p className="text-sm bg-muted p-3 mb-2">"{r.comment}"</p>
                  )}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{TAG_LABELS[tag] ?? tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BrokerContent({ id }: { id: string }) {
  const { data: apiInfo, isLoading: loadingInfo } = useGetBrokerPublicInfoQuery(id, { skip: USE_MOCK });
  const { data: apiRatings } = useGetCompanyRatingsQuery({ targetType: 'broker', id }, { skip: USE_MOCK });
  const info = USE_MOCK ? MOCK_INFO : apiInfo;
  const ratings = USE_MOCK ? MOCK_DATA : apiRatings;
  return <RatingPageContent type="Broker" info={info} ratings={ratings} isLoading={loadingInfo} />;
}

function CarrierContent({ id }: { id: string }) {
  const { data: apiInfo, isLoading: loadingInfo } = useGetCarrierPublicInfoQuery(id, { skip: USE_MOCK });
  const { data: apiRatings } = useGetCompanyRatingsQuery({ targetType: 'carrier', id }, { skip: USE_MOCK });
  const info = USE_MOCK ? MOCK_INFO : apiInfo;
  const ratings = USE_MOCK ? MOCK_DATA : apiRatings;
  return <RatingPageContent type="Carrier" info={info} ratings={ratings} isLoading={loadingInfo} />;
}

export function CompanyRating() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>

        {type === 'broker' && id
          ? <BrokerContent id={id} />
          : type === 'carrier' && id
            ? <CarrierContent id={id} />
            : <p className="text-muted-foreground">Invalid company link.</p>}
      </div>
    </div>
  );
}
