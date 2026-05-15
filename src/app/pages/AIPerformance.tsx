import { useState, useEffect } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart3, Loader2, ArrowLeft, TrendingUp, TrendingDown, Award, Target, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

export function AIPerformance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [performance, setPerformance] = useState<any>(null);

  const generateReport = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-performance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userId: user.id })
        }
      );

      if (!response.ok) throw new Error('Failed to generate performance report');

      const data = await response.json();
      setPerformance(data);
      toast.success('Performance analysis complete!');
    } catch (error) {
      console.error('Performance error:', error);
      toast.error('Failed to generate performance report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
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
                <BarChart3 className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Performance Dashboard</h1>
                <p className="text-muted-foreground">AI-generated insights about your business</p>
              </div>
            </div>
            <Button onClick={generateReport} disabled={isLoading} variant="outline">
              Refresh Analysis
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <Card className="h-96 flex items-center justify-center">
            <CardContent>
              <Loader2 className="size-16 animate-spin text-cyan-500 mb-4 mx-auto" />
              <p className="text-center text-muted-foreground">Analyzing your performance data...</p>
            </CardContent>
          </Card>
        ) : performance ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-cyan-700 dark:text-cyan-400">Overall Performance Score</CardTitle>
                      <CardDescription>Based on multiple factors</CardDescription>
                    </div>
                    <div className="text-6xl font-bold text-cyan-600 dark:text-cyan-400">
                      {performance.overallScore}
                      <span className="text-2xl">/100</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={performance.overallScore} className="h-3" />
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Acceptance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{performance.acceptanceRate}%</div>
                    <div className="flex items-center gap-1 text-sm">
                      {performance.acceptanceChange >= 0 ? (
                        <>
                          <TrendingUp className="size-4 text-green-500" />
                          <span className="text-green-600">+{performance.acceptanceChange}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="size-4 text-red-500" />
                          <span className="text-red-600">{performance.acceptanceChange}%</span>
                        </>
                      )}
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Earnings/Load</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">${performance.avgEarnings}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {performance.earningsChange >= 0 ? (
                        <>
                          <TrendingUp className="size-4 text-green-500" />
                          <span className="text-green-600">+{performance.earningsChange}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="size-4 text-red-500" />
                          <span className="text-red-600">{performance.earningsChange}%</span>
                        </>
                      )}
                      <span className="text-muted-foreground ml-1">vs market avg</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Delivery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{performance.onTimeRate}%</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Award className="size-4 text-amber-500" />
                      <span className="text-muted-foreground">Excellent rating</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Loads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{performance.totalLoads}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="size-4 text-blue-500" />
                      <span className="text-muted-foreground">This month: {performance.monthLoads}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">AI-Generated Insights</CardTitle>
                  <CardDescription>What the data tells us about your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performance.insights?.map((insight: any, index: number) => (
                      <div key={index} className="p-4 rounded-none border-l-4 border-l-cyan-500 bg-muted">
                        <div className="flex items-start gap-3">
                          {insight.type === 'positive' ? (
                            <TrendingUp className="size-5 text-green-500 mt-0.5" />
                          ) : insight.type === 'negative' ? (
                            <TrendingDown className="size-5 text-red-500 mt-0.5" />
                          ) : (
                            <Award className="size-5 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium mb-1">{insight.title}</div>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Comparison to Market */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Market Comparison</CardTitle>
                  <CardDescription>How you stack up against other carriers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Price per Mile</span>
                        <span className="text-sm">
                          <Badge variant={performance.priceVsMarket >= 0 ? "default" : "destructive"}>
                            {performance.priceVsMarket >= 0 ? '+' : ''}{performance.priceVsMarket}% vs market
                          </Badge>
                        </span>
                      </div>
                      <Progress value={50 + performance.priceVsMarket} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Efficiency</span>
                        <span className="text-sm">
                          <Badge variant={performance.efficiencyVsMarket >= 0 ? "default" : "destructive"}>
                            {performance.efficiencyVsMarket >= 0 ? '+' : ''}{performance.efficiencyVsMarket}% vs market
                          </Badge>
                        </span>
                      </div>
                      <Progress value={50 + performance.efficiencyVsMarket} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <Card className="border-2 border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-amber-600 dark:text-amber-400">Recommended Actions</CardTitle>
                  <CardDescription>AI suggestions to improve your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {performance.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-none">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}