import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PhoneInput } from '../ui/PhoneInput';
import { HintText } from '../../styles/signup.styles';
import { sanitizeTaxId, type FieldErrors } from '../../utils/validation';

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
    taxIdType: 'EIN' | 'SSN';
    taxId: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function BrokerInfoStep({ formData, fieldErrors, onChange, onSubmit, onBack }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bond & Tax Information</CardTitle>
        <CardDescription>Provide your surety bond details and tax identification</CardDescription>
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
              placeholder="e.g. 75000"
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
            <PhoneInput
              id="bondAgentPhone"
              value={formData.bondAgentPhone}
              onChange={v => onChange('bondAgentPhone', v)}
              aria-invalid={!!fieldErrors.bondAgentPhone}
            />
            {fieldErrors.bondAgentPhone && <p className="text-xs text-destructive mt-1">{fieldErrors.bondAgentPhone}</p>}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <Label htmlFor="taxIdType">Tax ID Type *</Label>
          <Select
            value={formData.taxIdType}
            onValueChange={(value: 'SSN' | 'EIN') => {
              onChange('taxIdType', value);
              onChange('taxId', '');
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EIN">EIN (Employer Identification Number)</SelectItem>
              <SelectItem value="SSN">SSN (Social Security Number)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="taxId">{formData.taxIdType === 'EIN' ? 'EIN' : 'SSN'} *</Label>
          <Input
            id="taxId"
            type="password"
            autoComplete="off"
            value={formData.taxId}
            onChange={e => onChange('taxId', sanitizeTaxId(e.target.value))}
            placeholder={formData.taxIdType === 'EIN' ? '12-3456789' : '123-45-6789'}
            maxLength={11}
            aria-invalid={!!fieldErrors.taxId}
          />
          {fieldErrors.taxId
            ? <p className="text-xs text-destructive mt-1">{fieldErrors.taxId}</p>
            : <HintText>{formData.taxIdType === 'EIN' ? 'Format: XX-XXXXXXX' : 'Format: XXX-XX-XXXX'}</HintText>
          }
        </div>

        <Button onClick={onSubmit} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          Continue to Documents
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
