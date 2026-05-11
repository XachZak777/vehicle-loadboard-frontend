import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { sanitizeDecimal, type FieldErrors } from '../../utils/validation';

interface Props {
  formData: {
    price: string;
    paymentMethod: string;
    paymentTiming: string;
    description: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
}

export function PricingNotesSection({ formData, fieldErrors, onChange }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pricing & Payment</CardTitle>
        <CardDescription>Set your price and payment terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            inputMode="decimal"
            placeholder="e.g., 450"
            value={formData.price}
            onChange={e => onChange('price', sanitizeDecimal(e.target.value))}
            aria-invalid={!!fieldErrors.price}
          />
          {fieldErrors.price && <p className="text-xs text-destructive mt-1">{fieldErrors.price}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={formData.paymentMethod} onValueChange={v => onChange('paymentMethod', v)}>
              <SelectTrigger id="paymentMethod" aria-invalid={!!fieldErrors.paymentMethod}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="ach">ACH Transfer</SelectItem>
                <SelectItem value="check">Company Check</SelectItem>
                <SelectItem value="certified-funds">Certified Funds</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.paymentMethod && <p className="text-xs text-destructive mt-1">{fieldErrors.paymentMethod}</p>}
          </div>
          <div>
            <Label htmlFor="paymentTiming">Payment Timing *</Label>
            <Select value={formData.paymentTiming} onValueChange={v => onChange('paymentTiming', v)}>
              <SelectTrigger id="paymentTiming" aria-invalid={!!fieldErrors.paymentTiming}>
                <SelectValue placeholder="Select payment timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-pickup">On Pickup</SelectItem>
                <SelectItem value="on-delivery">On Delivery</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.paymentTiming && <p className="text-xs text-destructive mt-1">{fieldErrors.paymentTiming}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Additional Notes</Label>
          <Textarea
            id="description"
            placeholder="Special instructions, requirements, etc."
            rows={3}
            maxLength={1000}
            value={formData.description}
            onChange={e => onChange('description', e.target.value)}
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
