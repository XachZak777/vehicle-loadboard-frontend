import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Check, Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import { InfoBox, HintText } from '../../styles/signup.styles';
import type { FieldErrors } from '../../utils/validation';
import { Checkbox } from '../ui/checkbox';

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const handleSubmit = () => {
    if (!termsAccepted) { setTermsError(true); return; }
    setTermsError(false);
    onSubmit();
  };

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
        {(formData.companyName || formData.mcNumber || formData.dotNumber) && (
          <InfoBox>
            <p className="text-sm font-medium mb-1">Registration Summary</p>
            {formData.companyName && <p className="text-sm text-muted-foreground"><strong>Company:</strong> {formData.companyName}</p>}
            {formData.mcNumber && <p className="text-sm text-muted-foreground"><strong>MC:</strong> {formData.mcNumber}</p>}
            {formData.dotNumber && <p className="text-sm text-muted-foreground"><strong>DOT:</strong> {formData.dotNumber}</p>}
          </InfoBox>
        )}

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

        <div className={`border-2 ${termsError ? 'border-destructive bg-destructive/5' : 'border-gray-200 dark:border-gray-700 bg-muted/40'} p-4 space-y-3 transition-colors`}>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Terms &amp; Agreement</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-none">
            <li className="flex items-start gap-2"><Check className="size-3 shrink-0 mt-0.5 text-muted-foreground" />All information I've provided is accurate and complete.</li>
            <li className="flex items-start gap-2"><Check className="size-3 shrink-0 mt-0.5 text-muted-foreground" />I understand my account is subject to admin review and approval.</li>
            <li className="flex items-start gap-2"><Check className="size-3 shrink-0 mt-0.5 text-muted-foreground" />I agree to the platform's{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium">Privacy Policy</a>.
            </li>
          </ul>
          <div className="flex items-center gap-3 pt-1 border-t border-gray-200 dark:border-gray-700">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(!!checked);
                if (checked) setTermsError(false);
              }}
            />
            <Label htmlFor="terms" className="text-sm font-medium cursor-pointer select-none">
              I have read and agree to all of the above
            </Label>
          </div>
          {termsError && (
            <p className="text-xs text-destructive font-medium">Please accept the terms before creating your account.</p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
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
