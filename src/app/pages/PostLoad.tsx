import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { useCreateLoadMutation } from '../store/services/hauliusApi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { ArrowLeft, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  isValidVehicleYear, isValidPrice, isValidWeight, isValidZip, isValidCity,
  buildErrors, type FieldErrors,
} from '../utils/validation';
import { VehicleInfoSection } from '../components/load-form/VehicleInfoSection';
import { LocationSection } from '../components/load-form/LocationSection';
import { PricingNotesSection } from '../components/load-form/PricingNotesSection';

export function PostLoad() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [createLoad] = useCreateLoadMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
    pickupDate: '',
    deliveryDate: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentYear = new Date().getFullYear();
    const errs = buildErrors([
      // Vehicle
      [!formData.make.trim(), 'make', 'Vehicle make is required.'],
      [!!formData.make.trim() && formData.make.trim().length > 50, 'make', 'Make must be 50 characters or fewer.'],
      [!formData.model.trim(), 'model', 'Vehicle model is required.'],
      [!!formData.model.trim() && formData.model.trim().length > 50, 'model', 'Model must be 50 characters or fewer.'],
      [!formData.year.trim(), 'year', 'Vehicle year is required.'],
      [!!formData.year.trim() && !isValidVehicleYear(formData.year), 'year', `Year must be between 1900 and ${currentYear + 2}.`],
      [!!formData.weight.trim() && !isValidWeight(formData.weight), 'weight', 'Weight must be between 1 and 100,000 lbs.'],
      // Pickup
      [!!formData.pickupStreet.trim() && formData.pickupStreet.trim().length < 5, 'pickupStreet', 'Street address must be at least 5 characters.'],
      [!formData.pickupCity.trim(), 'pickupCity', 'Pickup city is required.'],
      [!!formData.pickupCity.trim() && !isValidCity(formData.pickupCity), 'pickupCity', 'Enter a valid city name (letters and spaces only).'],
      [!formData.pickupState, 'pickupState', 'Pickup state is required.'],
      [!!formData.pickupZip.trim() && !isValidZip(formData.pickupZip), 'pickupZip', 'ZIP code must be 5 digits (e.g. 60601).'],
      // Delivery
      [!!formData.dropStreet.trim() && formData.dropStreet.trim().length < 5, 'dropStreet', 'Street address must be at least 5 characters.'],
      [!formData.dropCity.trim(), 'dropCity', 'Delivery city is required.'],
      [!!formData.dropCity.trim() && !isValidCity(formData.dropCity), 'dropCity', 'Enter a valid city name (letters and spaces only).'],
      [!formData.dropState, 'dropState', 'Delivery state is required.'],
      [!!formData.dropZip.trim() && !isValidZip(formData.dropZip), 'dropZip', 'ZIP code must be 5 digits (e.g. 90001).'],
      // Price
      [!formData.price.trim(), 'price', 'Price is required.'],
      [!!formData.price.trim() && !isValidPrice(formData.price), 'price', 'Price must be between $1 and $999,999.'],
      // Description
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
        pickupDate: formData.pickupDate || undefined,
        deliveryDate: formData.deliveryDate || undefined,
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
            <VehicleInfoSection
              formData={{ make: formData.make, model: formData.model, year: formData.year, condition: formData.condition, weight: formData.weight }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
            <LocationSection
              prefix="pickup"
              title="Pickup Location"
              description="Where will the vehicle be picked up?"
              formData={{ street: formData.pickupStreet, city: formData.pickupCity, state: formData.pickupState, zip: formData.pickupZip, type: formData.pickupType }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
            <LocationSection
              prefix="drop"
              title="Delivery Location"
              description="Where should the vehicle be delivered?"
              formData={{ street: formData.dropStreet, city: formData.dropCity, state: formData.dropState, zip: formData.dropZip, type: formData.dropType }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
            <PricingNotesSection
              formData={{ price: formData.price, pickupDate: formData.pickupDate, deliveryDate: formData.deliveryDate, description: formData.description }}
              fieldErrors={fieldErrors}
              onChange={handleInputChange}
            />
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
