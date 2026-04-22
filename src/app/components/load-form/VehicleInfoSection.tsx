import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { FieldErrors } from '../../utils/validation';

interface Props {
  formData: {
    make: string;
    model: string;
    year: string;
    condition: string;
    weight: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  /** When true, the Condition select is hidden (e.g. on the Edit Load page). */
  hideCondition?: boolean;
}

export function VehicleInfoSection({ formData, fieldErrors, onChange, hideCondition = false }: Props) {
  return (
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
              onChange={(e) => onChange('make', e.target.value)}
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
              onChange={(e) => onChange('model', e.target.value)}
              maxLength={50}
              aria-invalid={!!fieldErrors.model}
            />
            {fieldErrors.model && <p className="text-xs text-destructive mt-1">{fieldErrors.model}</p>}
          </div>
          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2022"
              min="1900"
              max={new Date().getFullYear() + 2}
              value={formData.year}
              onChange={(e) => onChange('year', e.target.value)}
              aria-invalid={!!fieldErrors.year}
            />
            {fieldErrors.year && <p className="text-xs text-destructive mt-1">{fieldErrors.year}</p>}
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 ${hideCondition ? '' : 'md:grid-cols-2'}`}>
          {!hideCondition && (
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(v) => onChange('condition', v)}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="non-running">Non-Running</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 3500"
              min="1"
              max="100000"
              step="1"
              value={formData.weight}
              onChange={(e) => onChange('weight', e.target.value)}
              aria-invalid={!!fieldErrors.weight}
            />
            {fieldErrors.weight && <p className="text-xs text-destructive mt-1">{fieldErrors.weight}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
