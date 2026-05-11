import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import { InfoBox, HintText } from '../../styles/signup.styles';
import type { FieldErrors } from '../../utils/validation';

interface Props {
  role: 'carrier' | 'broker' | 'dealer';
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    mcNumber?: string;
    dotNumber?: string;
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
  const entityLabel = role === 'carrier' ? 'Carrier' : role === 'broker' ? 'Broker' : 'Dealer';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          {role === 'dealer'
            ? <p className="text-sm text-muted-foreground mt-1">✓ Dealer Verified &nbsp;·&nbsp; ✓ W9 uploaded &nbsp;·&nbsp; ✓ Details entered</p>
            : <p className="text-sm text-muted-foreground mt-1">✓ {entityLabel} Verified &nbsp;·&nbsp; ✓ Insurance info &nbsp;·&nbsp; ✓ Documents uploaded</p>
          }
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Create a strong password"
              maxLength={128}
              aria-invalid={!!fieldErrors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {fieldErrors.password
            ? <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
            : <HintText>Min. 8 characters, one uppercase letter, and one number.</HintText>
          }
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              maxLength={128}
              aria-invalid={!!fieldErrors.confirmPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
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
