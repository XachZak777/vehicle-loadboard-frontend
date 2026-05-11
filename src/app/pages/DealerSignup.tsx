import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import {
  useRegisterDealerMutation,
  useUploadDealerLicenseMutation,
  useUploadDealerCorporatePaperworkMutation,
} from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { AuthNavbar } from '../components/AuthNavbar';
import { PageWrapper, ContentWrapper } from '../styles/signup.styles';
import {
  isBusinessEmail, businessEmailError, isStrongPassword, passwordRequirementsText,
  isValidCompanyName, isValidStreetAddress, isValidCity, isValidZip, isValidPhone,
  isValidPersonName, isValidYearEstablished, isValidAlphanumericId,
  buildErrors, type FieldErrors,
} from '../utils/validation';
import { SignupStepIndicator } from '../components/signup/SignupStepIndicator';
import { DocumentUploadField } from '../components/signup/DocumentUploadField';
import { CreateAccountStep } from '../components/signup/CreateAccountStep';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type DealerStep = 'company-info' | 'details' | 'documents' | 'phone-verify' | 'password';

const STEPS = [
  { id: 'company-info', label: 'Company Info' },
  { id: 'details',      label: 'Details'      },
  { id: 'documents',    label: 'Documents'    },
  { id: 'phone-verify', label: 'Phone Verify' },
  { id: 'password',     label: 'Password'     },
] as const;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const HOW_DID_YOU_HEAR = [
  'Google Search', 'Social Media', 'Referral from Friend', 'Industry Trade Show',
  'Email Newsletter', 'Online Advertisement', 'Other',
];

export function DealerSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerDealer] = useRegisterDealerMutation();
  const [uploadDealerLicense] = useUploadDealerLicenseMutation();
  const [uploadDealerCorporatePaperwork] = useUploadDealerCorporatePaperworkMutation();

  const [currentStep, setCurrentStep] = useState<DealerStep>('company-info');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [dealerLicenseFile, setDealerLicenseFile] = useState<File | null>(null);
  const [corporatePaperworkFile, setCorporatePaperworkFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    yearEstablished: '',
    companyAddress: '',
    city: '',
    state: '',
    zipCode: '',
    auctionAccessNumber: '',
    dealerLicenseNumber: '',
    ownerFirstName: '',
    ownerLastName: '',
    businessPhone: '',
    howDidYouHear: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const makeFileHandler = (
    setFile: (f: File) => void,
    successMsg: string,
    errorKey: string,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    setFile(file);
    if (fieldErrors[errorKey]) setFieldErrors(prev => { const e = { ...prev }; delete e[errorKey]; return e; });
    toast.success(successMsg);
  };

  const handleCompanyInfoSubmit = () => {
    const errs = buildErrors([
      [!formData.companyName.trim(), 'companyName', 'Company name is required.'],
      [!!formData.companyName.trim() && !isValidCompanyName(formData.companyName), 'companyName', 'Company name must be 2–100 characters.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('details');
  };

  const handleDetailsSubmit = () => {
    const errs = buildErrors([
      [!!formData.yearEstablished.trim() && !isValidYearEstablished(formData.yearEstablished), 'yearEstablished', `Enter a valid 4-digit year (1800–${new Date().getFullYear()}).`],
      [!formData.companyAddress.trim(), 'companyAddress', 'Company address is required.'],
      [!!formData.companyAddress.trim() && !isValidStreetAddress(formData.companyAddress), 'companyAddress', 'Address must be 5–200 characters.'],
      [!formData.city.trim(), 'city', 'City is required.'],
      [!!formData.city.trim() && !isValidCity(formData.city), 'city', 'Enter a valid city name (letters, spaces, hyphens only).'],
      [!formData.state, 'state', 'State is required.'],
      [!formData.zipCode.trim(), 'zipCode', 'Zip code is required.'],
      [!!formData.zipCode.trim() && !isValidZip(formData.zipCode), 'zipCode', 'ZIP code must be 5 digits (e.g. 90001).'],
      [!!formData.auctionAccessNumber.trim() && !isValidAlphanumericId(formData.auctionAccessNumber), 'auctionAccessNumber', 'Auction access number must be 1–40 alphanumeric characters.'],
      [!!formData.dealerLicenseNumber.trim() && !isValidAlphanumericId(formData.dealerLicenseNumber), 'dealerLicenseNumber', 'Dealer license number must be 1–40 alphanumeric characters.'],
      [!formData.ownerFirstName.trim(), 'ownerFirstName', 'Owner first name is required.'],
      [!!formData.ownerFirstName.trim() && !isValidPersonName(formData.ownerFirstName), 'ownerFirstName', 'First name must be 2–50 letters.'],
      [!formData.ownerLastName.trim(), 'ownerLastName', 'Owner last name is required.'],
      [!!formData.ownerLastName.trim() && !isValidPersonName(formData.ownerLastName), 'ownerLastName', 'Last name must be 2–50 letters.'],
      [!formData.businessPhone.trim(), 'businessPhone', 'Business phone number is required.'],
      [!!formData.businessPhone.trim() && !isValidPhone(formData.businessPhone), 'businessPhone', 'Enter a valid US phone number (e.g. (555) 123-4567).'],
      [!formData.howDidYouHear, 'howDidYouHear', 'Please select how you heard about us.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('documents');
  };

  const handlePhoneSubmit = () => {
    const errs = buildErrors([
      [!formData.phoneNumber.trim(), 'phoneNumber', 'Phone number is required.'],
      [!!formData.phoneNumber.trim() && !isValidPhone(formData.phoneNumber), 'phoneNumber', 'Enter a valid US phone number (e.g. (555) 123-4567).'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('password');
  };

  const handleCreateAccount = async () => {
    const errs = buildErrors([
      [!formData.email.trim(), 'email', 'Email address is required.'],
      [!!formData.email.trim() && !isBusinessEmail(formData.email), 'email', businessEmailError],
      [!formData.password, 'password', 'Password is required.'],
      [!!formData.password && !isStrongPassword(formData.password), 'password', passwordRequirementsText],
      [!formData.confirmPassword, 'confirmPassword', 'Please confirm your password.'],
      [!!formData.confirmPassword && formData.password !== formData.confirmPassword, 'confirmPassword', 'Passwords do not match.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await registerDealer({
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName,
        ownerFirstName: formData.ownerFirstName,
        ownerLastName: formData.ownerLastName,
        businessPhone: formData.businessPhone || formData.phoneNumber,
        companyAddress: formData.companyAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        yearEstablished: formData.yearEstablished || undefined,
        dealerLicenseNumber: formData.dealerLicenseNumber || undefined,
        auctionAccessNumber: formData.auctionAccessNumber || undefined,
        howDidYouHear: formData.howDidYouHear || undefined,
      }).unwrap();

      const userProfile: UserProfile = {
        id: res.userId,
        role: 'dealer',
        email: res.email,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
      };
      dispatch(setCredentials({ user: userProfile, token: res.token, userId: res.userId, email: res.email, role: res.role, adminApproved: res.adminApproved }));

      for (const [file, upload, msg] of [
        [dealerLicenseFile, uploadDealerLicense, "Dealer's license upload will be available once your email is verified."],
        [corporatePaperworkFile, uploadDealerCorporatePaperwork, 'Corporate paperwork upload will be available once your email is verified.'],
      ] as [File | null, (fd: FormData) => any, string][]) {
        if (file) {
          try { const fd = new FormData(); fd.append('file', file); await upload(fd).unwrap(); }
          catch { toast.warning(msg); }
        }
      }

      toast.success('Account created! Please check your email to verify your address.');
      navigate('/check-email', { state: { email: formData.email.trim() } });
    } catch (error: any) {
      toast.error('Registration failed', { description: error?.data?.message || error?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <PageWrapper>
      <AuthNavbar subtitle="Dealer Registration" />
      <ContentWrapper>
        <SignupStepIndicator steps={STEPS} currentIndex={currentIndex} />

        {currentStep === 'company-info' && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Tell us about your dealership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" placeholder="e.g., ABC Dealership" value={formData.companyName}
                  onChange={e => handleChange('companyName', e.target.value)} aria-invalid={!!fieldErrors.companyName} />
                {fieldErrors.companyName && <p className="text-xs text-destructive mt-1">{fieldErrors.companyName}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleCompanyInfoSubmit} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Please provide additional details about your dealership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="yearEstablished">Year Established</Label>
                <Input id="yearEstablished" placeholder="e.g., 2010" value={formData.yearEstablished}
                  onChange={e => handleChange('yearEstablished', e.target.value)} aria-invalid={!!fieldErrors.yearEstablished} />
                {fieldErrors.yearEstablished && <p className="text-xs text-destructive mt-1">{fieldErrors.yearEstablished}</p>}
              </div>
              <div>
                <Label htmlFor="companyAddress">Company Address *</Label>
                <Input id="companyAddress" placeholder="123 Main Street" value={formData.companyAddress}
                  onChange={e => handleChange('companyAddress', e.target.value)} aria-invalid={!!fieldErrors.companyAddress} />
                {fieldErrors.companyAddress && <p className="text-xs text-destructive mt-1">{fieldErrors.companyAddress}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="Los Angeles" value={formData.city}
                    onChange={e => handleChange('city', e.target.value)} aria-invalid={!!fieldErrors.city} />
                  {fieldErrors.city && <p className="text-xs text-destructive mt-1">{fieldErrors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={v => handleChange('state', v)}>
                    <SelectTrigger id="state" aria-invalid={!!fieldErrors.state}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {fieldErrors.state && <p className="text-xs text-destructive mt-1">{fieldErrors.state}</p>}
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input id="zipCode" placeholder="90001" value={formData.zipCode}
                    onChange={e => handleChange('zipCode', e.target.value)} aria-invalid={!!fieldErrors.zipCode} />
                  {fieldErrors.zipCode && <p className="text-xs text-destructive mt-1">{fieldErrors.zipCode}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auctionAccessNumber">Auction Access # (5M)</Label>
                  <Input id="auctionAccessNumber" placeholder="Optional" value={formData.auctionAccessNumber}
                    onChange={e => handleChange('auctionAccessNumber', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dealerLicenseNumber">Dealer License #</Label>
                  <Input id="dealerLicenseNumber" placeholder="Optional" value={formData.dealerLicenseNumber}
                    onChange={e => handleChange('dealerLicenseNumber', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerFirstName">Owner First Name *</Label>
                  <Input id="ownerFirstName" placeholder="John" value={formData.ownerFirstName}
                    onChange={e => handleChange('ownerFirstName', e.target.value)} aria-invalid={!!fieldErrors.ownerFirstName} />
                  {fieldErrors.ownerFirstName && <p className="text-xs text-destructive mt-1">{fieldErrors.ownerFirstName}</p>}
                </div>
                <div>
                  <Label htmlFor="ownerLastName">Owner Last Name *</Label>
                  <Input id="ownerLastName" placeholder="Doe" value={formData.ownerLastName}
                    onChange={e => handleChange('ownerLastName', e.target.value)} aria-invalid={!!fieldErrors.ownerLastName} />
                  {fieldErrors.ownerLastName && <p className="text-xs text-destructive mt-1">{fieldErrors.ownerLastName}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="businessPhone">Business Phone Number *</Label>
                <Input id="businessPhone" placeholder="(555) 987-6543" value={formData.businessPhone}
                  onChange={e => handleChange('businessPhone', e.target.value)} aria-invalid={!!fieldErrors.businessPhone} />
                {fieldErrors.businessPhone && <p className="text-xs text-destructive mt-1">{fieldErrors.businessPhone}</p>}
              </div>
              <div>
                <Label htmlFor="howDidYouHear">How did you hear about us? *</Label>
                <Select value={formData.howDidYouHear} onValueChange={v => handleChange('howDidYouHear', v)}>
                  <SelectTrigger id="howDidYouHear" aria-invalid={!!fieldErrors.howDidYouHear}>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOW_DID_YOU_HEAR.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                {fieldErrors.howDidYouHear && <p className="text-xs text-destructive mt-1">{fieldErrors.howDidYouHear}</p>}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setCurrentStep('company-info')} className="gap-2">
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button onClick={handleDetailsSubmit} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload your dealership documents (both optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                All documents are optional — you can upload them now or after your account is created.
              </p>
              <DocumentUploadField
                label="Dealer's License"
                fieldId="dealerLicense"
                file={dealerLicenseFile}
                onChange={makeFileHandler(setDealerLicenseFile, "Dealer's license uploaded successfully", 'dealerLicenseFile')}
                error={fieldErrors.dealerLicenseFile}
              />
              <DocumentUploadField
                label="Corporate Paperwork"
                fieldId="corporatePaperwork"
                file={corporatePaperworkFile}
                onChange={makeFileHandler(setCorporatePaperworkFile, 'Corporate paperwork uploaded successfully', 'corporatePaperworkFile')}
                error={fieldErrors.corporatePaperworkFile}
              />
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setCurrentStep('details')} className="gap-2">
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button onClick={() => setCurrentStep('phone-verify')} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'phone-verify' && (
          <Card>
            <CardHeader>
              <CardTitle>Phone Verification</CardTitle>
              <CardDescription>Enter your mobile number to verify your identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input id="phoneNumber" placeholder="(555) 123-4567" value={formData.phoneNumber}
                  onChange={e => handleChange('phoneNumber', e.target.value)} aria-invalid={!!fieldErrors.phoneNumber} />
                {fieldErrors.phoneNumber && <p className="text-xs text-destructive mt-1">{fieldErrors.phoneNumber}</p>}
              </div>
              <p className="text-sm text-muted-foreground">
                A verification code will be sent to this number after account creation.
              </p>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setCurrentStep('documents')} className="gap-2">
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button onClick={handlePhoneSubmit} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'password' && (
          <CreateAccountStep
            role="dealer"
            formData={{
              email: formData.email,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
              companyName: formData.companyName,
            }}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            isLoading={isLoading}
            onSubmit={handleCreateAccount}
            onBack={() => setCurrentStep('phone-verify')}
          />
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}
