import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { HintText } from '../../styles/signup.styles';
import { type FieldErrors } from '../../utils/validation';

interface Props {
  formData: {
    bondCompany: string;
    bondPolicyNumber: string;
    bondCoverage: string;
    bondEffectiveDate: string;
    bondAgentFirstName: string;
    bondAgentLastName: string;
    bondAgentEmail: string;
    bondAgentPhone: string;
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
        <CardTitle>Bond Information</CardTitle>
        <CardDescription>Provide your surety bond details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bondCompany">Bond Company <span className="text-destructive">*</span></Label>
          <Input
            id="bondCompany"
            placeholder="Bond Company Name"
            value={formData.bondCompany}
            onChange={e => onChange('bondCompany', e.target.value.trimStart())}
            maxLength={100}
            aria-invalid={!!fieldErrors.bondCompany}
          />
          {fieldErrors.bondCompany && <p className="text-xs text-destructive mt-1">{fieldErrors.bondCompany}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bondPolicyNumber">Bond Policy Number <span className="text-destructive">*</span></Label>
            <Input
              id="bondPolicyNumber"
              placeholder="XXXXXXXXX"
              value={formData.bondPolicyNumber}
              onChange={e => onChange('bondPolicyNumber', e.target.value.trimStart())}
              maxLength={50}
              aria-invalid={!!fieldErrors.bondPolicyNumber}
            />
            {fieldErrors.bondPolicyNumber && <p className="text-xs text-destructive mt-1">{fieldErrors.bondPolicyNumber}</p>}
          </div>
          <div>
            <Label htmlFor="bondCoverage">Bond Coverage <span className="text-destructive">*</span></Label>
            <Input
              id="bondCoverage"
              placeholder="XXXXXX"
              inputMode="numeric"
              value={formData.bondCoverage}
              onChange={e => onChange('bondCoverage', e.target.value.replace(/[^\d]/g, ''))}
              maxLength={20}
              aria-invalid={!!fieldErrors.bondCoverage}
            />
            <HintText>Amount in USD</HintText>
            {fieldErrors.bondCoverage && <p className="text-xs text-destructive mt-1">{fieldErrors.bondCoverage}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="bondEffectiveDate">Bond Effective Date <span className="text-destructive">*</span></Label>
          <Input
            id="bondEffectiveDate"
            type="date"
            value={formData.bondEffectiveDate}
            onChange={e => onChange('bondEffectiveDate', e.target.value)}
            aria-invalid={!!fieldErrors.bondEffectiveDate}
          />
          {fieldErrors.bondEffectiveDate && <p className="text-xs text-destructive mt-1">{fieldErrors.bondEffectiveDate}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bondAgentFirstName">Bond Agent First Name <span className="text-destructive">*</span></Label>
            <Input
              id="bondAgentFirstName"
              placeholder="First name"
              value={formData.bondAgentFirstName}
              onChange={e => onChange('bondAgentFirstName', e.target.value.trimStart())}
              maxLength={50}
              aria-invalid={!!fieldErrors.bondAgentFirstName}
            />
            {fieldErrors.bondAgentFirstName && <p className="text-xs text-destructive mt-1">{fieldErrors.bondAgentFirstName}</p>}
          </div>
          <div>
            <Label htmlFor="bondAgentLastName">Bond Agent Last Name <span className="text-destructive">*</span></Label>
            <Input
              id="bondAgentLastName"
              placeholder="Last name"
              value={formData.bondAgentLastName}
              onChange={e => onChange('bondAgentLastName', e.target.value.trimStart())}
              maxLength={50}
              aria-invalid={!!fieldErrors.bondAgentLastName}
            />
            {fieldErrors.bondAgentLastName && <p className="text-xs text-destructive mt-1">{fieldErrors.bondAgentLastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bondAgentEmail">Bond Agent Email <span className="text-destructive">*</span></Label>
            <Input
              id="bondAgentEmail"
              type="email"
              placeholder="Email"
              value={formData.bondAgentEmail}
              onChange={e => onChange('bondAgentEmail', e.target.value.trim())}
              maxLength={254}
              aria-invalid={!!fieldErrors.bondAgentEmail}
            />
            {fieldErrors.bondAgentEmail && <p className="text-xs text-destructive mt-1">{fieldErrors.bondAgentEmail}</p>}
          </div>
          <div>
            <Label htmlFor="bondAgentPhone">Bond Agent Phone <span className="text-destructive">*</span></Label>
            <Input
              id="bondAgentPhone"
              placeholder="(XXX) XXX-XXXX"
              value={formData.bondAgentPhone}
              onChange={e => onChange('bondAgentPhone', e.target.value.trimStart())}
              maxLength={20}
              aria-invalid={!!fieldErrors.bondAgentPhone}
            />
            {fieldErrors.bondAgentPhone && <p className="text-xs text-destructive mt-1">{fieldErrors.bondAgentPhone}</p>}
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
