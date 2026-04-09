import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Truck, Loader2, CheckCircle, AlertCircle, Upload, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { verifyFMCSACarrier, sendSMSVerification, verifySMSCode } from '../services/fmcsaService';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useRegisterMutation } from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { ThemeToggle } from '../components/ThemeToggle';
import { APP_NAME, US_STATES } from '../constants';

type SignupStep = 'company-info' | 'fmcsa-verification' | 'insurance-info' | 'w9-upload' | 'sms-verification' | 'complete';

export function CarrierSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser] = useRegisterMutation();
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
      }));
      toast.success('Account created!', { description: `Registered as ${res.email}` });

      // Go straight into the app.
      navigate('/loads');
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
    // Legacy UI step kept for now. Backend registration already happens after Company Info.
    // If user reaches this step, just let them proceed.
    toast.info('Verification is not required. Continuing...');
    navigate('/loads');
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'company-info', label: 'Company Info' },
      { id: 'fmcsa-verification', label: 'FMCSA Verify' },
      { id: 'insurance-info', label: 'Insurance' },
      { id: 'w9-upload', label: 'W9 Upload' },
      { id: 'sms-verification', label: 'Phone Verify' },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`size-10 rounded-full flex items-center justify-center font-semibold ${
                  index <= currentIndex 
                    ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {index < currentIndex ? <CheckCircle className="size-6" /> : index + 1}
                </div>
                <div className={`text-xs mt-2 text-center ${
                  index <= currentIndex 
                    ? 'font-medium' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 ${
                  index < currentIndex 
                    ? 'bg-amber-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Truck className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Carrier Registration</h1>
                <p className="text-sm text-muted-foreground">Join {APP_NAME}'s carrier network</p>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep !== 'complete' && renderStepIndicator()}

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
                <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters.</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dotNumber">DOT Number *</Label>
                  <Input
                    id="dotNumber"
                    value={formData.dotNumber}
                    onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                    placeholder="123456"
                  />
                  <p className="text-xs text-gray-500 mt-1">Demo: Use 123456 or 789012</p>
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
              </div>
              <Button 
                onClick={handleCompanyInfoSubmit} 
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
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
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <ShieldCheck className="size-6" />
                FMCSA Verification
              </CardTitle>
              <CardDescription className="text-gray-600">
                We'll verify your carrier information with the FMCSA database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>DOT Number:</strong> {formData.dotNumber}
                </p>
                {formData.mcNumber && (
                  <p className="text-sm text-gray-700">
                    <strong>MC Number:</strong> {formData.mcNumber}
                  </p>
                )}
              </div>
              
              {!fmcsaVerified && (
                <div className="space-y-2">
                  <Button 
                    onClick={handleFMCSAVerification} 
                    disabled={isLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
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
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="size-5" />
                    <span className="font-semibold">Verification Successful!</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Your carrier information has been verified with FMCSA.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Insurance Information Step */}
        {currentStep === 'insurance-info' && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Insurance Information</CardTitle>
              <CardDescription className="text-gray-600">
                Provide your insurance coverage details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="insuranceCompany" className="text-gray-700">Insurance Company Name *</Label>
                <Input
                  id="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  placeholder="ABC Insurance Co."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargoInsurance" className="text-gray-700">Cargo Insurance Coverage *</Label>
                  <Input
                    id="cargoInsurance"
                    type="number"
                    value={formData.cargoInsurance}
                    onChange={(e) => handleInputChange('cargoInsurance', e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="100000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Amount in USD</p>
                </div>
                <div>
                  <Label htmlFor="liabilityInsurance" className="text-gray-700">Liability Insurance Coverage *</Label>
                  <Input
                    id="liabilityInsurance"
                    type="number"
                    value={formData.liabilityInsurance}
                    onChange={(e) => handleInputChange('liabilityInsurance', e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="1000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Amount in USD</p>
                </div>
              </div>
              <Button 
                onClick={handleInsuranceSubmit} 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Continue to W9 Upload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* W9 Upload Step */}
        {currentStep === 'w9-upload' && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">W9 Information</CardTitle>
              <CardDescription className="text-gray-600">
                Upload your W9 form and provide tax information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxIdType" className="text-gray-700">Tax ID Type *</Label>
                <Select value={formData.taxIdType} onValueChange={(value: 'SSN' | 'EIN') => handleInputChange('taxIdType', value)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="EIN">EIN (Employer Identification Number)</SelectItem>
                    <SelectItem value="SSN">SSN (Social Security Number)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taxId" className="text-gray-700">
                  {formData.taxIdType === 'EIN' ? 'EIN' : 'SSN'} *
                </Label>
                <Input
                  id="taxId"
                  type="password"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  placeholder={formData.taxIdType === 'EIN' ? '12-3456789' : '123-45-6789'}
                />
              </div>
              <div>
                <Label htmlFor="w9File" className="text-gray-700">Upload W9 Document *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                  <Upload className="size-10 mx-auto mb-4 text-gray-400" />
                  <input
                    id="w9File"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleW9Upload}
                    className="hidden"
                  />
                  <label htmlFor="w9File" className="cursor-pointer">
                    <span className="text-amber-600 hover:text-amber-700 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC, or DOCX (max 5MB)</p>
                  {w9File && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="size-4" />
                      <span className="text-sm">{w9File.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleW9Submit} 
                disabled={!w9File}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Continue to Phone Verification
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SMS Verification Step */}
        {currentStep === 'sms-verification' && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Phone Verification</CardTitle>
              <CardDescription className="text-gray-600">
                Enter the verification code sent to {formData.phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="smsCode" className="text-gray-700">Verification Code *</Label>
                <Input
                  id="smsCode"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={handleSMSVerification} 
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
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
                className="w-full text-gray-600"
              >
                Resend Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="size-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Welcome to {APP_NAME}, {formData.companyName}! You now have access to the load board.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to load board...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}