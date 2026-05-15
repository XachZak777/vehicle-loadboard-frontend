import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useGetMyRatingsQuery } from '../store/services/hauliusApi';
import type { MyRatingsResponse } from '../store/services/hauliusApi';
import { useAppSelector } from '../store/hooks';
import { MapBackground } from '../components/MapBackground';

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

const TAG_LABELS: Record<string, string> = {
  communication: 'Proper Communication',
  payment: 'On-Time Payment',
  accuracy: 'Accurate Load Details',
};

function ratingLabel(score: number, total: number): { text: string; color: string } {
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

export function MyRatings() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: apiData } = useGetMyRatingsQuery(undefined, { skip: !user || USE_MOCK });

  const data = USE_MOCK ? MOCK_DATA : apiData;

  const positive = data?.positiveCount ?? 0;
  const negative = data?.negativeCount ?? 0;
  const total = positive + negative;
  const score = total > 0 ? Math.round((positive / total) * 100) : 0;
  const { text: label, color: labelColor } = ratingLabel(score, total);
  const ratings = data?.ratings ?? [];
  const tagStats = data?.tagStats ?? [];

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">My Ratings</h1>
          <p className="text-muted-foreground mt-1">Your performance and reputation overview</p>
        </div>

        {/* Score card */}
        <Card className="border-[3px] border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20 mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Overall Rating Score</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl sm:text-7xl font-bold">{score}%</span>
                  <span className={`text-2xl font-semibold ${labelColor}`}>{label}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">Based on {total} rating{total !== 1 ? 's' : ''}</p>
              </div>

              <div className="flex gap-6">
                <div className="text-center p-4 border-2 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
                  <ThumbsUp className="size-6 mx-auto mb-2 text-amber-600 dark:text-amber-500" />
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{positive}</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400">Positive</div>
                </div>
                <div className="text-center p-4 border-2 border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/20">
                  <ThumbsDown className="size-6 mx-auto mb-2 text-orange-600 dark:text-orange-500" />
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{negative}</div>
                  <div className="text-xs text-orange-700 dark:text-orange-400">Negative</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative h-2 bg-muted overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        {tagStats.length > 0 && (
          <Card className="border-2 border-gray-300 dark:border-gray-600 mb-6">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="text-gray-900 dark:text-gray-100">Performance Breakdown</CardTitle>
              <CardDescription>Detailed feedback from your customers</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tagStats.map((stat) => {
                  const pct = stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0;
                  const cfg = stat.tag === 'communication'
                    ? { border: 'border-2 border-amber-300 dark:border-amber-700', bg: 'bg-amber-50/20 dark:bg-amber-950/10', badgeCls: 'bg-amber-500 border-2 border-amber-600', valueCls: 'text-amber-600 dark:text-amber-500' }
                    : stat.tag === 'payment'
                      ? { border: 'border-2 border-amber-300 dark:border-amber-700', bg: 'bg-amber-50/20 dark:bg-amber-950/10', badgeCls: 'bg-amber-500 border-2 border-amber-600', valueCls: 'text-amber-600 dark:text-amber-500' }
                      : { border: 'border-2 border-gray-300 dark:border-gray-700', bg: 'bg-gray-50/20 dark:bg-gray-950/10', badgeCls: 'bg-gray-500 border-2 border-gray-600', valueCls: 'text-gray-600 dark:text-gray-400' };
                  const barColor = tagBarColor(pct);
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

        {/* Ratings list */}
        <Card className="border-2 border-gray-300 dark:border-gray-600">
          <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-gray-100">Recent Reviews</CardTitle>
            <CardDescription>Latest feedback from your customers</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {ratings.length === 0 ? (
              <div className="py-10 text-center">
                <Star className="size-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-lg font-semibold mb-1">No ratings yet</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Complete more transactions to receive ratings from your customers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((r) => (
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
    </div>
  );
}
