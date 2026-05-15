import { useState } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapPin, Loader2, ArrowLeft, TrendingUp, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';

export function AIBackhaul() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [recommendations, setRecommendations] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-backhaul`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            deliveryCity,
            deliveryState,
            userId: user?.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to find backhaul loads');

      const data = await response.json();
      setRecommendations(data);
      toast.success('Backhaul loads found!');
    } catch (error) {
      console.error('Backhaul error:', error);
      toast.error('Failed to find backhaul loads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MapBackground />

      <div className="relative z-10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <MapPin className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Backhaul Recommendations</h1>
              <p className="text-muted-foreground">Eliminate empty miles with smart return load suggestions</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Delivery Location</CardTitle>
              <CardDescription>Where will you deliver your current load?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label>Delivery City</Label>
                  <Input
                    required
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Dallas"
                  />
                </div>
                <div>
                  <Label>Delivery State</Label>
                  <Input
                    required
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    placeholder="TX"
                    maxLength={2}
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Navigation className="size-4 mr-2" />
                      Find Backhaul Loads
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            {recommendations ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800">
                  <CardHeader>
                    <CardTitle className="text-indigo-700 dark:text-indigo-400">
                      {recommendations.loads?.length || 0} Backhaul Loads Found
                    </CardTitle>
                    <CardDescription>
                      Save ${recommendations.potentialSavings} in empty miles
                    </CardDescription>
                  </CardHeader>
                </Card>

                {recommendations.loads?.map((load: any) => (
                  <Card key={load.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{load.orderId}</CardTitle>
                          <CardDescription>
                            {load.pickup} → {load.delivery}
                          </CardDescription>
                        </div>
                        <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                          {load.matchScore}% Match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Distance</div>
                          <div className="font-bold">{load.distance} mi</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Price</div>
                          <div className="font-bold text-green-600">${load.price}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Pickup</div>
                          <div className="font-bold text-sm">{load.pickupDate}</div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-none text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="size-4" />
                          <span className="font-medium">{load.benefit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed">
                <CardContent className="text-center py-12">
                  <MapPin className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    Enter your delivery location to find backhaul loads
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