import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { type FieldErrors } from '../../utils/validation';

interface Props {
  formData: {
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    orderId: string;
    additionalNotes: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
}

export function ContactInfoSection({ formData, fieldErrors, onChange }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Provide your contact details for this load</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              placeholder="Your full name"
              value={formData.contactName}
              onChange={e => onChange('contactName', e.target.value)}
              aria-invalid={!!fieldErrors.contactName}
            />
            {fieldErrors.contactName && <p className="text-xs text-destructive mt-1">{fieldErrors.contactName}</p>}
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone Number *</Label>
            <Input
              id="contactPhone"
              placeholder="(555) 123-4567"
              value={formData.contactPhone}
              onChange={e => onChange('contactPhone', e.target.value)}
              aria-invalid={!!fieldErrors.contactPhone}
            />
            {fieldErrors.contactPhone && <p className="text-xs text-destructive mt-1">{fieldErrors.contactPhone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="contactEmail">Email Address *</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="your.email@example.com"
            value={formData.contactEmail}
            onChange={e => onChange('contactEmail', e.target.value)}
            aria-invalid={!!fieldErrors.contactEmail}
          />
          {fieldErrors.contactEmail && <p className="text-xs text-destructive mt-1">{fieldErrors.contactEmail}</p>}
        </div>

        <div>
          <Label htmlFor="orderId">Order ID (Optional)</Label>
          <Input
            id="orderId"
            placeholder="e.g., ORD-12345"
            value={formData.orderId}
            onChange={e => onChange('orderId', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">Your internal order reference number - will be shown on the loadboard</p>
        </div>

        <div>
          <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any special requirements, preferred trailer type, or other important information..."
            rows={3}
            value={formData.additionalNotes}
            onChange={e => onChange('additionalNotes', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
