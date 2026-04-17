import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, CheckCircle, Upload, ShieldCheck, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import {
  useUpdateBrokerProfileMutation,
  useUploadBrokerW9Mutation,
  useValidateBrokerMutation,
  useSaveBrokerFromValidationMutation,
  LookupResponse,
} from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { APP_NAME } from '../constants';
import { AuthNavbar } from '../components/AuthNavbar';
import {
  PageWrapper, ContentWrapper, StepIndicatorWrapper, StepList, StepItem,
  StepCircleWrapper, StepCircle, StepLabel, StepConnector,
  FormGrid, HintText, InfoBox, SuccessBox, SuccessBoxHeader,
  SuccessBoxText, DropZone, DropZoneUploadLabel, DropZoneHint,
  DropZoneSuccess,
} from '../styles/signup.styles';

type SignupStep = 'company-info' | 'fmcsa-verification' | 'insurance-info' | 'w9-upload' | 'create-account';

export function BrokerSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [validateBroker] = useValidateBrokerMutation();
  const [saveBroker] = useSaveBrokerFromValidationMutation();
  const [updateProfile] = useUpdateBrokerProfileMutation();
  const [uploadW9] = useUploadBrokerW9Mutation();
  const [currentStep, setCurrentStep] = useState<SignupStep>('company-info');
  const [isLoading, setIsLoading] = useState(false);
  const [validationId, setValidationId] = useState<string | null>(null);
  const [fmcsaVerified, setFmcsaVerified] = useState(false);
  const [fmcsaData, setFmcsaData] = useState<LookupResponse | null>(null);
  const [w9File, setW9File] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    dotNumber: '',
    mcNumber: '',
    phoneNumber: '',
    insuranceCompany: '',
    cargoInsurance: '',
    liabilityInsurance: '',
    taxIdType: 'EIN' as 'SSN' | 'EIN',
    taxId: '',
    mailingAddress: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step 1 – enter MC (and optionally DOT)
  const handleCompanyInfoSubmit = () => {
    if (!formData.mcNumber.trim()) {
      toast.error('Please enter your MC number');
      return;
    }
    setCurrentStep('fmcsa-verification');
  };

  // Step 2 – broker verification via backend (required, no skip)
  const handleBrokerVerification = async () => {
    setIsLoading(true);
    try {
      const lookupType = formData.mcNumber.trim() ? 'MC' : 'DOT';
      const lookupValue = lookupType === 'MC' ? formData.mcNumber.trim() : formData.dotNumber.trim();
      const result = await validateBroker({ lookupValue, lookupType }).unwrap();
      setValidationId(result.validationId);
      setFmcsaData(result);
      setFmcsaVerified(true);
      setFormData(prev => ({
        ...prev,
        companyName: result.legalName || prev.companyName,
        dotNumber: result.dotNumber || prev.dotNumber,
        mcNumber: result.mcNumber || prev.mcNumber,
        phoneNumber: result.phone || prev.phoneNumber,
        mailingAddress: result.phyStreet || prev.mailingAddress,
        city: result.phyCity || prev.city,
        state: result.phyState || prev.state,
        zipCode: result.phyZip || prev.zipCode,
      }));
      toast.success('Broker verification successful!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Verification failed. Please check your MC/DOT number and try again.');
      setFmcsaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsuranceSubmit = () => {
    if (!formData.insuranceCompany || !formData.cargoInsurance || !formData.liabilityInsurance) {
      toast.error('Please fill in all insurance information');
      return;
    }
    setCurrentStep('w9-upload');
  };

  const handleW9Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setW9File(file);
      toast.success('W9 document uploaded successfully');
    }
  };

  const handleW9Submit = () => {
    if (!w9File || !formData.taxId) {
      toast.error('Please upload W9 document and enter Tax ID');
      return;
    }
    setCurrentStep('create-account');
  };

  // Step 5 – create account (register API call happens here, then email verification)
  const handleCreateAccount = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!isValidEmail) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      if (!validationId) {
        toast.error('Carrier verification is required before creating your account.');
        return;
      }

      // 1. Register via the validated broker record
      const res = await saveBroker({
        validationId,
        email: formData.email.trim(),
        password: formData.password,
      }).unwrap();

      const userProfile: UserProfile = {
        id: res.userId,
        role: 'broker',
        email: res.email,
        phoneNumber: formData.phoneNumber,
        phoneVerified: false,
        companyName: formData.companyName,
        mcNumber: formData.mcNumber,
        dotNumber: formData.dotNumber,
        insuranceCompany: formData.insuranceCompany,
        cargoInsurance: formData.cargoInsurance ? parseFloat(formData.cargoInsurance) : 0,
        liabilityInsurance: formData.liabilityInsurance ? parseFloat(formData.liabilityInsurance) : 0,
        w9Document: w9File?.name,
        taxId: formData.taxId,
        taxIdType: formData.taxIdType,
        fmcsaVerified: true,
        verificationDate: new Date().toISOString(),
        mailingAddress: formData.mailingAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        createdAt: new Date().toISOString(),
      };

      dispatch(setCredentials({
        user: userProfile,
        token: res.token,
        userId: res.userId,
        email: res.email,
        role: res.role,
        adminApproved: res.adminApproved,
      }));

      // 2. Persist the profile data collected during the wizard
      try {
        await updateProfile({
          companyName: formData.companyName,
          dotNumber: formData.dotNumber,
          mcNumber: formData.mcNumber,
          phoneNumber: formData.phoneNumber,
          insuranceCompany: formData.insuranceCompany,
          cargoInsurance: formData.cargoInsurance ? parseFloat(formData.cargoInsurance) : undefined,
          liabilityInsurance: formData.liabilityInsurance ? parseFloat(formData.liabilityInsurance) : undefined,
          taxIdType: formData.taxIdType,
          taxId: formData.taxId,
          mailingAddress: formData.mailingAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }).unwrap();
      } catch {
        toast.warning('Profile data will be saved once your email is verified.');
      }

      // 3. Upload W9 if provided
      if (w9File) {
        try {
          const formDataW9 = new FormData();
          formDataW9.append('file', w9File);
          await uploadW9(formDataW9).unwrap();
        } catch {
          toast.warning('W9 upload will be available once your email is verified.');
        }
      }

      toast.success('Account created! Please check your email to verify your address.');
      navigate('/check-email', { state: { email: formData.email.trim() } });
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Registration failed. Please try again.';
      toast.error('Registration failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const STEPS = [
    { id: 'company-info',       label: 'MC / DOT'      },
    { id: 'fmcsa-verification', label: 'Verify'        },
    { id: 'insurance-info',     label: 'Insurance'     },
    { id: 'w9-upload',          label: 'W9 Upload'     },
    { id: 'create-account',     label: 'Create Account'},
  ] as const;

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <PageWrapper>
      <AuthNavbar subtitle="Broker Registration" />

      <ContentWrapper>
        <StepIndicatorWrapper>
          <StepList>
            {STEPS.map((step, index) => (
              <StepItem key={step.id}>
                <StepCircleWrapper>
                  <StepCircle active={index <= currentIndex}>
                    {index < currentIndex ? <CheckCircle className="size-5" /> : index + 1}
                  </StepCircle>
                  <StepLabel active={index <= currentIndex}>{step.label}</StepLabel>
                </StepCircleWrapper>
                {index < STEPS.length - 1 && (
                  <StepConnector completed={index < currentIndex} />
                )}
              </StepItem>
            ))}
          </StepList>
        </StepIndicatorWrapper>

        {/* Step 1 – MC / DOT Entry */}
        {currentStep === 'company-info' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Your MC / DOT Number</CardTitle>
              <CardDescription>
                Provide your MC number (required) and DOT number (optional) to look up your broker information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormGrid>
                <div>
                  <Label htmlFor="mcNumber">MC Number *</Label>
                  <Input
                    id="mcNumber"
                    value={formData.mcNumber}
                    onChange={(e) => handleInputChange('mcNumber', e.target.value)}
                    placeholder="MC-123456"
                  />
                  <HintText>Your MC authority number (e.g. MC-123456)</HintText>
                </div>
                <div>
                  <Label htmlFor="dotNumber">DOT Number (Optional)</Label>
                  <Input
                    id="dotNumber"
                    value={formData.dotNumber}
                    onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                    placeholder="123456"
                  />
                </div>
              </FormGrid>
              <Button
                onClick={handleCompanyInfoSubmit}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Continue to Verification
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2 – Broker Verification + Results */}
        {currentStep === 'fmcsa-verification' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-6" />
                Broker Verification
              </CardTitle>
              <CardDescription>
                We'll verify your broker information. Verification is required to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!fmcsaVerified ? (
                <>
                  <InfoBox>
                    <p><strong>MC Number:</strong> {formData.mcNumber}</p>
                    {formData.dotNumber && <p><strong>DOT Number:</strong> {formData.dotNumber}</p>}
                  </InfoBox>
                  <Button
                    onClick={handleBrokerVerification}
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    {isLoading ? (
                      <><Loader2 className="size-4 mr-2 animate-spin" />Verifying broker info...</>
                    ) : (
                      'Verify Broker Info'
                    )}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setCurrentStep('company-info')} disabled={isLoading}>
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
                    <SuccessBoxText>Your broker information has been verified. Please review all details below before continuing.</SuccessBoxText>
                  </SuccessBox>

                  {/* ── Identity & Status ──────────────────────────── */}
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
                      {fmcsaData?.dbaName && (
                        <div>
                          <span className="text-muted-foreground">DBA Name</span>
                          <p className="font-medium">{fmcsaData.dbaName}</p>
                        </div>
                      )}
                      {fmcsaData?.entityType && (
                        <div>
                          <span className="text-muted-foreground">Entity Type</span>
                          <p className="font-medium">{fmcsaData.entityType}</p>
                        </div>
                      )}
                      {formData.mcNumber && (
                        <div>
                          <span className="text-muted-foreground">MC Number</span>
                          <p className="font-medium">{formData.mcNumber}</p>
                        </div>
                      )}
                      {formData.dotNumber && (
                        <div>
                          <span className="text-muted-foreground">DOT Number</span>
                          <p className="font-medium">{formData.dotNumber}</p>
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
                      {fmcsaData?.brokerAuthorityActive != null && (
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
                      {fmcsaData?.latestUpdate && (
                        <div>
                          <span className="text-muted-foreground">Last Updated</span>
                          <p className="font-medium">{fmcsaData.latestUpdate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Address ──────────────────────────────────────── */}
                  <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                    <p className="font-semibold text-sm">Address</p>
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      {formData.mailingAddress && (
                        <div>
                          <span className="text-muted-foreground">Physical Address</span>
                          <p className="font-medium">{formData.mailingAddress}, {formData.city}, {formData.state} {formData.zipCode}</p>
                        </div>
                      )}
                      {(fmcsaData?.mailingStreet || fmcsaData?.mailingCity) && (
                        <div>
                          <span className="text-muted-foreground">Mailing Address</span>
                          <p className="font-medium">
                            {[fmcsaData.mailingStreet, fmcsaData.mailingCity, fmcsaData.mailingState, fmcsaData.mailingZip].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Operation ──────────────────────────────────── */}
                  {(fmcsaData?.carrierOperation?.length || fmcsaData?.operationClassification?.length || fmcsaData?.cargoCarried?.length) ? (
                    <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                      <p className="font-semibold text-sm">Operation Details</p>
                      <div className="grid grid-cols-1 gap-y-2 text-sm">
                        {fmcsaData?.carrierOperation?.length ? (
                          <div>
                            <span className="text-muted-foreground">Operation Type</span>
                            <p className="font-medium">{fmcsaData.carrierOperation.join(', ')}</p>
                          </div>
                        ) : null}
                        {fmcsaData?.operationClassification?.length ? (
                          <div>
                            <span className="text-muted-foreground">Classification</span>
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

                  {/* ── Safety ───────────────────────────────────────── */}
                  {(fmcsaData?.safetyRating || fmcsaData?.mcs150Date) ? (
                    <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                      <p className="font-semibold text-sm">Safety & Compliance</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {fmcsaData?.safetyRating && <div><span className="text-muted-foreground">Safety Rating</span><p className="font-medium">{fmcsaData.safetyRating}</p></div>}
                        {fmcsaData?.mcs150Date && <div><span className="text-muted-foreground">MCS-150 Date</span><p className="font-medium">{fmcsaData.mcs150Date}</p></div>}
                        {fmcsaData?.safetyRatingDate && <div><span className="text-muted-foreground">Rating Date</span><p className="font-medium">{fmcsaData.safetyRatingDate}</p></div>}
                        {fmcsaData?.outOfServiceDate && <div><span className="text-muted-foreground">Out of Service Date</span><p className="font-medium text-red-600">{fmcsaData.outOfServiceDate}</p></div>}
                      </div>
                    </div>
                  ) : null}

                  {/* ── US Inspections ─────────────────────────────── */}
                  {fmcsaData?.usInspections && (
                    <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                      <p className="font-semibold text-sm">U.S. Inspections</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {(['vehicle', 'driver', 'hazmat', 'iep'] as const).map(key => {
                          const s = fmcsaData.usInspections?.[key];
                          if (!s) return null;
                          return (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">{key}</span>
                              <p className="font-medium">{s.inspections ?? 0} insp · {s.outOfServicePercent ?? '0%'} OOS</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Crashes ────────────────────────────────────── */}
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
                    onClick={() => setCurrentStep('insurance-info')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    This is correct – Continue to Insurance
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3 – Insurance Information */}
        {currentStep === 'insurance-info' && (
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
                  onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                  placeholder="ABC Insurance Co."
                />
              </div>
              <FormGrid>
                <div>
                  <Label htmlFor="cargoInsurance">Cargo Insurance Coverage *</Label>
                  <Input
                    id="cargoInsurance"
                    type="number"
                    value={formData.cargoInsurance}
                    onChange={(e) => handleInputChange('cargoInsurance', e.target.value)}
                    placeholder="100000"
                  />
                  <HintText>Amount in USD</HintText>
                </div>
                <div>
                  <Label htmlFor="liabilityInsurance">Liability Insurance Coverage *</Label>
                  <Input
                    id="liabilityInsurance"
                    type="number"
                    value={formData.liabilityInsurance}
                    onChange={(e) => handleInputChange('liabilityInsurance', e.target.value)}
                    placeholder="1000000"
                  />
                  <HintText>Amount in USD</HintText>
                </div>
              </FormGrid>
              <Button
                onClick={handleInsuranceSubmit}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Continue to W9 Upload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4 – W9 Upload */}
        {currentStep === 'w9-upload' && (
          <Card>
            <CardHeader>
              <CardTitle>W9 Information</CardTitle>
              <CardDescription>Upload your W9 form and provide tax information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxIdType">Tax ID Type *</Label>
                <Select value={formData.taxIdType} onValueChange={(value: 'SSN' | 'EIN') => handleInputChange('taxIdType', value)}>
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
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder={formData.taxIdType === 'EIN' ? '12-3456789' : '123-45-6789'}
                />
              </div>
              <div>
                <Label>Upload W9 Document *</Label>
                <DropZone>
                  <Upload className="size-10 mx-auto mb-4 text-muted-foreground" />
                  <input id="w9File" type="file" accept=".pdf,.doc,.docx" onChange={handleW9Upload} className="hidden" />
                  <DropZoneUploadLabel htmlFor="w9File">
                    <span className="upload-link">Click to upload</span>
                    <span className="upload-or"> or drag and drop</span>
                  </DropZoneUploadLabel>
                  <DropZoneHint>PDF, DOC, or DOCX (max 5MB)</DropZoneHint>
                  {w9File && (
                    <DropZoneSuccess><CheckCircle className="size-4" /><span>{w9File.name}</span></DropZoneSuccess>
                  )}
                </DropZone>
              </div>
              <Button
                onClick={handleW9Submit}
                disabled={!w9File || !formData.taxId}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Continue to Create Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5 – Create Account (email + password, then email verification) */}
        {currentStep === 'create-account' && (
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
                {formData.mcNumber && <p className="text-sm text-muted-foreground"><strong>MC:</strong> {formData.mcNumber}</p>}
                {formData.dotNumber && <p className="text-sm text-muted-foreground"><strong>DOT:</strong> {formData.dotNumber}</p>}
                <p className="text-sm text-muted-foreground mt-1">
                  ✓ Broker Verified &nbsp;·&nbsp; ✓ Insurance entered &nbsp;·&nbsp; ✓ W9 uploaded
                </p>
              </InfoBox>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password"
                />
                <HintText>Minimum 6 characters.</HintText>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
                />
              </div>
              <Button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {isLoading ? (
                  <><Loader2 className="size-4 mr-2 animate-spin" />Creating account...</>
                ) : (
                  'Create Account & Verify Email'
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                After verifying your email, your account will be reviewed by our team for final approval.
              </p>
            </CardContent>
          </Card>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}

