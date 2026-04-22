import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FormGrid, HintText } from '../../styles/signup.styles';
import { sanitizeDigits, type FieldErrors } from '../../utils/validation';

interface Props {
  formData: { mcNumber: string; dotNumber: string };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  entityLabel?: string;
}

export function CompanyInfoStep({ formData, fieldErrors, onChange, onSubmit, entityLabel = 'carrier' }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your MC / DOT Number</CardTitle>
        <CardDescription>
          Provide your MC number (required) and DOT number (optional) to look up your {entityLabel} information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormGrid>
          <div>
            <Label htmlFor="mcNumber">MC Number *</Label>
            <Input
              id="mcNumber"
              value={formData.mcNumber}
              onChange={(e) => onChange('mcNumber', sanitizeDigits(e.target.value))}
              placeholder="123456"
              maxLength={10}
              inputMode="numeric"
              aria-invalid={!!fieldErrors.mcNumber}
            />
            {fieldErrors.mcNumber
              ? <p className="text-xs text-destructive mt-1">{fieldErrors.mcNumber}</p>
              : <HintText>Your MC authority number (e.g. 123456)</HintText>
            }
          </div>
          <div>
            <Label htmlFor="dotNumber">DOT Number (Optional)</Label>
            <Input
              id="dotNumber"
              value={formData.dotNumber}
              onChange={(e) => onChange('dotNumber', sanitizeDigits(e.target.value))}
              placeholder="123456"
              maxLength={8}
              inputMode="numeric"
              aria-invalid={!!fieldErrors.dotNumber}
            />
            {fieldErrors.dotNumber && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.dotNumber}</p>
            )}
          </div>
        </FormGrid>

        <Button
          onClick={onSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          Continue to Verification
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
