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
import { US_STATES } from '../constants';

// Must match backend PickupType / DropType enums
const LOCATION_TYPES = ['BUSINESS', 'RESIDENCE', 'AUCTION', 'PORT', 'OTHER'] as const;

export function PostLoad() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [createLoad] = useCreateLoadMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Vehicle
    make: '',
    model: '',
    year: '',
    condition: '',
    // Pickup
    pickupStreet: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    pickupType: 'BUSINESS',
    // Drop / Delivery
    dropStreet: '',
    dropCity: '',
    dropState: '',
    dropZip: '',
    dropType: 'RESIDENCE',
    // Load details
    weight: '',
    price: '',
    description: '',
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
    if (!formData.pickupCity || !formData.pickupState) {
      toast.error('Please fill in the pickup city and state.');
      return;
    }
    if (!formData.dropCity || !formData.dropState) {
      toast.error('Please fill in the delivery city and state.');
      return;
    }
    if (!formData.price) {
      toast.error('Please enter a price.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLoad({
        // Vehicle
        vehicleMake: formData.make,
        vehicleModel: formData.model,
        vehicleYear: parseInt(formData.year, 10),
        // Pickup
        pickupStreet: formData.pickupStreet || undefined,
        pickupCity: formData.pickupCity,
        pickupState: formData.pickupState,
        pickupZip: formData.pickupZip || undefined,
        pickupCountry: 'US',
        pickupType: formData.pickupType,
        // Drop
        dropStreet: formData.dropStreet || undefined,
        dropCity: formData.dropCity,
        dropState: formData.dropState,
        dropZip: formData.dropZip || undefined,
        dropCountry: 'US',
        dropType: formData.dropType,
        // Load details
        price: parseFloat(formData.price),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        description: formData.description || undefined,
      }).unwrap();

      toast.success('Load posted successfully!', {
        description: 'Your load has been added to the board and is now visible to carriers.',
        icon: <CheckCircle className="size-5 text-green-600" />,
      });

      navigate('/loads');
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || 'Failed to post load. Please try again.';
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

          <div className="mb-8 flex items-center gap-4">
            <Link to="/loads">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Truck className="size-7 text-amber-500" /> Post a Load
              </h1>
              <p className="text-muted-foreground">Add a new vehicle transport request</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Vehicle Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Details about the vehicle to be transported</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      max="2030"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(v) => handleInputChange('condition', v)}
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
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 3500"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pickup Location</CardTitle>
                <CardDescription>Where will the vehicle be picked up?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupStreet">Street Address</Label>
                    <Input
                      id="pickupStreet"
                      placeholder="e.g., 100 Main St"
                      value={formData.pickupStreet}
                      onChange={(e) => handleInputChange('pickupStreet', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupType">Location Type</Label>
                    <Select
                      value={formData.pickupType}
                      onValueChange={(v) => handleInputChange('pickupType', v)}
                    >
                      <SelectTrigger id="pickupType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pickupCity">City *</Label>
                    <Input
                      id="pickupCity"
                      placeholder="e.g., Chicago"
                      value={formData.pickupCity}
                      onChange={(e) => handleInputChange('pickupCity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupState">State *</Label>
                    <Select
                      value={formData.pickupState}
                      onValueChange={(v) => handleInputChange('pickupState', v)}
                      required
                    >
                      <SelectTrigger id="pickupState">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pickupZip">ZIP Code</Label>
                    <Input
                      id="pickupZip"
                      placeholder="e.g., 60601"
                      value={formData.pickupZip}
                      onChange={(e) => handleInputChange('pickupZip', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Delivery Location</CardTitle>
                <CardDescription>Where should the vehicle be delivered?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dropStreet">Street Address</Label>
                    <Input
                      id="dropStreet"
                      placeholder="e.g., 200 Freight Ave"
                      value={formData.dropStreet}
                      onChange={(e) => handleInputChange('dropStreet', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropType">Location Type</Label>
                    <Select
                      value={formData.dropType}
                      onValueChange={(v) => handleInputChange('dropType', v)}
                    >
                      <SelectTrigger id="dropType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dropCity">City *</Label>
                    <Input
                      id="dropCity"
                      placeholder="e.g., Los Angeles"
                      value={formData.dropCity}
                      onChange={(e) => handleInputChange('dropCity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropState">State *</Label>
                    <Select
                      value={formData.dropState}
                      onValueChange={(v) => handleInputChange('dropState', v)}
                      required
                    >
                      <SelectTrigger id="dropState">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dropZip">ZIP Code</Label>
                    <Input
                      id="dropZip"
                      placeholder="e.g., 90001"
                      value={formData.dropZip}
                      onChange={(e) => handleInputChange('dropZip', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Notes */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pricing & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 1500"
                    min="0"
                    step="10"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Additional Notes</Label>
                  <Textarea
                    id="description"
                    placeholder="Special instructions, trailer type preference, etc."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Load'}
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
