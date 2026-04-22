import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { sanitizeDecimal, type FieldErrors } from '../../utils/validation';

interface Props {
  formData: {
    price: string;
    pickupDate: string;
    deliveryDate: string;
    description: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
}

export function PricingNotesSection({ formData, fieldErrors, onChange }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pricing & Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            inputMode="decimal"
            placeholder="e.g., 1500"
            value={formData.price}
            onChange={(e) => onChange('price', sanitizeDecimal(e.target.value))}
            aria-invalid={!!fieldErrors.price}
          />
          {fieldErrors.price && <p className="text-xs text-destructive mt-1">{fieldErrors.price}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupDate">Pickup Date</Label>
            <Input
              id="pickupDate"
              type="date"
              value={formData.pickupDate}
              onChange={(e) => onChange('pickupDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="deliveryDate">Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => onChange('deliveryDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Additional Notes</Label>
          <Textarea
            id="description"
            placeholder="Special instructions, trailer type preference, etc."
            rows={3}
            maxLength={1000}
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            aria-invalid={!!fieldErrors.description}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.description.length}/1000
          </p>
          {fieldErrors.description && (
            <p className="text-xs text-destructive mt-1">{fieldErrors.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
