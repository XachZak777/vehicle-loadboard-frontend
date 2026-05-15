import { useState } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Route, Loader2, ArrowLeft, MapPin, Navigation, Clock, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';

export function AIRouteOptimizer() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoads, setSelectedLoads] = useState<string[]>([]);
  const [optimization, setOptimization] = useState<any>(null);
  const [availableLoads, setAvailableLoads] = useState<any[]>([]);

  useState(() => {
    // Get available loads from localStorage
    const loads = JSON.parse(localStorage.getItem('posted_loads') || '[]');
    setAvailableLoads(loads.filter((l: any) => l.isOpen).slice(0, 10));
  });

  const handleOptimize = async () => {
    if (selectedLoads.length < 2) {
      toast.error('Please select at least 2 loads to optimize');
      return;
    }

    setIsLoading(true);
    try {
      const loads = selectedLoads.map(id => availableLoads.find(l => l.id === id));
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-route-optimize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ loads })
        }
      );

      if (!response.ok) throw new Error('Failed to optimize route');

      const data = await response.json();
      setOptimization(data);
      toast.success('Route optimized successfully!');
    } catch (error) {
      console.error('Route optimization error:', error);
      toast.error('Failed to optimize route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoad = (loadId: string) => {
    setSelectedLoads(prev => 
      prev.includes(loadId) 
        ? prev.filter(id => id !== loadId)
        : [...prev, loadId]
    );
  };

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
            <div className="p-3 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Route className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Multi-Load Route Optimizer</h1>
              <p className="text-muted-foreground">Find the most efficient sequence to minimize deadhead miles</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Load Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Loads to Optimize</CardTitle>
                <CardDescription>Choose 2 or more loads ({selectedLoads.length} selected)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {availableLoads.map((load) => (
                  <div 
                    key={load.id}
                    className={`p-4 border-2 rounded-none cursor-pointer transition-all ${
                      selectedLoads.includes(load.id) 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' 
                        : 'border-border hover:border-purple-300'
                    }`}
                    onClick={() => toggleLoad(load.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedLoads.includes(load.id)} />
                      <div className="flex-1">
                        <div className="font-medium mb-2">Order #{load.orderId || load.id}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="size-3" />
                          {load.pickupCity}, {load.pickupState} → {load.deliveryCity}, {load.deliveryState}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="outline">{load.distance} mi</Badge>
                          <Badge variant="outline">${load.price}</Badge>
                          <Badge>{load.pickupDate}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button 
              onClick={handleOptimize}
              disabled={isLoading || selectedLoads.length < 2}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Optimizing Route...
                </>
              ) : (
                <>
                  <Navigation className="size-4 mr-2" />
                  Optimize Route
                </>
              )}
            </Button>
          </div>

          {/* Optimization Results */}
          <div>
            {optimization ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-purple-700 dark:text-purple-400">Optimized Route</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Distance</div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {optimization.totalDistance} mi
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Deadhead Miles</div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {optimization.deadheadMiles} mi
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Revenue</div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            ${optimization.totalRevenue}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Sequence</CardTitle>
                    <CardDescription>Follow this order for optimal efficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {optimization.sequence?.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-none">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium mb-1">{item.orderId}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.pickup} → {item.delivery}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <Badge variant="outline">{item.distance} mi</Badge>
                              {item.deadhead > 0 && (
                                <Badge variant="destructive">{item.deadhead} mi deadhead</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="size-5 text-green-500" />
                      Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {optimization.savingsAnalysis}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-none">
                        <div className="text-xs text-muted-foreground">Miles Saved</div>
                        <div className="text-xl font-bold text-green-600">{optimization.milesSaved}</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-none">
                        <div className="text-xs text-muted-foreground">Fuel Saved</div>
                        <div className="text-xl font-bold text-green-600">${optimization.fuelSaved}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed">
                <CardContent className="text-center py-12">
                  <Route className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    Select loads to see optimized route
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}