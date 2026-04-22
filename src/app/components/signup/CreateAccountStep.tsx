import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Mail } from 'lucide-react';
import { InfoBox, HintText } from '../../styles/signup.styles';
import type { FieldErrors } from '../../utils/validation';

interface Props {
  role: 'carrier' | 'broker';
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    mcNumber: string;
    dotNumber: string;
  };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function CreateAccountStep({
  role, formData, fieldErrors, onChange, isLoading, onSubmit, onBack,
}: Props) {
  const entityLabel = role === 'carrier' ? 'Carrier' : 'Broker';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-6" />
          Create Your Account
        </CardTitle>
        <CardDescription>
          Almost done! Set your email and password. We'll send you a verification link — once verified and approved by our team, you'll have full access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoBox>
          <p className="text-sm font-medium mb-1">Registration Summary</p>
          <p className="text-sm text-muted-foreground"><strong>Company:</strong> {formData.companyName}</p>
          {formData.mcNumber && (
            <p className="text-sm text-muted-foreground"><strong>MC:</strong> {formData.mcNumber}</p>
          )}
          {formData.dotNumber && (
            <p className="text-sm text-muted-foreground"><strong>DOT:</strong> {formData.dotNumber}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            ✓ {entityLabel} Verified &nbsp;·&nbsp; ✓ Insurance entered &nbsp;·&nbsp; ✓ Documents uploaded
          </p>
        </InfoBox>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="your@email.com"
            maxLength={254}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Create a strong password"
            maxLength={128}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password
            ? <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
            : <HintText>Min. 8 characters, one uppercase letter, and one number.</HintText>
          }
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Repeat your password"
            maxLength={128}
            aria-invalid={!!fieldErrors.confirmPassword}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          {isLoading
            ? <><Loader2 className="size-4 mr-2 animate-spin" />Creating account...</>
            : 'Create Account & Verify Email'
          }
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Back
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          After verifying your email, your account will be reviewed by our team for final approval.
        </p>
      </CardContent>
    </Card>
  );
}
