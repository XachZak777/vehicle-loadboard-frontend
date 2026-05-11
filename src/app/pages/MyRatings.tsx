import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { useGetMyRatingsQuery } from '../store/services/hauliusApi';
import type { MyRatingsResponse } from '../store/services/hauliusApi';
import { useAppSelector } from '../store/hooks';

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-1">My Ratings</h1>
        <p className="text-muted-foreground mb-8">Your performance and reputation overview</p>

        {/* Score card */}
        <Card className="border-2 border-amber-400 mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Overall Rating Score</p>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-5xl font-black">{score}%</span>
                  <span className={`text-xl font-semibold ${labelColor}`}>{label}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Based on {total} rating{total !== 1 ? 's' : ''}</p>

                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <div className="flex flex-col items-center gap-1 border-2 border-green-400 rounded-xl px-5 py-4">
                  <ThumbsUp className="size-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">{positive}</span>
                  <span className="text-xs text-green-600 font-medium">Positive</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-2 border-orange-400 rounded-xl px-5 py-4">
                  <ThumbsDown className="size-6 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">{negative}</span>
                  <span className="text-xs text-orange-500 font-medium">Negative</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        {tagStats.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6 pb-6">
              <h2 className="text-base font-semibold mb-1">Performance Breakdown</h2>
              <p className="text-sm text-muted-foreground mb-4">Detailed feedback from your customers</p>
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

        {/* Ratings list */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <h2 className="text-base font-semibold mb-1">Recent Reviews</h2>
            <p className="text-sm text-muted-foreground mb-4">Latest feedback from your customers</p>

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
                        {(r.fromRole) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.fromRole}
                          </p>
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
    </div>
  );
}
