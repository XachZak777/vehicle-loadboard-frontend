import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useCreateLoadMutation } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { US_STATES, VEHICLE_TYPES, VEHICLE_CONDITIONS } from '../constants';

export function PostLoad() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [createLoad] = useCreateLoadMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '',
    make: '',
    model: '',
    year: '',
    pickupCity: '',
    pickupState: '',
    deliveryCity: '',
    deliveryState: '',
    pickupDate: '',
    deliveryDate: '',
    price: '',
    condition: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make || !formData.model || !formData.year) {
      toast.error('Please fill in the vehicle make, model, and year.');
      return;
    }
    if (!formData.pickupCity || !formData.pickupState || !formData.deliveryCity || !formData.deliveryState) {
      toast.error('Please fill in pickup and delivery locations.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLoad({
        vehicleMake: formData.make,
        vehicleModel: formData.model,
        vehicleYear: parseInt(formData.year),
        pickupCity: formData.pickupCity,
        pickupState: formData.pickupState,
        dropCity: formData.deliveryCity,
        dropState: formData.deliveryState,
        price: formData.price ? parseFloat(formData.price) : undefined,
        description: formData.notes || undefined,
      });

      toast.success('Load posted successfully!', {
        description: 'Your load has been added to the board and is now visible to carriers.',
        icon: <CheckCircle className="size-5 text-green-600" />,
      });

      navigate('/loads');
    } catch (error: any) {
      const message = error?.message || 'Failed to post load. Please try again.';
      toast.error('Failed to post load', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Post a Load</h1>
            <p className="text-muted-foreground">Add a new vehicle transport request</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Vehicle Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Provide details about the vehicle to be transported</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select 
                      value={formData.vehicleType} 
                      onValueChange={(value) => handleInputChange('vehicleType', value)}
                      required
                    >
                      <SelectTrigger id="vehicleType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="rv">RV</SelectItem>
                        <SelectItem value="boat">Boat</SelectItem>
                        <SelectItem value="atv">ATV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => handleInputChange('condition', value)}
                      required
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="non-running">Non-Running</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      placeholder="e.g., Toyota"
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Camry"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="e.g., 2022"
                      min="1900"
                      max="2026"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pickup Information</CardTitle>
                <CardDescription>Where will the vehicle be picked up?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupCity">City *</Label>
                    <Input
                      id="pickupCity"
                      placeholder="e.g., Los Angeles"
                      value={formData.pickupCity}
                      onChange={(e) => handleInputChange('pickupCity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupState">State *</Label>
                    <Select 
                      value={formData.pickupState} 
                      onValueChange={(value) => handleInputChange('pickupState', value)}
                      required
                    >
                      <SelectTrigger id="pickupState">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="pickupDate">Pickup Date *</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
                <CardDescription>Where should the vehicle be delivered?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryCity">City *</Label>
                    <Input
                      id="deliveryCity"
                      placeholder="e.g., Phoenix"
                      value={formData.deliveryCity}
                      onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryState">State *</Label>
                    <Select 
                      value={formData.deliveryState} 
                      onValueChange={(value) => handleInputChange('deliveryState', value)}
                      required
                    >
                      <SelectTrigger id="deliveryState">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Contact */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pricing & Contact</CardTitle>
                <CardDescription>Set your price and provide contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 450"
                    min="0"
                    step="10"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Your full name"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements, preferred trailer type, or other important information..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                size="lg" 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting Load...' : 'Post Load'}
              </Button>
              <Link to="/loads" className="flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}