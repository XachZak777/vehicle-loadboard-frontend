import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FormGrid, HintText } from '../../styles/signup.styles';
import type { FieldErrors } from '../../utils/validation';

interface Props {
  formData: {
    insuranceCompany: string;
    cargoInsurance: string;
    liabilityInsurance: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function InsuranceInfoStep({ formData, fieldErrors, onChange, onSubmit, onBack }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Information</CardTitle>
        <CardDescription>Provide your insurance coverage details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="insuranceCompany">Insurance Company Name *</Label>
          <Input
            id="insuranceCompany"
            value={formData.insuranceCompany}
            onChange={(e) => onChange('insuranceCompany', e.target.value)}
            placeholder="ABC Insurance Co."
            maxLength={100}
            aria-invalid={!!fieldErrors.insuranceCompany}
          />
          {fieldErrors.insuranceCompany && (
            <p className="text-xs text-destructive mt-1">{fieldErrors.insuranceCompany}</p>
          )}
        </div>

        <FormGrid>
          <div>
            <Label htmlFor="cargoInsurance">Cargo Insurance Coverage *</Label>
            <Input
              id="cargoInsurance"
              type="number"
              value={formData.cargoInsurance}
              onChange={(e) => onChange('cargoInsurance', e.target.value)}
              placeholder="100000"
              min="1"
              max="999999999"
              step="1"
              aria-invalid={!!fieldErrors.cargoInsurance}
            />
            {fieldErrors.cargoInsurance
              ? <p className="text-xs text-destructive mt-1">{fieldErrors.cargoInsurance}</p>
              : <HintText>Amount in USD</HintText>
            }
          </div>
          <div>
            <Label htmlFor="liabilityInsurance">Liability Insurance Coverage *</Label>
            <Input
              id="liabilityInsurance"
              type="number"
              value={formData.liabilityInsurance}
              onChange={(e) => onChange('liabilityInsurance', e.target.value)}
              placeholder="1000000"
              min="1"
              max="999999999"
              step="1"
              aria-invalid={!!fieldErrors.liabilityInsurance}
            />
            {fieldErrors.liabilityInsurance
              ? <p className="text-xs text-destructive mt-1">{fieldErrors.liabilityInsurance}</p>
              : <HintText>Amount in USD</HintText>
            }
          </div>
        </FormGrid>

        <Button
          onClick={onSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          Continue to W9 Upload
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
