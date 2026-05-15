import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, CheckCircle, ShieldCheck, Building2, MapPin } from 'lucide-react';
import {
  FormGrid, HintText, SuccessBox, SuccessBoxHeader, SuccessBoxText,
} from '../../styles/signup.styles';
import { sanitizeDigits, type FieldErrors } from '../../utils/validation';
import { formatPhone } from '../../utils/phone';
import type { LookupResponse } from '../../store/services/hauliusApi';

interface Props {
  role: 'carrier' | 'broker';
  formData: {
    mcNumber: string;
    dotNumber: string;
    companyName: string;
    dbaName?: string;
    phoneNumber: string;
    mailingAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  fmcsaVerified: boolean;
  fmcsaData: LookupResponse | null;
  isLoading: boolean;
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onVerify: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function McVerifyStep({
  role, formData, fmcsaVerified, fmcsaData, isLoading, fieldErrors,
  onChange, onVerify, onContinue, onBack,
}: Props) {
  const entityLabel = role === 'carrier' ? 'Carrier' : 'Broker';

  if (!fmcsaVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-6" />
            MC / DOT Verification
          </CardTitle>
          <CardDescription>
            Enter your MC number (required) and DOT number (optional) to verify your {entityLabel.toLowerCase()} information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormGrid>
            <div>
              <Label htmlFor="mcNumber">MC Number *</Label>
              <Input
                id="mcNumber"
                value={formData.mcNumber}
                onChange={e => onChange('mcNumber', sanitizeDigits(e.target.value))}
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
                onChange={e => onChange('dotNumber', sanitizeDigits(e.target.value))}
                placeholder="123456"
                maxLength={8}
                inputMode="numeric"
                aria-invalid={!!fieldErrors.dotNumber}
              />
              {fieldErrors.dotNumber && <p className="text-xs text-destructive mt-1">{fieldErrors.dotNumber}</p>}
            </div>
          </FormGrid>
          <Button
            onClick={onVerify}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isLoading
              ? <><Loader2 className="size-4 mr-2 animate-spin" />Verifying...</>
              : `Verify ${entityLabel} Info`
            }
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-6" />
          {entityLabel} Verification
        </CardTitle>
        <CardDescription>Review your verified information below before continuing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SuccessBox>
          <SuccessBoxHeader>
            <CheckCircle className="size-5" />
            Verification Successful
          </SuccessBoxHeader>
          <SuccessBoxText>
            Your {entityLabel.toLowerCase()} information has been verified. Please review all details below before continuing.
          </SuccessBoxText>
        </SuccessBox>

        <div className="rounded-lg border p-4 space-y-3 bg-muted/40">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="size-4 text-amber-500" />
            <span className="font-semibold text-sm">Company Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Legal Name</span>
              <p className="font-medium">{formData.companyName || '—'}</p>
            </div>
            {(formData.dbaName || fmcsaData?.dbaName) && (
              <div>
                <span className="text-muted-foreground">DBA Name</span>
                <p className="font-medium">{formData.dbaName || fmcsaData?.dbaName}</p>
              </div>
            )}
            {fmcsaData?.entityType && (
              <div>
                <span className="text-muted-foreground">Entity Type</span>
                <p className="font-medium">{fmcsaData.entityType}</p>
              </div>
            )}
            {formData.dotNumber && (
              <div>
                <span className="text-muted-foreground">DOT Number</span>
                <p className="font-medium">{formData.dotNumber}</p>
              </div>
            )}
            {formData.mcNumber && (
              <div>
                <span className="text-muted-foreground">MC Number</span>
                <p className="font-medium">{formData.mcNumber}</p>
              </div>
            )}
            {formData.phoneNumber && (
              <div>
                <span className="text-muted-foreground">Phone</span>
                <p className="font-medium">{formatPhone(formData.phoneNumber)}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Operating Status</span>
              <p className={`font-medium ${fmcsaData?.operatingStatus === 'AUTHORIZED' ? 'text-amber-600' : 'text-destructive'}`}>
                {fmcsaData?.operatingStatus || '—'}
              </p>
            </div>
            {role === 'carrier' && fmcsaData?.allowedToOperate && (
              <div>
                <span className="text-muted-foreground">Allowed to Operate</span>
                <p className={`font-medium ${fmcsaData.allowedToOperate === 'Y' ? 'text-amber-600' : 'text-destructive'}`}>
                  {fmcsaData.allowedToOperate === 'Y' ? 'Yes' : 'No'}
                </p>
              </div>
            )}
            {role === 'broker' && fmcsaData?.brokerAuthorityActive != null && (
              <div>
                <span className="text-muted-foreground">Broker Authority</span>
                <p className={`font-medium ${fmcsaData.brokerAuthorityActive ? 'text-amber-600' : 'text-destructive'}`}>
                  {fmcsaData.brokerAuthorityActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            )}
            {fmcsaData?.totalPowerUnits != null && (
              <div>
                <span className="text-muted-foreground">Power Units</span>
                <p className="font-medium">{fmcsaData.totalPowerUnits}</p>
              </div>
            )}
            {role === 'carrier' && fmcsaData?.totalDrivers != null && (
              <div>
                <span className="text-muted-foreground">Drivers</span>
                <p className="font-medium">{fmcsaData.totalDrivers}</p>
              </div>
            )}
            {fmcsaData?.latestUpdate && (
              <div>
                <span className="text-muted-foreground">Last Updated</span>
                <p className="font-medium">{fmcsaData.latestUpdate}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
          <p className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="size-4 text-amber-500" />Address
          </p>
          <div className="grid grid-cols-1 gap-y-2 text-sm">
            {formData.mailingAddress && (
              <div>
                <span className="text-muted-foreground">Physical Address</span>
                <p className="font-medium">
                  {formData.mailingAddress}, {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>
            )}
            {(fmcsaData?.mailingStreet || fmcsaData?.mailingCity) && (
              <div>
                <span className="text-muted-foreground">Mailing Address</span>
                <p className="font-medium">
                  {[fmcsaData?.mailingStreet, fmcsaData?.mailingCity, fmcsaData?.mailingState, fmcsaData?.mailingZip].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {(fmcsaData?.carrierOperation?.length || fmcsaData?.operationClassification?.length || fmcsaData?.cargoCarried?.length) ? (
          <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
            <p className="font-semibold text-sm">Operation Details</p>
            <div className="grid grid-cols-1 gap-y-2 text-sm">
              {fmcsaData?.carrierOperation?.length ? (
                <div>
                  <span className="text-muted-foreground">Carrier Operation</span>
                  <p className="font-medium">{fmcsaData.carrierOperation.join(', ')}</p>
                </div>
              ) : null}
              {fmcsaData?.operationClassification?.length ? (
                <div>
                  <span className="text-muted-foreground">Operation Classification</span>
                  <p className="font-medium">{fmcsaData.operationClassification.join(', ')}</p>
                </div>
              ) : null}
              {fmcsaData?.cargoCarried?.length ? (
                <div>
                  <span className="text-muted-foreground">Cargo Carried</span>
                  <p className="font-medium">{fmcsaData.cargoCarried.join(', ')}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {(fmcsaData?.safetyRating || fmcsaData?.mcs150Date) ? (
          <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
            <p className="font-semibold text-sm">Safety & Compliance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {fmcsaData?.safetyRating && <div><span className="text-muted-foreground">Safety Rating</span><p className="font-medium">{fmcsaData.safetyRating}</p></div>}
              {fmcsaData?.safetyType && <div><span className="text-muted-foreground">Safety Review Type</span><p className="font-medium">{fmcsaData.safetyType}</p></div>}
              {fmcsaData?.safetyRatingDate && <div><span className="text-muted-foreground">Rating Date</span><p className="font-medium">{fmcsaData.safetyRatingDate}</p></div>}
              {fmcsaData?.safetyReviewDate && <div><span className="text-muted-foreground">Review Date</span><p className="font-medium">{fmcsaData.safetyReviewDate}</p></div>}
              {fmcsaData?.mcs150Date && <div><span className="text-muted-foreground">MCS-150 Form Date</span><p className="font-medium">{fmcsaData.mcs150Date}</p></div>}
              {fmcsaData?.outOfServiceDate && <div><span className="text-muted-foreground">Out of Service Date</span><p className="font-medium text-red-600">{fmcsaData.outOfServiceDate}</p></div>}
            </div>
          </div>
        ) : null}

        {fmcsaData?.usInspections && (
          <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
            <p className="font-semibold text-sm">U.S. Inspections</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {(['vehicle', 'driver', 'hazmat', 'iep'] as const).map(key => {
                const s = fmcsaData.usInspections?.[key];
                if (!s) return null;
                return (
                  <div key={key}>
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <p className="font-medium">
                      {s.inspections ?? 0} inspections · {s.outOfServicePercent ?? '0%'} OOS
                      {s.nationalAverage ? ` (avg ${s.nationalAverage})` : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {fmcsaData?.usCrashes && (
          <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
            <p className="font-semibold text-sm">U.S. Crashes</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-center">
              {(['fatal', 'injury', 'tow', 'total'] as const).map(key => (
                <div key={key} className="rounded border p-2">
                  <p className="text-muted-foreground capitalize text-xs">{key}</p>
                  <p className="font-semibold text-base">{fmcsaData.usCrashes?.[key] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onContinue} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          This is correct – Continue
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Re-enter MC / DOT
        </Button>
      </CardContent>
    </Card>
  );
}
