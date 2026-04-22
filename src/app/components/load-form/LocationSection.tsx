import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { US_STATES } from '../../constants';
import { sanitizeDigits, type FieldErrors } from '../../utils/validation';

const LOCATION_TYPES = ['BUSINESS', 'RESIDENCE', 'AUCTION', 'PORT', 'OTHER'] as const;

type Prefix = 'pickup' | 'drop';

interface Props {
  prefix: Prefix;
  title: string;
  description: string;
  formData: {
    street: string;
    city: string;
    state: string;
    zip: string;
    type: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
}

export function LocationSection({ prefix, title, description, formData, fieldErrors, onChange }: Props) {
  const field = (name: string) => `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={field('street')}>Street Address</Label>
            <Input
              id={field('street')}
              placeholder="e.g., 100 Main St"
              value={formData.street}
              onChange={(e) => onChange(field('street'), e.target.value.trimStart())}
              maxLength={200}
              aria-invalid={!!fieldErrors[field('street')]}
            />
            {fieldErrors[field('street')] && (
              <p className="text-xs text-destructive mt-1">{fieldErrors[field('street')]}</p>
            )}
          </div>
          <div>
            <Label htmlFor={field('type')}>Location Type</Label>
            <Select value={formData.type} onValueChange={(v) => onChange(field('type'), v)}>
              <SelectTrigger id={field('type')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={field('city')}>City *</Label>
            <Input
              id={field('city')}
              placeholder="e.g., Chicago"
              value={formData.city}
              onChange={(e) => onChange(field('city'), e.target.value.trimStart().replace(/[^a-zA-Z\s'\-.]/g, ''))}
              maxLength={100}
              aria-invalid={!!fieldErrors[field('city')]}
            />
            {fieldErrors[field('city')] && (
              <p className="text-xs text-destructive mt-1">{fieldErrors[field('city')]}</p>
            )}
          </div>
          <div>
            <Label htmlFor={field('state')}>State *</Label>
            <Select value={formData.state} onValueChange={(v) => onChange(field('state'), v)}>
              <SelectTrigger id={field('state')} aria-invalid={!!fieldErrors[field('state')]}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors[field('state')] && (
              <p className="text-xs text-destructive mt-1">{fieldErrors[field('state')]}</p>
            )}
          </div>
          <div>
            <Label htmlFor={field('zip')}>ZIP Code</Label>
            <Input
              id={field('zip')}
              placeholder="e.g., 60601"
              value={formData.zip}
              onChange={(e) => onChange(field('zip'), sanitizeDigits(e.target.value))}
              maxLength={5}
              inputMode="numeric"
              aria-invalid={!!fieldErrors[field('zip')]}
            />
            {fieldErrors[field('zip')] && (
              <p className="text-xs text-destructive mt-1">{fieldErrors[field('zip')]}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
