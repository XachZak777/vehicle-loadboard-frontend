import { useState, useEffect } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, TrendingUp, Users, ShieldAlert, Star, Loader2, ArrowLeft, Fuel } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function AIInsights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('market-alerts');

  const loadInsights = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userId: user.id })
        }
      );

      if (!response.ok) throw new Error('Failed to load insights');

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Insights error:', error);
      toast.error('Failed to load insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <MapBackground />

      <div className="relative z-10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/ai-tools')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to AI Tools
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-none bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                <TrendingUp className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">AI Insights & Intelligence</h1>
                <p className="text-muted-foreground">Market alerts, reports, and security features</p>
              </div>
            </div>
            <Button onClick={loadInsights} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="market-alerts" className="gap-2">
              <Bell className="size-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="market-reports" className="gap-2">
              <TrendingUp className="size-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="gap-2">
              <Users className="size-4" />
              Match
            </TabsTrigger>
            <TabsTrigger value="fraud" className="gap-2">
              <ShieldAlert className="size-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-2">
              <Star className="size-4" />
              Ratings
            </TabsTrigger>
            <TabsTrigger value="fuel" className="gap-2">
              <Fuel className="size-4" />
              Fuel
            </TabsTrigger>
          </TabsList>

          {/* Market Alerts */}
          <TabsContent value="market-alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5 text-red-500" />
                  Market Intelligence Alerts
                </CardTitle>
                <CardDescription>Real-time notifications about high-demand routes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin mx-auto text-violet-500" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights?.marketAlerts?.map((alert: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-none border-l-4 ${
                          alert.severity === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
                          alert.severity === 'medium' ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                          'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{alert.route}</div>
                          <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                            {alert.percentageAboveAvg}% above average
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">Demand: <span className="font-bold">{alert.demand}</span></span>
                          <span className="text-muted-foreground">Avg Rate: <span className="font-bold">${alert.avgRate}/mi</span></span>
                          <span className="text-muted-foreground">Loads: <span className="font-bold">{alert.availableLoads}</span></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Reports */}
          <TabsContent value="market-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-violet-500" />
                  Weekly Market Intelligence Report
                </CardTitle>
                <CardDescription>AI-generated analysis of trends and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin mx-auto text-violet-500" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Hot Lanes This Week</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights?.marketReports?.hotLanes?.map((lane: any, index: number) => (
                          <div key={index} className="p-4 bg-muted rounded-none">
                            <div className="font-medium mb-1">{lane.route}</div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                                +{lane.rateIncrease}%
                              </Badge>
                              <span className="text-muted-foreground">${lane.avgRate}/mi</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Market Trends</h3>
                      <div className="space-y-2">
                        {insights?.marketReports?.trends?.map((trend: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                            <span>{trend}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-none">
                        <p className="text-sm leading-relaxed">{insights?.marketReports?.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compatibility Score */}
          <TabsContent value="compatibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-emerald-500" />
                  Carrier/Broker Compatibility Score
                </CardTitle>
                <CardDescription>AI predicts how well you'll work together</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin mx-auto text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights?.compatibilityScores?.map((score: any, index: number) => (
                      <div key={index} className="p-4 border rounded-none hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{score.companyName}</div>
                            <div className="text-sm text-muted-foreground capitalize">{score.role}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-emerald-600">{score.score}</div>
                            <div className="text-xs text-muted-foreground">Compatibility</div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Past collaborations:</span>
                            <span className="font-medium">{score.pastLoads}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Success rate:</span>
                            <span className="font-medium text-green-600">{score.successRate}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Avg rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="size-3 fill-amber-500 text-amber-500" />
                              <span className="font-medium">{score.avgRating}/5</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-muted rounded text-xs">
                          {score.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Detection */}
          <TabsContent value="fraud" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-red-500" />
                  Anomaly Detection & Security
                </CardTitle>
                <CardDescription>AI-powered fraud prevention and suspicious activity detection</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin mx-auto text-red-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights?.securityAlerts?.length > 0 ? (
                      insights.securityAlerts.map((alert: any, index: number) => (
                        <div 
                          key={index}
                          className="p-4 border-2 border-red-500/30 bg-red-50 dark:bg-red-950/20 rounded-none"
                        >
                          <div className="flex items-start gap-3">
                            <ShieldAlert className="size-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-red-700 dark:text-red-400 mb-1">
                                {alert.title}
                              </div>
                              <p className="text-sm mb-2">{alert.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">{alert.severity}</Badge>
                                <span className="text-xs text-muted-foreground">{alert.detectedAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ShieldAlert className="size-16 mx-auto mb-4 text-green-500 opacity-50" />
                        <div className="text-lg font-medium text-green-600 mb-1">All Clear!</div>
                        <p className="text-sm text-muted-foreground">
                          No suspicious activity detected
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="p-4 bg-muted rounded-none text-center">
                        <div className="text-2xl font-bold">{insights?.securityStats?.scannedLoads || 0}</div>
                        <div className="text-xs text-muted-foreground">Loads Scanned</div>
                      </div>
                      <div className="p-4 bg-muted rounded-none text-center">
                        <div className="text-2xl font-bold">{insights?.securityStats?.flaggedUsers || 0}</div>
                        <div className="text-xs text-muted-foreground">Users Flagged</div>
                      </div>
                      <div className="p-4 bg-muted rounded-none text-center">
                        <div className="text-2xl font-bold">{insights?.securityStats?.blockedAttempts || 0}</div>
                        <div className="text-xs text-muted-foreground">Attempts Blocked</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rating Verification */}
          <TabsContent value="ratings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-5 text-amber-500" />
                  Rating Authenticity Verification
                </CardTitle>
                <CardDescription>AI detects fake or manipulated reviews</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin mx-auto text-amber-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-none border-2 border-green-200 dark:border-green-800">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {insights?.ratingVerification?.verified || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Verified Ratings</div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-none border-2 border-red-200 dark:border-red-800">
                        <div className="text-3xl font-bold text-red-600 mb-1">
                          {insights?.ratingVerification?.suspicious || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Flagged as Suspicious</div>
                      </div>
                    </div>

                    {insights?.ratingVerification?.suspiciousRatings?.map((rating: any, index: number) => (
                      <div key={index} className="p-4 border-2 border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 rounded-none">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{rating.reviewer}</div>
                            <div className="text-sm text-muted-foreground">{rating.date}</div>
                          </div>
                          <Badge variant="outline" className="bg-amber-500/10">
                            {rating.confidenceScore}% suspicious
                          </Badge>
                        </div>
                        <div className="text-sm mb-2">{rating.reason}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {rating.flags?.map((flag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{flag}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fuel Calculator */}
          <TabsContent value="fuel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="size-5 text-orange-500" />
                  Fuel Cost Calculator & Route Optimization
                </CardTitle>
                <CardDescription>Real-time fuel cost estimation with savings opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin mx-auto text-orange-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-none border border-orange-200 dark:border-orange-800">
                        <div className="text-xs text-muted-foreground mb-1">Current Avg Fuel Price</div>
                        <div className="text-3xl font-bold text-orange-600">${insights?.fuelData?.avgPrice || '0.00'}</div>
                        <div className="text-xs text-muted-foreground">per gallon</div>
                      </div>
                      <div className="p-4 bg-muted rounded-none">
                        <div className="text-xs text-muted-foreground mb-1">Monthly Fuel Cost</div>
                        <div className="text-3xl font-bold">${insights?.fuelData?.monthlyCost || '0'}</div>
                        <div className="text-xs text-muted-foreground">estimated</div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-none border border-green-200 dark:border-green-800">
                        <div className="text-xs text-muted-foreground mb-1">Potential Savings</div>
                        <div className="text-3xl font-bold text-green-600">${insights?.fuelData?.potentialSavings || '0'}</div>
                        <div className="text-xs text-muted-foreground">with optimization</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Fuel-Saving Recommendations</h3>
                      <div className="space-y-2">
                        {insights?.fuelData?.recommendations?.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-none text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}