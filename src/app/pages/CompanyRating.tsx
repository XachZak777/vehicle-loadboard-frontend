import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ThumbsUp, ThumbsDown, Mail, Phone, Shield, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  useGetBrokerPublicInfoQuery,
  useGetCarrierPublicInfoQuery,
  useGetBrokerRatingsQuery,
  useGetCarrierRatingsQuery,
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
  if (score >= 80) return { text: 'Excellent', color: 'text-green-600' };
  if (score >= 60) return { text: 'Good', color: 'text-blue-600' };
  if (score >= 40) return { text: 'Fair', color: 'text-yellow-600' };
  return { text: 'Needs Improvement', color: 'text-orange-500' };
}

function fmtDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function tagBarColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-orange-500';
}

function InfoField({ label, value, icon }: { label: string; value?: string | null; icon: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg px-4 py-3">
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
      {/* Header card */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <h1 className="text-2xl font-bold mb-2">{name}</h1>
          <Badge variant="outline" className="mb-5">{type}</Badge>

          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Overall Rating Score</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-5xl font-black">{score}%</span>
                <span className={`text-lg font-semibold ${labelColor}`}>{label}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Based on {total} rating{total !== 1 ? 's' : ''}</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="flex flex-col items-center gap-1 border border-border rounded-xl px-5 py-3">
                <ThumbsUp className="size-5 text-green-600" />
                <span className="text-xl font-bold">{positive}</span>
                <span className="text-xs text-muted-foreground">Positive</span>
              </div>
              <div className="flex flex-col items-center gap-1 border border-border rounded-xl px-5 py-3">
                <ThumbsDown className="size-5 text-orange-500" />
                <span className="text-xl font-bold">{negative}</span>
                <span className="text-xs text-muted-foreground">Negative</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      {tagStats.length > 0 && (
        <Card>
          <CardContent className="pt-6 pb-6">
            <h2 className="text-base font-semibold mb-1">Performance Breakdown</h2>
            <p className="text-sm text-muted-foreground mb-4">Detailed feedback statistics</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tagStats.map((stat) => {
                const pct = stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0;
                const barColor = tagBarColor(pct);
                return (
                  <div key={stat.tag} className="border border-border rounded-xl px-4 py-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold leading-snug">{TAG_LABELS[stat.tag] ?? stat.tag}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0 ${barColor}`}>{pct}%</span>
                    </div>
                    <p className="text-2xl font-bold mb-0.5">{stat.count}</p>
                    <p className="text-xs text-muted-foreground mb-2">out of {stat.total} ratings</p>
                    <div className="mt-auto h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company info card */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <h2 className="text-base font-semibold mb-1">Company Information</h2>
          <p className="text-sm text-muted-foreground mb-4">Contact and verification details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="Email Address" value={info?.email} icon={<Mail className="size-4 text-muted-foreground" />} />
            <InfoField label="Phone Number" value={info?.phoneNumber} icon={<Phone className="size-4 text-muted-foreground" />} />
            <InfoField label="DOT Number" value={info?.dotNumber} icon={<Shield className="size-4 text-muted-foreground" />} />
            <InfoField label="MC Number" value={info?.mcNumber} icon={<Shield className="size-4 text-muted-foreground" />} />
          </div>
        </CardContent>
      </Card>

      {/* Ratings list */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <h2 className="text-base font-semibold mb-1">Recent Reviews</h2>
          <p className="text-sm text-muted-foreground mb-4">Latest feedback from customers</p>

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
                <div key={r.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`mt-0.5 rounded-full p-2 flex-shrink-0 ${r.type === 'positive' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                      {r.type === 'positive'
                        ? <ThumbsUp className="size-4 text-green-600" />
                        : <ThumbsDown className="size-4 text-orange-500" />}
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
                    <div className="bg-muted rounded-lg px-3 py-2 mb-2">
                      <p className="text-sm text-muted-foreground">"{r.comment}"</p>
                    </div>
                  )}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted rounded-full px-2.5 py-1 font-medium">
                          {TAG_LABELS[tag] ?? tag}
                        </span>
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
  const { data: apiRatings } = useGetBrokerRatingsQuery(id, { skip: USE_MOCK });
  const info = USE_MOCK ? MOCK_INFO : apiInfo;
  const ratings = USE_MOCK ? MOCK_DATA : apiRatings;
  return <RatingPageContent type="Broker" info={info} ratings={ratings} isLoading={loadingInfo} />;
}

function CarrierContent({ id }: { id: string }) {
  const { data: apiInfo, isLoading: loadingInfo } = useGetCarrierPublicInfoQuery(id, { skip: USE_MOCK });
  const { data: apiRatings } = useGetCarrierRatingsQuery(id, { skip: USE_MOCK });
  const info = USE_MOCK ? MOCK_INFO : apiInfo;
  const ratings = USE_MOCK ? MOCK_DATA : apiRatings;
  return <RatingPageContent type="Carrier" info={info} ratings={ratings} isLoading={loadingInfo} />;
}

export function CompanyRating() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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
