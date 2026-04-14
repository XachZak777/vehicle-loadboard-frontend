import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Truck, Loader2, CheckCircle, Upload, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { verifyFMCSACarrier, sendSMSVerification } from '../services/fmcsaService';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useRegisterMutation, useUpdateCarrierProfileMutation, useUploadCarrierW9Mutation } from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { ThemeToggle } from '../components/ThemeToggle';
import { APP_NAME } from '../constants';
import {
  PageWrapper, PageHeader, HeaderInner, LogoIcon, LogoText,
  ContentWrapper, StepIndicatorWrapper, StepList, StepItem,
  StepCircleWrapper, StepCircle, StepLabel, StepConnector,
  FormGrid, HintText, InfoBox, SuccessBox, SuccessBoxHeader,
  SuccessBoxText, DropZone, DropZoneUploadLabel, DropZoneHint,
  DropZoneSuccess, CompleteIconWrapper, CompleteTitle,
  CompleteSubtext, CompleteHint,
} from '../styles/signup.styles';

type SignupStep = 'company-info' | 'fmcsa-verification' | 'insurance-info' | 'w9-upload' | 'sms-verification' | 'complete';

export function CarrierSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser] = useRegisterMutation();
  const [updateProfile] = useUpdateCarrierProfileMutation();
  const [uploadW9] = useUploadCarrierW9Mutation();
  const [currentStep, setCurrentStep] = useState<SignupStep>('company-info');
  const [isLoading, setIsLoading] = useState(false);
  const [fmcsaVerified, setFmcsaVerified] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [sentSmsCode, setSentSmsCode] = useState('');
  const [w9File, setW9File] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const handleCompanyInfoSubmit = async () => {
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

    // Backend-driven registration (no OTP/email verification endpoint in BE).
    setIsLoading(true);
    try {
      const res = await registerUser({
        email: formData.email.trim(),
        password: formData.password,
        role: 'CARRIER',
      }).unwrap();

      const userProfile: UserProfile = {
        id: res.userId,
        role: 'carrier',
        email: res.email,
        phoneNumber: formData.phoneNumber,
        phoneVerified: true,
        companyName: formData.companyName || 'Carrier',
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
      toast.success('Account created!', { description: `Registered as ${res.email}` });

      // Advance to next step instead of navigating away
      setCurrentStep('fmcsa-verification');
      return;
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.';
      toast.error('Registration failed', { description: message });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFMCSAVerification = async () => {
    setIsLoading(true);

    try {
      const result = await verifyFMCSACarrier(formData.dotNumber, formData.mcNumber);

      if (result.success && result.data) {
        setFmcsaVerified(true);
        // Auto-fill data from FMCSA
        setFormData(prev => ({
          ...prev,
          companyName: result.data!.legalName,
          phoneNumber: result.data!.phoneNumber,
          mailingAddress: result.data!.mailingAddress,
          city: result.data!.mailingCity,
          state: result.data!.mailingState,
          zipCode: result.data!.mailingZipCode,
        }));
        toast.success('FMCSA verification successful!');
        setCurrentStep('insurance-info');
      } else {
        toast.error(result.error || 'FMCSA verification failed');
        setFmcsaVerified(false);
      }
    } catch (error) {
      toast.error('Error verifying with FMCSA. Please try again.');
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
    setCurrentStep('sms-verification');
    handleSendSMS();
  };

  const handleSendSMS = async () => {
    setIsLoading(true);
    try {
      const result = await sendSMSVerification(formData.phoneNumber);
      if (result.success && result.verificationCode) {
        setSentSmsCode(result.verificationCode);
        toast.success(`Verification code sent to ${formData.phoneNumber}`);
        // In demo mode, show the code
        toast.info(`Demo Mode: Your code is ${result.verificationCode}`, { duration: 10000 });
      }
    } catch (error) {
      toast.error('Failed to send SMS verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMSVerification = async () => {
    setIsLoading(true);
    try {
      // 1. Update profile with all collected data
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

      // 2. Upload W9 document if provided
      if (w9File) {
        const formDataW9 = new FormData();
        formDataW9.append('file', w9File);
        await uploadW9(formDataW9).unwrap();
      }

      toast.success('Profile completed!', { description: 'Your account is pending admin approval.' });
      navigate('/pending-approval');
    } catch (error: any) {
      const message = error?.message || 'Failed to save profile. Please try again.';
      toast.error('Profile update failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const STEPS = [
    { id: 'company-info', label: 'Company Info' },
    { id: 'fmcsa-verification', label: 'FMCSA Verify' },
    { id: 'insurance-info', label: 'Insurance' },
    { id: 'w9-upload', label: 'W9 Upload' },
    { id: 'sms-verification', label: 'Phone Verify' },
  ] as const;

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <PageWrapper>
      <PageHeader>
        <HeaderInner>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LogoIcon>
              <Truck className="size-8 text-white" />
            </LogoIcon>
            <LogoText>
              <h1>Carrier Registration</h1>
              <p>Join {APP_NAME}'s carrier network</p>
            </LogoText>
          </Link>
          <ThemeToggle />
        </HeaderInner>
      </PageHeader>

      <ContentWrapper>
        {currentStep !== 'complete' && (
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
        )}

        {/* Company Information Step */}
        {currentStep === 'company-info' && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Enter your company details to begin registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="ABC Transport LLC"
                />
              </div>
              <FormGrid>
                <div>
                  <Label htmlFor="dotNumber">DOT Number *</Label>
                  <Input
                    id="dotNumber"
                    value={formData.dotNumber}
                    onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                    placeholder="123456"
                  />
                  <HintText>Demo: Use 123456 or 789012</HintText>
                </div>
                <div>
                  <Label htmlFor="mcNumber">MC Number (Optional)</Label>
                  <Input
                    id="mcNumber"
                    value={formData.mcNumber}
                    onChange={(e) => handleInputChange('mcNumber', e.target.value)}
                    placeholder="MC-123456"
                  />
                </div>
              </FormGrid>
              <Button
                onClick={handleCompanyInfoSubmit}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* FMCSA Verification Step */}
        {currentStep === 'fmcsa-verification' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-6" />
                FMCSA Verification
              </CardTitle>
              <CardDescription>
                We'll verify your carrier information with the FMCSA database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoBox>
                <p><strong>DOT Number:</strong> {formData.dotNumber}</p>
                {formData.mcNumber && <p><strong>MC Number:</strong> {formData.mcNumber}</p>}
              </InfoBox>

              {!fmcsaVerified && (
                <div className="space-y-2">
                  <Button
                    onClick={handleFMCSAVerification}
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Verifying with FMCSA...
                      </>
                    ) : (
                      'Verify with FMCSA (Optional)'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentStep('insurance-info')}
                    disabled={isLoading}
                  >
                    Skip for now
                  </Button>
                </div>
              )}

              {fmcsaVerified && (
                <SuccessBox>
                  <SuccessBoxHeader>
                    <CheckCircle className="size-5" />
                    Verification Successful!
                  </SuccessBoxHeader>
                  <SuccessBoxText>Your carrier information has been verified with FMCSA.</SuccessBoxText>
                </SuccessBox>
              )}
            </CardContent>
          </Card>
        )}

        {/* Insurance Information Step */}
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

        {/* W9 Upload Step */}
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
                  <input
                    id="w9File"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleW9Upload}
                    className="hidden"
                  />
                  <DropZoneUploadLabel htmlFor="w9File">
                    <span className="upload-link">Click to upload</span>
                    <span className="upload-or"> or drag and drop</span>
                  </DropZoneUploadLabel>
                  <DropZoneHint>PDF, DOC, or DOCX (max 5MB)</DropZoneHint>
                  {w9File && (
                    <DropZoneSuccess>
                      <CheckCircle className="size-4" />
                      <span>{w9File.name}</span>
                    </DropZoneSuccess>
                  )}
                </DropZone>
              </div>
              <Button
                onClick={handleW9Submit}
                disabled={!w9File}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Continue to Phone Verification
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SMS Verification Step */}
        {currentStep === 'sms-verification' && (
          <Card>
            <CardHeader>
              <CardTitle>Phone Verification</CardTitle>
              <CardDescription>
                Enter the verification code sent to {formData.phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="smsCode">Verification Code *</Label>
                <Input
                  id="smsCode"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleSMSVerification}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone Number'
                )}
              </Button>
              <Button
                onClick={handleSendSMS}
                variant="ghost"
                disabled={isLoading}
                className="w-full"
              >
                Resend Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <Card>
            <CardContent className="p-12 text-center">
              <CompleteIconWrapper>
                <CheckCircle className="size-12 text-green-600" />
              </CompleteIconWrapper>
              <CompleteTitle>Registration Complete!</CompleteTitle>
              <CompleteSubtext>
                Welcome to {APP_NAME}, {formData.companyName}! You now have access to the load board.
              </CompleteSubtext>
              <CompleteHint>Redirecting to load board...</CompleteHint>
            </CardContent>
          </Card>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}