import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { type FieldErrors } from '../../utils/validation';

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

export function CarrierInsuranceStep({ formData, fieldErrors, onChange, onSubmit, onBack }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Information</CardTitle>
        <CardDescription>Provide your carrier insurance details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="insuranceCompany">Insurance Company <span className="text-destructive">*</span></Label>
          <Input
            id="insuranceCompany"
            placeholder="Insurance Company Name"
            value={formData.insuranceCompany}
            onChange={e => onChange('insuranceCompany', e.target.value.trimStart())}
            maxLength={100}
            aria-invalid={!!fieldErrors.insuranceCompany}
          />
          {fieldErrors.insuranceCompany && <p className="text-xs text-destructive mt-1">{fieldErrors.insuranceCompany}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cargoInsurance">Cargo Insurance <span className="text-destructive">*</span></Label>
            <Input
              id="cargoInsurance"
              placeholder="e.g. 100000"
              inputMode="numeric"
              value={formData.cargoInsurance}
              onChange={e => onChange('cargoInsurance', e.target.value.replace(/[^\d.]/g, ''))}
              maxLength={20}
              aria-invalid={!!fieldErrors.cargoInsurance}
            />
            {fieldErrors.cargoInsurance && <p className="text-xs text-destructive mt-1">{fieldErrors.cargoInsurance}</p>}
          </div>
          <div>
            <Label htmlFor="liabilityInsurance">Liability Insurance <span className="text-destructive">*</span></Label>
            <Input
              id="liabilityInsurance"
              placeholder="e.g. 1000000"
              inputMode="numeric"
              value={formData.liabilityInsurance}
              onChange={e => onChange('liabilityInsurance', e.target.value.replace(/[^\d.]/g, ''))}
              maxLength={20}
              aria-invalid={!!fieldErrors.liabilityInsurance}
            />
            {fieldErrors.liabilityInsurance && <p className="text-xs text-destructive mt-1">{fieldErrors.liabilityInsurance}</p>}
          </div>
        </div>

        <Button onClick={onSubmit} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          Continue to Documents Upload
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
