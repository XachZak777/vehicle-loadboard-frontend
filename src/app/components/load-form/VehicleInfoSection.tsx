import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';
import { sanitizeDigits, type FieldErrors } from '../../utils/validation';
import type { VinDecodeResult } from '../../store/services/hauliusApi';

interface Props {
  formData: {
    vin: string;
    vehicleType: string;
    condition: string;
    make: string;
    model: string;
    year: string;
    trailerType: string;
    additionalInfo: string;
    weight: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onVinLookup?: () => void;
  vinLookupLoading?: boolean;
  vinDetails?: VinDecodeResult | null;
  hideCondition?: boolean;
  hideTrailerType?: boolean;
}

const VEHICLE_TYPES = ['sedan', 'suv', 'truck', 'van', 'motorcycle', 'rv', 'boat', 'atv'];
const VEHICLE_TYPE_LABELS: Record<string, string> = {
  sedan: 'Sedan', suv: 'SUV', truck: 'Truck', van: 'Van',
  motorcycle: 'Motorcycle', rv: 'RV', boat: 'Boat', atv: 'ATV',
};

export function VehicleInfoSection({ formData, fieldErrors, onChange, onVinLookup, vinLookupLoading = false, vinDetails = null, hideCondition = false, hideTrailerType = false }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
        <CardDescription>Provide details about the vehicle to be transported</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VIN Lookup */}
        <div>
          <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="vin"
              placeholder="Enter VIN for auto-fill"
              value={formData.vin}
              onChange={e => onChange('vin', e.target.value.toUpperCase())}
              className="flex-1"
              aria-invalid={!!fieldErrors.vin}
            />
            <Button
              type="button"
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex-shrink-0 min-w-[88px]"
              onClick={onVinLookup}
              disabled={vinLookupLoading}
            >
              {vinLookupLoading
                ? <><Loader2 className="size-3.5 animate-spin mr-1" />Looking…</>
                : 'Lookup'}
            </Button>
          </div>
          {fieldErrors.vin && <p className="text-xs text-destructive mt-1">{fieldErrors.vin}</p>}
          {!fieldErrors.vin && <p className="text-xs text-muted-foreground mt-1">Enter VIN and click Lookup to auto-fill vehicle details</p>}
        </div>

        {/* VIN Lookup Result Panel */}
        {vinDetails?.success && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-sm space-y-1">
            <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
              Decoded: {[vinDetails.year, vinDetails.make, vinDetails.model].filter(Boolean).join(' ')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
              {vinDetails.bodyClass && <span><span className="font-medium text-foreground">Body:</span> {vinDetails.bodyClass}</span>}
              {vinDetails.trim      && <span><span className="font-medium text-foreground">Trim:</span> {vinDetails.trim}</span>}
              {vinDetails.fuelType  && <span><span className="font-medium text-foreground">Fuel:</span> {vinDetails.fuelType}</span>}
              {vinDetails.engineHp  && <span><span className="font-medium text-foreground">HP:</span> {vinDetails.engineHp}</span>}
              {vinDetails.cylinders && <span><span className="font-medium text-foreground">Cylinders:</span> {vinDetails.cylinders}</span>}
              {vinDetails.displacementL && <span><span className="font-medium text-foreground">Displacement:</span> {vinDetails.displacementL}L</span>}
              {vinDetails.driveType && <span><span className="font-medium text-foreground">Drive:</span> {vinDetails.driveType}</span>}
            </div>
          </div>
        )}

        {/* Vehicle Type & Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Select value={formData.vehicleType} onValueChange={v => onChange('vehicleType', v)}>
              <SelectTrigger id="vehicleType" aria-invalid={!!fieldErrors.vehicleType}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{VEHICLE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.vehicleType && <p className="text-xs text-destructive mt-1">{fieldErrors.vehicleType}</p>}
          </div>
          {!hideCondition && (
            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select value={formData.condition} onValueChange={v => onChange('condition', v)}>
                <SelectTrigger id="condition" aria-invalid={!!fieldErrors.condition}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="non-running">Non-Running</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.condition && <p className="text-xs text-destructive mt-1">{fieldErrors.condition}</p>}
            </div>
          )}
        </div>

        {/* Make, Model, Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              placeholder="e.g., Toyota"
              value={formData.make}
              onChange={e => onChange('make', e.target.value.trimStart().replace(/[^a-zA-Z0-9\s\-]/g, ''))}
              maxLength={50}
              aria-invalid={!!fieldErrors.make}
            />
            {fieldErrors.make && <p className="text-xs text-destructive mt-1">{fieldErrors.make}</p>}
          </div>
          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              placeholder="e.g., Camry"
              value={formData.model}
              onChange={e => onChange('model', e.target.value.trimStart().replace(/[^a-zA-Z0-9\s\-]/g, ''))}
              maxLength={50}
              aria-invalid={!!fieldErrors.model}
            />
            {fieldErrors.model && <p className="text-xs text-destructive mt-1">{fieldErrors.model}</p>}
          </div>
          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              inputMode="numeric"
              placeholder="e.g., 2022"
              value={formData.year}
              onChange={e => onChange('year', sanitizeDigits(e.target.value))}
              maxLength={4}
              aria-invalid={!!fieldErrors.year}
            />
            {fieldErrors.year && <p className="text-xs text-destructive mt-1">{fieldErrors.year}</p>}
          </div>
        </div>

        {/* Trailer Type */}
        {!hideTrailerType && (
          <div>
            <Label htmlFor="trailerType">Trailer Type *</Label>
            <Select value={formData.trailerType} onValueChange={v => onChange('trailerType', v)}>
              <SelectTrigger id="trailerType" aria-invalid={!!fieldErrors.trailerType}>
                <SelectValue placeholder="Select trailer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Trailer</SelectItem>
                <SelectItem value="enclosed">Enclosed Trailer</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.trailerType && <p className="text-xs text-destructive mt-1">{fieldErrors.trailerType}</p>}
          </div>
        )}

        {/* Additional Vehicle Info */}
        <div>
          <Label htmlFor="additionalInfo">Additional Vehicle Information (Optional)</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Lot number, special instructions, etc. (Not shown on loadboard - only for assigned carrier)"
            rows={2}
            value={formData.additionalInfo}
            onChange={e => onChange('additionalInfo', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">This information will only be visible to the carrier assigned to this load</p>
        </div>
      </CardContent>
    </Card>
  );
}
