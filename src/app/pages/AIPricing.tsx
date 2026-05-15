import { useState } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Loader2, Sparkles, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';

export function AIPricing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupCity: '',
    pickupState: '',
    deliveryCity: '',
    deliveryState: '',
    distance: '',
    vehicleCount: '1',
    trailerType: 'open' as 'open' | 'enclosed',
    season: 'current'
  });
  const [suggestion, setSuggestion] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-price-suggestion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get price suggestion');
      }

      const data = await response.json();
      setSuggestion(data);
      toast.success('Price suggestion generated!');
    } catch (error) {
      console.error('Price suggestion error:', error);
      toast.error('Failed to generate price suggestion. Please try again.');
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
              <DollarSign className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Dynamic Price Suggestions</h1>
              <p className="text-muted-foreground">AI-powered pricing based on market analysis</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Load Details</CardTitle>
                <CardDescription>Enter route and load information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pickup City</Label>
                      <Input
                        required
                        value={formData.pickupCity}
                        onChange={(e) => setFormData({...formData, pickupCity: e.target.value})}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <Label>Pickup State</Label>
                      <Input
                        required
                        value={formData.pickupState}
                        onChange={(e) => setFormData({...formData, pickupState: e.target.value})}
                        placeholder="CA"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Delivery City</Label>
                      <Input
                        required
                        value={formData.deliveryCity}
                        onChange={(e) => setFormData({...formData, deliveryCity: e.target.value})}
                        placeholder="Dallas"
                      />
                    </div>
                    <div>
                      <Label>Delivery State</Label>
                      <Input
                        required
                        value={formData.deliveryState}
                        onChange={(e) => setFormData({...formData, deliveryState: e.target.value})}
                        placeholder="TX"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Distance (miles)</Label>
                    <Input
                      required
                      type="number"
                      value={formData.distance}
                      onChange={(e) => setFormData({...formData, distance: e.target.value})}
                      placeholder="1450"
                    />
                  </div>

                  <div>
                    <Label>Number of Vehicles</Label>
                    <Select value={formData.vehicleCount} onValueChange={(value) => setFormData({...formData, vehicleCount: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} Vehicle{num > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Trailer Type</Label>
                    <Select value={formData.trailerType} onValueChange={(value: any) => setFormData({...formData, trailerType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open Trailer</SelectItem>
                        <SelectItem value="enclosed">Enclosed Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Season</Label>
                    <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Season</SelectItem>
                        <SelectItem value="peak">Peak Season</SelectItem>
                        <SelectItem value="off-peak">Off-Peak Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Get AI Price Suggestion
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {suggestion ? (
              <div className="space-y-4">
                <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-400">Recommended Price</CardTitle>
                    <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                      ${suggestion.recommendedPrice?.toLocaleString() || '0'}
                    </div>
                    <CardDescription>
                      ${suggestion.pricePerMile} per mile
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Price Range</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-none">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="size-5 text-orange-500" />
                        <span className="font-medium">Minimum</span>
                      </div>
                      <span className="text-xl font-bold">${suggestion.minPrice?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-none">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-green-500" />
                        <span className="font-medium">Maximum</span>
                      </div>
                      <span className="text-xl font-bold">${suggestion.maxPrice?.toLocaleString() || '0'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="size-5" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {suggestion.analysis}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {suggestion.factors?.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed">
                <CardContent className="text-center py-12">
                  <DollarSign className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    Fill in the form to get AI-powered price suggestions
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}