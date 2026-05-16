import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Building2 } from 'lucide-react';
import { FormGrid, HintText } from '../../styles/signup.styles';
import { sanitizeDigits, type FieldErrors } from '../../utils/validation';
import { PhoneInput } from '../ui/PhoneInput';
import { US_STATES } from '../../constants';

interface Props {
  role: 'carrier' | 'broker';
  formData: {
    companyName: string;
    dbaName?: string;
    mcNumber: string;
    dotNumber: string;
    phoneNumber: string;
    mailingAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export function CompanyInfoStep({ role, formData, fieldErrors, onChange, onSubmit }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-6" />
          Company Information
        </CardTitle>
        <CardDescription>
          Enter your {role === 'carrier' ? 'carrier' : 'broker'} company details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="companyName">Legal Company Name <span className="text-destructive">*</span></Label>
          <Input
            id="companyName"
            placeholder="Your Company LLC"
            value={formData.companyName}
            onChange={e => onChange('companyName', e.target.value.trimStart())}
            maxLength={100}
            aria-invalid={!!fieldErrors.companyName}
          />
          {fieldErrors.companyName && <p className="text-xs text-destructive mt-1">{fieldErrors.companyName}</p>}
        </div>

        {role === 'carrier' && (
          <div>
            <Label htmlFor="dbaName">DBA Name (Optional)</Label>
            <Input
              id="dbaName"
              placeholder="Doing Business As"
              value={formData.dbaName ?? ''}
              onChange={e => onChange('dbaName', e.target.value.trimStart())}
              maxLength={100}
            />
          </div>
        )}

        <FormGrid>
          <div>
            <Label htmlFor="dotNumber">DOT Number <span className="text-destructive">*</span></Label>
            <Input
              id="dotNumber"
              value={formData.dotNumber}
              onChange={e => onChange('dotNumber', sanitizeDigits(e.target.value))}
              placeholder="1234567"
              maxLength={8}
              inputMode="numeric"
              aria-invalid={!!fieldErrors.dotNumber}
            />
            {fieldErrors.dotNumber
              ? <p className="text-xs text-destructive mt-1">{fieldErrors.dotNumber}</p>
              : <HintText>Your USDOT number (e.g. 1234567)</HintText>
            }
          </div>
          <div>
            <Label htmlFor="mcNumber">MC Number (Optional)</Label>
            <Input
              id="mcNumber"
              value={formData.mcNumber}
              onChange={e => onChange('mcNumber', sanitizeDigits(e.target.value))}
              placeholder="123456"
              maxLength={10}
              inputMode="numeric"
              aria-invalid={!!fieldErrors.mcNumber}
            />
            {fieldErrors.mcNumber && <p className="text-xs text-destructive mt-1">{fieldErrors.mcNumber}</p>}
          </div>
        </FormGrid>

        <div>
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <PhoneInput
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={v => onChange('phoneNumber', v)}
          />
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Address (Optional)</p>
          <div>
            <Label htmlFor="mailingAddress">Street Address</Label>
            <Input
              id="mailingAddress"
              placeholder="123 Main St"
              value={formData.mailingAddress}
              onChange={e => onChange('mailingAddress', e.target.value.trimStart())}
              maxLength={200}
            />
          </div>
          <FormGrid>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Chicago"
                value={formData.city}
                onChange={e => onChange('city', e.target.value.trimStart())}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={formData.state} onValueChange={v => onChange('state', v)}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </FormGrid>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              placeholder="60601"
              value={formData.zipCode}
              onChange={e => onChange('zipCode', sanitizeDigits(e.target.value))}
              maxLength={10}
              inputMode="numeric"
            />
          </div>
        </div>

        <Button onClick={onSubmit} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          Continue
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
