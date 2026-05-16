import { useState, useEffect } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrendingUp, Loader2, ArrowLeft, DollarSign, Calendar, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { chartColors } from '../../styles/theme';

export function AIRevenueForecast() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<any>(null);

  const generateForecast = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-revenue-forecast`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userId: user.id })
        }
      );

      if (!response.ok) throw new Error('Failed to generate forecast');

      const data = await response.json();
      setForecast(data);
      toast.success('Revenue forecast generated!');
    } catch (error) {
      console.error('Forecast error:', error);
      toast.error('Failed to generate forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateForecast();
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-none bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
              <TrendingUp className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Revenue Forecasting</h1>
              <p className="text-muted-foreground">AI-predicted earnings based on your patterns</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <Card className="h-96 flex items-center justify-center">
            <CardContent>
              <Loader2 className="size-16 animate-spin text-blue-500 mb-4 mx-auto" />
              <p className="text-center text-muted-foreground">Analyzing your data and market trends...</p>
            </CardContent>
          </Card>
        ) : forecast ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <DollarSign className="size-5" />
                      <CardTitle>Projected Monthly Revenue</CardTitle>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                      ${forecast.projectedMonthly?.toLocaleString() || '0'}
                    </div>
                    <CardDescription>
                      Based on current trends
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <TrendingUp className="size-5" />
                      <CardTitle>Growth Rate</CardTitle>
                    </div>
                    <div className="text-4xl font-bold text-green-700 dark:text-green-300">
                      +{forecast.growthRate || '0'}%
                    </div>
                    <CardDescription>
                      Month-over-month growth
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Target className="size-5" />
                      <CardTitle>Average Load Value</CardTitle>
                    </div>
                    <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                      ${forecast.avgLoadValue?.toLocaleString() || '0'}
                    </div>
                    <CardDescription>
                      Per completed load
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>6-Month Revenue Forecast</CardTitle>
                  <CardDescription>AI-predicted earnings based on your patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(forecast.monthlyData || []).map((item: any, idx: number) => ({
                      ...item,
                      id: `${item.month}-${idx}`
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke={chartColors.blue} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {forecast.insights?.map((insight: string, index: number) => (
                      <div key={index} className="p-4 bg-muted rounded-none flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Items */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Card className="border-2 border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-amber-600 dark:text-amber-400">Recommended Actions</CardTitle>
                  <CardDescription>Take these steps to maximize revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {forecast.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 font-bold">{index + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <Card className="h-96 flex items-center justify-center">
            <CardContent className="text-center">
              <Calendar className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">No data available for forecast</p>
              <Button onClick={generateForecast} className="bg-gradient-to-r from-blue-500 to-cyan-600">
                Generate Forecast
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}