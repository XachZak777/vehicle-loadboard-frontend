import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useGetLoadsQuery, useUpdateLoadMutation, useLazyVinLookupQuery, type VinDecodeResult } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { ArrowLeft, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  isValidVehicleYear, isValidPrice, isValidWeight, isValidZip, isValidCity,
  isValidVin, buildErrors, type FieldErrors,
} from '../utils/validation';
import { VehicleInfoSection } from '../components/load-form/VehicleInfoSection';
import { LocationSection } from '../components/load-form/LocationSection';
import { PricingNotesSection } from '../components/load-form/PricingNotesSection';

export function EditLoad() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [updateLoad] = useUpdateLoadMutation();
  const { data: allLoads = [], isLoading: loadingLoads } = useGetLoadsQuery();
  const [triggerVinLookup, { isFetching: vinLookupLoading }] = useLazyVinLookupQuery();
  const [vinDetails, setVinDetails] = useState<VinDecodeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    vin: '', vehicleType: '', condition: '', make: '', model: '', year: '',
    trailerType: '', additionalInfo: '', weight: '',
    pickupStreet: '', pickupCity: '', pickupState: '', pickupZip: '', pickupType: 'BUSINESS',
    pickupDate: '', pickupFacilityName: '', pickupLocationContactName: '', pickupLocationContactPhone: '',
    dropStreet: '', dropCity: '', dropState: '', dropZip: '', dropType: 'RESIDENCE',
    deliveryDate: '', dropFacilityName: '', dropLocationContactName: '', dropLocationContactPhone: '',
    price: '', paymentMethod: '', paymentTiming: '', description: '',
  });

  const load = allLoads.find(l => l.id === id);

  useEffect(() => {
    if (load && !initialized) {
      setFormData({
        vin: load.vin ?? '',
        vehicleType: load.vehicleType ?? '',
        condition: load.vehicleCondition ?? '',
        make: load.vehicleMake ?? '',
        model: load.vehicleModel ?? '',
        year: load.vehicleYear?.toString() ?? '',
        trailerType: load.trailerType ?? '',
        additionalInfo: '',
        weight: load.weight?.toString() ?? '',
        pickupStreet: load.pickupStreet ?? '',
        pickupCity: load.pickupCity ?? '',
        pickupState: load.pickupState ?? '',
        pickupZip: load.pickupZip ?? '',
        pickupType: (load.pickupType as string) ?? 'BUSINESS',
        pickupDate: load.pickupDate ?? '',
        pickupFacilityName: load.pickupLotNumber ?? '',
        pickupLocationContactName: load.pickupContactName ?? '',
        pickupLocationContactPhone: load.pickupContactPhone ?? '',
        dropStreet: load.dropStreet ?? '',
        dropCity: load.dropCity ?? '',
        dropState: load.dropState ?? '',
        dropZip: load.dropZip ?? '',
        dropType: (load.dropType as string) ?? 'RESIDENCE',
        deliveryDate: load.deliveryDate ?? '',
        dropFacilityName: load.dropLotNumber ?? '',
        dropLocationContactName: load.dropContactName ?? '',
        dropLocationContactPhone: load.dropContactPhone ?? '',
        price: load.price?.toString() ?? '',
        paymentMethod: load.paymentMethod ?? '',
        paymentTiming: load.paymentTiming ?? '',
        description: load.description ?? '',
      });
      setInitialized(true);
    }
  }, [load, initialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleVinLookup = async () => {
    const vin = formData.vin.trim();
    if (!vin) { toast.error('Enter a VIN first.'); return; }
    try {
      const result = await triggerVinLookup(vin).unwrap();
      if (!result.success) {
        toast.error('VIN not found', { description: result.errorText || 'Invalid or unrecognized VIN.' });
        setVinDetails(null);
        return;
      }
      if (result.make)        handleInputChange('make', result.make);
      if (result.model)       handleInputChange('model', result.model);
      if (result.year)        handleInputChange('year', String(result.year));
      if (result.vehicleType) handleInputChange('vehicleType', result.vehicleType);
      setVinDetails(result);
      toast.success('Vehicle info loaded', {
        description: [result.year, result.make, result.model].filter(Boolean).join(' '),
      });
    } catch {
      toast.error('VIN lookup failed', { description: 'Could not reach the vehicle database.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();
    const errs = buildErrors([
      [!!formData.vin.trim() && !isValidVin(formData.vin), 'vin', 'VIN must be exactly 17 alphanumeric characters (no I, O, or Q).'],
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
          vehicleType: formData.vehicleType || undefined,
          vehicleCondition: formData.condition || undefined,
          vin: formData.vin || undefined,
          trailerType: formData.trailerType || undefined,
          vehicleAdditionalInfo: formData.additionalInfo || undefined,
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
            <VehicleInfoSection
              formData={{ vin: formData.vin, vehicleType: formData.vehicleType, condition: formData.condition, make: formData.make, model: formData.model, year: formData.year, trailerType: formData.trailerType, additionalInfo: formData.additionalInfo, weight: formData.weight }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
              onVinLookup={handleVinLookup}
              vinLookupLoading={vinLookupLoading}
              vinDetails={vinDetails}
            />
            <LocationSection
              prefix="pickup"
              title="Pickup Location"
              description="Where will the vehicle be picked up?"
              formData={{ street: formData.pickupStreet, city: formData.pickupCity, state: formData.pickupState, zip: formData.pickupZip, type: formData.pickupType, date: formData.pickupDate, facilityName: formData.pickupFacilityName, locationContactName: formData.pickupLocationContactName, locationContactPhone: formData.pickupLocationContactPhone }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
            <LocationSection
              prefix="drop"
              title="Delivery Location"
              description="Where should the vehicle be delivered?"
              formData={{ street: formData.dropStreet, city: formData.dropCity, state: formData.dropState, zip: formData.dropZip, type: formData.dropType, date: formData.deliveryDate, facilityName: formData.dropFacilityName, locationContactName: formData.dropLocationContactName, locationContactPhone: formData.dropLocationContactPhone }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
            <PricingNotesSection
              formData={{ price: formData.price, paymentMethod: formData.paymentMethod, paymentTiming: formData.paymentTiming, description: formData.description }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
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
