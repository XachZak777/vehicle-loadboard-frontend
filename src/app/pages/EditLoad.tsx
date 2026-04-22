import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useGetLoadsQuery, useUpdateLoadMutation } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { US_STATES } from '../constants';
import {
  isValidVehicleYear, isValidPrice, isValidWeight, isValidZip, isValidCity,
  buildErrors, type FieldErrors,
} from '../utils/validation';

const LOCATION_TYPES = ['BUSINESS', 'RESIDENCE', 'AUCTION', 'PORT', 'OTHER'] as const;

export function EditLoad() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [updateLoad] = useUpdateLoadMutation();
  const { data: allLoads = [], isLoading: loadingLoads } = useGetLoadsQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', condition: '',
    pickupStreet: '', pickupCity: '', pickupState: '', pickupZip: '', pickupType: 'BUSINESS',
    dropStreet: '', dropCity: '', dropState: '', dropZip: '', dropType: 'RESIDENCE',
    weight: '', price: '', description: '', pickupDate: '', deliveryDate: '',
  });

  const load = allLoads.find(l => l.id === id);

  useEffect(() => {
    if (load && !initialized) {
      setFormData({
        make: load.vehicleMake ?? '',
        model: load.vehicleModel ?? '',
        year: load.vehicleYear?.toString() ?? '',
        condition: '',
        pickupStreet: load.pickupStreet ?? '',
        pickupCity: load.pickupCity ?? '',
        pickupState: load.pickupState ?? '',
        pickupZip: load.pickupZip ?? '',
        pickupType: (load.pickupType as string) ?? 'BUSINESS',
        dropStreet: load.dropStreet ?? '',
        dropCity: load.dropCity ?? '',
        dropState: load.dropState ?? '',
        dropZip: load.dropZip ?? '',
        dropType: (load.dropType as string) ?? 'RESIDENCE',
        weight: load.weight?.toString() ?? '',
        price: load.price?.toString() ?? '',
        description: load.description ?? '',
        pickupDate: load.pickupDate ?? '',
        deliveryDate: load.deliveryDate ?? '',
      });
      setInitialized(true);
    }
  }, [load, initialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();
    const errs = buildErrors([
      [!formData.make.trim(), 'make', 'Vehicle make is required.'],
      [!!formData.make.trim() && formData.make.trim().length > 50, 'make', 'Make must be 50 characters or fewer.'],
      [!formData.model.trim(), 'model', 'Vehicle model is required.'],
      [!!formData.model.trim() && formData.model.trim().length > 50, 'model', 'Model must be 50 characters or fewer.'],
      [!formData.year.trim(), 'year', 'Vehicle year is required.'],
      [!!formData.year.trim() && !isValidVehicleYear(formData.year), 'year', `Year must be between 1900 and ${currentYear + 2}.`],
      [!!formData.weight.trim() && !isValidWeight(formData.weight), 'weight', 'Weight must be between 1 and 100,000 lbs.'],
      [!!formData.pickupStreet.trim() && formData.pickupStreet.trim().length < 5, 'pickupStreet', 'Street address must be at least 5 characters.'],
      [!formData.pickupCity.trim(), 'pickupCity', 'Pickup city is required.'],
      [!!formData.pickupCity.trim() && !isValidCity(formData.pickupCity), 'pickupCity', 'Enter a valid city name (letters and spaces only).'],
      [!formData.pickupState, 'pickupState', 'Pickup state is required.'],
      [!!formData.pickupZip.trim() && !isValidZip(formData.pickupZip), 'pickupZip', 'ZIP code must be 5 digits (e.g. 60601).'],
      [!!formData.dropStreet.trim() && formData.dropStreet.trim().length < 5, 'dropStreet', 'Street address must be at least 5 characters.'],
      [!formData.dropCity.trim(), 'dropCity', 'Delivery city is required.'],
      [!!formData.dropCity.trim() && !isValidCity(formData.dropCity), 'dropCity', 'Enter a valid city name (letters and spaces only).'],
      [!formData.dropState, 'dropState', 'Delivery state is required.'],
      [!!formData.dropZip.trim() && !isValidZip(formData.dropZip), 'dropZip', 'ZIP code must be 5 digits (e.g. 90001).'],
      [!formData.price.trim(), 'price', 'Price is required.'],
      [!!formData.price.trim() && !isValidPrice(formData.price), 'price', 'Price must be between $1 and $999,999.'],
      [!!formData.description.trim() && formData.description.trim().length > 1000, 'description', 'Notes must be 1,000 characters or fewer.'],
    ]);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      toast.error('Please fix the highlighted fields before submitting.');
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await updateLoad({
        id: id!,
        body: {
          vehicleMake: formData.make,
          vehicleModel: formData.model,
          vehicleYear: parseInt(formData.year, 10),
          pickupStreet: formData.pickupStreet || undefined,
          pickupCity: formData.pickupCity,
          pickupState: formData.pickupState,
          pickupZip: formData.pickupZip || undefined,
          pickupCountry: 'US',
          pickupType: formData.pickupType,
          dropStreet: formData.dropStreet || undefined,
          dropCity: formData.dropCity,
          dropState: formData.dropState,
          dropZip: formData.dropZip || undefined,
          dropCountry: 'US',
          dropType: formData.dropType,
          price: parseFloat(formData.price),
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          description: formData.description || undefined,
          pickupDate: formData.pickupDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      }).unwrap();
      toast.success('Load updated successfully!', {
        icon: <CheckCircle className="size-5 text-green-600" />,
      });
      navigate('/broker/dashboard');
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Failed to update load.';
      toast.error('Failed to update load', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingLoads) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Load not found</p>
          <Link to="/broker/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Link to="/broker/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Truck className="size-7 text-amber-500" /> Edit Load
              </h1>
              <p className="text-muted-foreground">Update your vehicle transport request</p>
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
                    <Input id="make" placeholder="e.g., Toyota" value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)} maxLength={50} aria-invalid={!!fieldErrors.make} />
                    {fieldErrors.make && <p className="text-xs text-destructive mt-1">{fieldErrors.make}</p>}
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input id="model" placeholder="e.g., Camry" value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)} maxLength={50} aria-invalid={!!fieldErrors.model} />
                    {fieldErrors.model && <p className="text-xs text-destructive mt-1">{fieldErrors.model}</p>}
                  </div>
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input id="year" type="number" placeholder="e.g., 2022" min="1900" max={new Date().getFullYear() + 2}
                      value={formData.year} onChange={(e) => handleInputChange('year', e.target.value)} aria-invalid={!!fieldErrors.year} />
                    {fieldErrors.year && <p className="text-xs text-destructive mt-1">{fieldErrors.year}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input id="weight" type="number" placeholder="e.g., 3500" min="1" max="100000" step="1"
                    value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} aria-invalid={!!fieldErrors.weight} />
                  {fieldErrors.weight && <p className="text-xs text-destructive mt-1">{fieldErrors.weight}</p>}
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
                    <Input id="pickupStreet" placeholder="e.g., 100 Main St" value={formData.pickupStreet}
                      onChange={(e) => handleInputChange('pickupStreet', e.target.value)} maxLength={200} aria-invalid={!!fieldErrors.pickupStreet} />
                    {fieldErrors.pickupStreet && <p className="text-xs text-destructive mt-1">{fieldErrors.pickupStreet}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pickupType">Location Type</Label>
                    <Select value={formData.pickupType} onValueChange={(v) => handleInputChange('pickupType', v)}>
                      <SelectTrigger id="pickupType"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pickupCity">City *</Label>
                    <Input id="pickupCity" placeholder="e.g., Chicago" value={formData.pickupCity}
                      onChange={(e) => handleInputChange('pickupCity', e.target.value)} maxLength={100} aria-invalid={!!fieldErrors.pickupCity} />
                    {fieldErrors.pickupCity && <p className="text-xs text-destructive mt-1">{fieldErrors.pickupCity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pickupState">State *</Label>
                    <Select value={formData.pickupState} onValueChange={(v) => handleInputChange('pickupState', v)}>
                      <SelectTrigger id="pickupState" aria-invalid={!!fieldErrors.pickupState}><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    {fieldErrors.pickupState && <p className="text-xs text-destructive mt-1">{fieldErrors.pickupState}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pickupZip">ZIP Code</Label>
                    <Input id="pickupZip" placeholder="e.g., 60601" value={formData.pickupZip}
                      onChange={(e) => handleInputChange('pickupZip', e.target.value)} maxLength={10} inputMode="numeric" aria-invalid={!!fieldErrors.pickupZip} />
                    {fieldErrors.pickupZip && <p className="text-xs text-destructive mt-1">{fieldErrors.pickupZip}</p>}
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
                    <Input id="dropStreet" placeholder="e.g., 200 Freight Ave" value={formData.dropStreet}
                      onChange={(e) => handleInputChange('dropStreet', e.target.value)} maxLength={200} aria-invalid={!!fieldErrors.dropStreet} />
                    {fieldErrors.dropStreet && <p className="text-xs text-destructive mt-1">{fieldErrors.dropStreet}</p>}
                  </div>
                  <div>
                    <Label htmlFor="dropType">Location Type</Label>
                    <Select value={formData.dropType} onValueChange={(v) => handleInputChange('dropType', v)}>
                      <SelectTrigger id="dropType"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dropCity">City *</Label>
                    <Input id="dropCity" placeholder="e.g., Los Angeles" value={formData.dropCity}
                      onChange={(e) => handleInputChange('dropCity', e.target.value)} maxLength={100} aria-invalid={!!fieldErrors.dropCity} />
                    {fieldErrors.dropCity && <p className="text-xs text-destructive mt-1">{fieldErrors.dropCity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="dropState">State *</Label>
                    <Select value={formData.dropState} onValueChange={(v) => handleInputChange('dropState', v)}>
                      <SelectTrigger id="dropState" aria-invalid={!!fieldErrors.dropState}><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    {fieldErrors.dropState && <p className="text-xs text-destructive mt-1">{fieldErrors.dropState}</p>}
                  </div>
                  <div>
                    <Label htmlFor="dropZip">ZIP Code</Label>
                    <Input id="dropZip" placeholder="e.g., 90001" value={formData.dropZip}
                      onChange={(e) => handleInputChange('dropZip', e.target.value)} maxLength={10} inputMode="numeric" aria-invalid={!!fieldErrors.dropZip} />
                    {fieldErrors.dropZip && <p className="text-xs text-destructive mt-1">{fieldErrors.dropZip}</p>}
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
                  <Input id="price" type="number" placeholder="e.g., 1500" min="1" max="999999" step="1"
                    value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} aria-invalid={!!fieldErrors.price} />
                  {fieldErrors.price && <p className="text-xs text-destructive mt-1">{fieldErrors.price}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <Input id="pickupDate" type="date" value={formData.pickupDate}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input id="deliveryDate" type="date" value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Additional Notes</Label>
                  <Textarea id="description" placeholder="Special instructions, trailer type preference, etc."
                    rows={3} maxLength={1000} value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)} aria-invalid={!!fieldErrors.description} />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{formData.description.length}/1000</p>
                  {fieldErrors.description && <p className="text-xs text-destructive mt-1">{fieldErrors.description}</p>}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" size="lg" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
              <Link to="/broker/dashboard" className="flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
