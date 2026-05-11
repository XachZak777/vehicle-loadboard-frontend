import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCreateLoadMutation, useLazyVinLookupQuery, type VinDecodeResult } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Truck, CheckCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  isValidVehicleYear, isValidPrice, isValidZip, isValidCity,
  isValidPhone, isValidEmail, isValidVin, isValidName,
  buildErrors, type FieldErrors,
} from '../utils/validation';
import { VehicleInfoSection } from '../components/load-form/VehicleInfoSection';
import { LocationSection } from '../components/load-form/LocationSection';
import { PricingNotesSection } from '../components/load-form/PricingNotesSection';
import { ContactInfoSection } from '../components/load-form/ContactInfoSection';

const MAX_VEHICLES = 9;

type VehicleFormData = {
  vin: string;
  vehicleType: string;
  condition: string;
  make: string;
  model: string;
  year: string;
  additionalInfo: string;
  weight: string;
  trailerType: string; // kept for VehicleInfoSection interface compat — not used per vehicle
};

const emptyVehicle = (): VehicleFormData => ({
  vin: '', vehicleType: '', condition: '', make: '', model: '',
  year: '', additionalInfo: '', weight: '', trailerType: '',
});

export function PostLoad() {
  const navigate = useNavigate();
  const [createLoad] = useCreateLoadMutation();
  const [triggerVinLookup, { isFetching: vinLookupLoading }] = useLazyVinLookupQuery();

  const [vehicles, setVehicles] = useState<VehicleFormData[]>([emptyVehicle()]);
  const [vinDetailsMap, setVinDetailsMap] = useState<Record<number, VinDecodeResult | null>>({});
  const [vinLookupIndex, setVinLookupIndex] = useState<number | null>(null);
  const [vehicleErrors, setVehicleErrors] = useState<FieldErrors[]>([{}]);
  const [sharedTrailerType, setSharedTrailerType] = useState('');
  const [trailerTypeError, setTrailerTypeError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedErrors, setSharedErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    pickupStreet: '', pickupCity: '', pickupState: '', pickupZip: '',
    pickupType: 'BUSINESS', pickupDate: '',
    pickupFacilityName: '', pickupLocationContactName: '', pickupLocationContactPhone: '',
    dropStreet: '', dropCity: '', dropState: '', dropZip: '',
    dropType: 'RESIDENCE', deliveryDate: '',
    dropFacilityName: '', dropLocationContactName: '', dropLocationContactPhone: '',
    price: '', paymentMethod: '', paymentTiming: '', description: '',
    contactName: '', contactPhone: '', contactEmail: '', orderId: '', additionalNotes: '',
  });

  const handleSharedInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (sharedErrors[field]) setSharedErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleVehicleChange = (index: number, field: string, value: string) => {
    setVehicles(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    if (vehicleErrors[index]?.[field]) {
      setVehicleErrors(prev => {
        const next = [...prev];
        const e = { ...next[index] };
        delete e[field];
        next[index] = e;
        return next;
      });
    }
  };

  const addVehicle = () => {
    if (vehicles.length >= MAX_VEHICLES) return;
    setVehicles(prev => [...prev, emptyVehicle()]);
    setVehicleErrors(prev => [...prev, {}]);
    setVinDetailsMap(prev => ({ ...prev }));
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length === 1) return;
    setVehicles(prev => prev.filter((_, i) => i !== index));
    setVehicleErrors(prev => prev.filter((_, i) => i !== index));
    setVinDetailsMap(prev => {
      const next: Record<number, VinDecodeResult | null> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };

  const handleVinLookup = async (index: number) => {
    const vin = vehicles[index].vin.trim();
    if (!vin) { toast.error('Enter a VIN first.'); return; }
    setVinLookupIndex(index);
    try {
      const result = await triggerVinLookup(vin).unwrap();
      if (!result.success) {
        toast.error('VIN not found', { description: result.errorText || 'Invalid or unrecognized VIN.' });
        setVinDetailsMap(prev => ({ ...prev, [index]: null }));
        return;
      }
      setVehicles(prev => prev.map((v, i) => i === index ? {
        ...v,
        make: result.make || v.make,
        model: result.model || v.model,
        year: result.year ? String(result.year) : v.year,
        vehicleType: result.vehicleType || v.vehicleType,
      } : v));
      setVinDetailsMap(prev => ({ ...prev, [index]: result }));
      toast.success('Vehicle info loaded', {
        description: [result.year, result.make, result.model].filter(Boolean).join(' '),
      });
    } catch {
      toast.error('VIN lookup failed', { description: 'Could not reach the vehicle database.' });
    } finally {
      setVinLookupIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();

    // Validate per-vehicle
    const newVehicleErrors = vehicles.map(v =>
      buildErrors([
        [!v.make.trim(), 'make', 'Vehicle make is required.'],
        [!!v.make.trim() && v.make.trim().length > 50, 'make', 'Make must be 50 characters or fewer.'],
        [!v.model.trim(), 'model', 'Vehicle model is required.'],
        [!!v.model.trim() && v.model.trim().length > 50, 'model', 'Model must be 50 characters or fewer.'],
        [!v.year.trim(), 'year', 'Vehicle year is required.'],
        [!!v.year.trim() && !isValidVehicleYear(v.year), 'year', `Year must be between 1900 and ${currentYear + 2}.`],
        [!!v.vin.trim() && !isValidVin(v.vin), 'vin', 'VIN must be exactly 17 alphanumeric characters (no I, O, or Q).'],
      ])
    );
    setVehicleErrors(newVehicleErrors);

    // Validate shared fields
    const errs = buildErrors([
      [!!formData.pickupStreet.trim() && formData.pickupStreet.trim().length < 5, 'pickupStreet', 'Street address must be at least 5 characters.'],
      [!formData.pickupCity.trim(), 'pickupCity', 'Pickup city is required.'],
      [!!formData.pickupCity.trim() && !isValidCity(formData.pickupCity), 'pickupCity', 'Enter a valid city name.'],
      [!formData.pickupState, 'pickupState', 'Pickup state is required.'],
      [!!formData.pickupZip.trim() && !isValidZip(formData.pickupZip), 'pickupZip', 'ZIP code must be 5 digits.'],
      [!!formData.dropStreet.trim() && formData.dropStreet.trim().length < 5, 'dropStreet', 'Street address must be at least 5 characters.'],
      [!formData.dropCity.trim(), 'dropCity', 'Delivery city is required.'],
      [!!formData.dropCity.trim() && !isValidCity(formData.dropCity), 'dropCity', 'Enter a valid city name.'],
      [!formData.dropState, 'dropState', 'Delivery state is required.'],
      [!!formData.dropZip.trim() && !isValidZip(formData.dropZip), 'dropZip', 'ZIP code must be 5 digits.'],
      [!formData.price.trim(), 'price', 'Price is required.'],
      [!!formData.price.trim() && !isValidPrice(formData.price), 'price', 'Price must be between $1 and $999,999.'],
      [!formData.contactName.trim(), 'contactName', 'Contact name is required.'],
      [!!formData.contactName.trim() && !isValidName(formData.contactName, 2, 100), 'contactName', 'Contact name must be 2–100 characters.'],
      [!formData.contactPhone.trim(), 'contactPhone', 'Phone number is required.'],
      [!!formData.contactPhone.trim() && !isValidPhone(formData.contactPhone), 'contactPhone', 'Enter a valid US phone number (e.g. (555) 123-4567).'],
      [!formData.contactEmail.trim(), 'contactEmail', 'Email address is required.'],
      [!!formData.contactEmail.trim() && !isValidEmail(formData.contactEmail), 'contactEmail', 'Enter a valid email address.'],
      [!!formData.description.trim() && formData.description.trim().length > 1000, 'description', 'Notes must be 1,000 characters or fewer.'],
    ]);
    setSharedErrors(errs);

    const trailerErr = !sharedTrailerType ? 'Trailer type is required.' : '';
    setTrailerTypeError(trailerErr);

    const hasVehicleErrors = newVehicleErrors.some(e => Object.keys(e).length > 0);
    if (hasVehicleErrors || Object.keys(errs).length || trailerErr) {
      toast.error('Please fix the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    try {
      for (const vehicle of vehicles) {
        await createLoad({
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          vehicleYear: parseInt(vehicle.year, 10),
          vehicleType: vehicle.vehicleType || undefined,
          vehicleCondition: vehicle.condition || undefined,
          vin: vehicle.vin || undefined,
          trailerType: sharedTrailerType,
          vehicleAdditionalInfo: vehicle.additionalInfo || undefined,
          pickupStreet: formData.pickupStreet || undefined,
          pickupCity: formData.pickupCity,
          pickupState: formData.pickupState,
          pickupZip: formData.pickupZip || undefined,
          pickupCountry: 'US',
          pickupType: formData.pickupType,
          pickupLotNumber: formData.pickupFacilityName || undefined,
          pickupContactName: formData.pickupLocationContactName || undefined,
          pickupContactPhone: formData.pickupLocationContactPhone || undefined,
          dropStreet: formData.dropStreet || undefined,
          dropCity: formData.dropCity,
          dropState: formData.dropState,
          dropZip: formData.dropZip || undefined,
          dropCountry: 'US',
          dropType: formData.dropType,
          dropLotNumber: formData.dropFacilityName || undefined,
          dropContactName: formData.dropLocationContactName || undefined,
          dropContactPhone: formData.dropLocationContactPhone || undefined,
          price: parseFloat(formData.price),
          paymentMethod: formData.paymentMethod || undefined,
          paymentTiming: formData.paymentTiming || undefined,
          pickupDate: formData.pickupDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
          description: formData.description || undefined,
          contactName: formData.contactName || undefined,
          contactPhone: formData.contactPhone || undefined,
          contactEmail: formData.contactEmail || undefined,
          orderId: formData.orderId || undefined,
        }).unwrap();
        successCount++;
      }

      toast.success(
        vehicles.length === 1 ? 'Load posted successfully!' : `${successCount} loads posted successfully!`,
        {
          description: 'Your load(s) have been added to the board and are now visible to carriers.',
          icon: <CheckCircle className="size-5 text-green-600" />,
        }
      );
      navigate('/loads');
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Failed to post load. Please try again.';
      if (successCount > 0) {
        toast.warning(`${successCount} of ${vehicles.length} loads posted. One or more failed.`, { description: message });
        navigate('/loads');
      } else {
        toast.error('Failed to post load', { description: message });
      }
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
            {/* Vehicles */}
            {vehicles.map((vehicle, index) => (
              <div key={index} className="relative mb-2">
                {vehicles.length > 1 && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-foreground">Vehicle {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVehicle(index)}
                      className="ml-auto flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <X className="size-3.5" /> Remove
                    </button>
                  </div>
                )}
                <VehicleInfoSection
                  formData={vehicle}
                  fieldErrors={vehicleErrors[index] ?? {}}
                  onChange={(field, value) => handleVehicleChange(index, field, value)}
                  onVinLookup={() => handleVinLookup(index)}
                  vinLookupLoading={vinLookupLoading && vinLookupIndex === index}
                  vinDetails={vinDetailsMap[index]}
                  hideTrailerType
                />
              </div>
            ))}

            {/* Add Vehicle Button */}
            {vehicles.length < MAX_VEHICLES && (
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVehicle}
                  className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                  <Plus className="size-4" />
                  Add Another Vehicle ({vehicles.length}/{MAX_VEHICLES})
                </Button>
              </div>
            )}

            {/* Shared Trailer Type */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Trailer Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="sharedTrailerType">Trailer Type *</Label>
                  <Select value={sharedTrailerType} onValueChange={v => { setSharedTrailerType(v); setTrailerTypeError(''); }}>
                    <SelectTrigger id="sharedTrailerType" aria-invalid={!!trailerTypeError}>
                      <SelectValue placeholder="Select trailer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open Trailer</SelectItem>
                      <SelectItem value="enclosed">Enclosed Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                  {trailerTypeError && <p className="text-xs text-destructive mt-1">{trailerTypeError}</p>}
                </div>
              </CardContent>
            </Card>

            <LocationSection
              prefix="pickup"
              title="Pickup Location"
              description="Where will the vehicle be picked up?"
              formData={{ street: formData.pickupStreet, city: formData.pickupCity, state: formData.pickupState, zip: formData.pickupZip, type: formData.pickupType, date: formData.pickupDate, facilityName: formData.pickupFacilityName, locationContactName: formData.pickupLocationContactName, locationContactPhone: formData.pickupLocationContactPhone }}
              fieldErrors={sharedErrors}
              onChange={handleSharedInputChange}
            />
            <LocationSection
              prefix="drop"
              title="Delivery Location"
              description="Where should the vehicle be delivered?"
              formData={{ street: formData.dropStreet, city: formData.dropCity, state: formData.dropState, zip: formData.dropZip, type: formData.dropType, date: formData.deliveryDate, facilityName: formData.dropFacilityName, locationContactName: formData.dropLocationContactName, locationContactPhone: formData.dropLocationContactPhone }}
              fieldErrors={sharedErrors}
              onChange={handleSharedInputChange}
            />
            <PricingNotesSection
              formData={{
                price: formData.price,
                paymentMethod: formData.paymentMethod,
                paymentTiming: formData.paymentTiming,
                description: formData.description,
              }}
              fieldErrors={sharedErrors}
              onChange={handleSharedInputChange}
            />
            <ContactInfoSection
              formData={{
                contactName: formData.contactName,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
                orderId: formData.orderId,
                additionalNotes: formData.additionalNotes,
              }}
              fieldErrors={sharedErrors}
              onChange={handleSharedInputChange}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Posting...'
                  : vehicles.length === 1 ? 'Post Load' : `Post ${vehicles.length} Loads`}
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
