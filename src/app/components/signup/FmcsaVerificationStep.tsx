import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle, ShieldCheck, Building2, MapPin } from 'lucide-react';
import { InfoBox, SuccessBox, SuccessBoxHeader, SuccessBoxText } from '../../styles/signup.styles';
import type { LookupResponse } from '../../store/services/hauliusApi';

interface FormSnapshot {
  dotNumber: string;
  mcNumber: string;
  companyName: string;
  dbaName?: string;
  phoneNumber: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Props {
  role: 'carrier' | 'broker';
  formData: FormSnapshot;
  fmcsaVerified: boolean;
  fmcsaData: LookupResponse | null;
  isLoading: boolean;
  onVerify: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function FmcsaVerificationStep({
  role,
  formData,
  fmcsaVerified,
  fmcsaData,
  isLoading,
  onVerify,
  onContinue,
  onBack,
}: Props) {
  const entityLabel = role === 'carrier' ? 'Carrier' : 'Broker';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-6" />
          {entityLabel} Verification
        </CardTitle>
        <CardDescription>
          We'll verify your {entityLabel.toLowerCase()} information. Verification is required to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!fmcsaVerified ? (
          <>
            <InfoBox>
              {formData.dotNumber && <p><strong>DOT Number:</strong> {formData.dotNumber}</p>}
              {formData.mcNumber && <p><strong>MC Number:</strong> {formData.mcNumber}</p>}
            </InfoBox>
            <Button
              onClick={onVerify}
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              {isLoading
                ? <><Loader2 className="size-4 mr-2 animate-spin" />Verifying {entityLabel.toLowerCase()} info...</>
                : `Verify ${entityLabel} Info`
              }
            </Button>
            <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack} disabled={isLoading}>
              ← Back
            </Button>
          </>
        ) : (
          <>
            <SuccessBox>
              <SuccessBoxHeader>
                <CheckCircle className="size-5" />
                Verification Successful
              </SuccessBoxHeader>
              <SuccessBoxText>
                Your {entityLabel.toLowerCase()} information has been verified. Please review all details below before continuing.
              </SuccessBoxText>
            </SuccessBox>

            {/* Company Information */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/40">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="size-4 text-amber-500" />
                <span className="font-semibold text-sm">Company Information</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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
                    <p className="font-medium">{formData.phoneNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Operating Status</span>
                  <p className={`font-medium ${fmcsaData?.operatingStatus === 'AUTHORIZED' ? 'text-green-600' : 'text-red-600'}`}>
                    {fmcsaData?.operatingStatus || '—'}
                  </p>
                </div>
                {role === 'carrier' && fmcsaData?.allowedToOperate && (
                  <div>
                    <span className="text-muted-foreground">Allowed to Operate</span>
                    <p className={`font-medium ${fmcsaData.allowedToOperate === 'Y' ? 'text-green-600' : 'text-red-600'}`}>
                      {fmcsaData.allowedToOperate === 'Y' ? 'Yes' : 'No'}
                    </p>
                  </div>
                )}
                {role === 'broker' && fmcsaData?.brokerAuthorityActive != null && (
                  <div>
                    <span className="text-muted-foreground">Broker Authority</span>
                    <p className={`font-medium ${fmcsaData.brokerAuthorityActive ? 'text-green-600' : 'text-red-600'}`}>
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

            {/* Address */}
            <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
              <p className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="size-4 text-amber-500" />Address
              </p>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                {formData.mailingAddress && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Physical Address</span>
                    <p className="font-medium">
                      {formData.mailingAddress}, {formData.city}, {formData.state} {formData.zipCode}
                    </p>
                  </div>
                )}
                {(fmcsaData?.mailingStreet || fmcsaData?.mailingCity) && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Mailing Address</span>
                    <p className="font-medium">
                      {[fmcsaData?.mailingStreet, fmcsaData?.mailingCity, fmcsaData?.mailingState, fmcsaData?.mailingZip].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Operation Details */}
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

            {/* Safety & Compliance */}
            {(fmcsaData?.safetyRating || fmcsaData?.mcs150Date) ? (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                <p className="font-semibold text-sm">Safety & Compliance</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {fmcsaData?.safetyRating && <div><span className="text-muted-foreground">Safety Rating</span><p className="font-medium">{fmcsaData.safetyRating}</p></div>}
                  {fmcsaData?.safetyType && <div><span className="text-muted-foreground">Safety Review Type</span><p className="font-medium">{fmcsaData.safetyType}</p></div>}
                  {fmcsaData?.safetyRatingDate && <div><span className="text-muted-foreground">Rating Date</span><p className="font-medium">{fmcsaData.safetyRatingDate}</p></div>}
                  {fmcsaData?.safetyReviewDate && <div><span className="text-muted-foreground">Review Date</span><p className="font-medium">{fmcsaData.safetyReviewDate}</p></div>}
                  {fmcsaData?.mcs150Date && <div><span className="text-muted-foreground">MCS-150 Form Date</span><p className="font-medium">{fmcsaData.mcs150Date}</p></div>}
                  {fmcsaData?.outOfServiceDate && <div><span className="text-muted-foreground">Out of Service Date</span><p className="font-medium text-red-600">{fmcsaData.outOfServiceDate}</p></div>}
                </div>
              </div>
            ) : null}

            {/* U.S. Inspections */}
            {fmcsaData?.usInspections && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                <p className="font-semibold text-sm">U.S. Inspections</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
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

            {/* U.S. Crashes */}
            {fmcsaData?.usCrashes && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                <p className="font-semibold text-sm">U.S. Crashes</p>
                <div className="grid grid-cols-4 gap-2 text-sm text-center">
                  {(['fatal', 'injury', 'tow', 'total'] as const).map(key => (
                    <div key={key} className="rounded border p-2">
                      <p className="text-muted-foreground capitalize text-xs">{key}</p>
                      <p className="font-semibold text-base">{fmcsaData.usCrashes?.[key] ?? 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={onContinue}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              This is correct – Continue to Insurance
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={onBack}
            >
              ← Back to MC / DOT
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
