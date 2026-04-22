import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import {
  useValidateCarrierMutation,
  useSaveCarrierFromValidationMutation,
  useUpdateCarrierProfileMutation,
  useUploadCarrierW9Mutation,
  useUploadCarrierInsuranceMutation,
  useUploadCarrierMcAuthorityMutation,
  LookupResponse,
} from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { AuthNavbar } from '../components/AuthNavbar';
import { PageWrapper, ContentWrapper } from '../styles/signup.styles';
import {
  isValidDotNumber, isValidMcNumber, isValidCompanyName, isValidInsuranceAmount,
  isValidEIN, isValidSSN, isValidEmail, isStrongPassword,
  passwordRequirementsText, buildErrors, type FieldErrors,
} from '../utils/validation';
import { SignupStepIndicator } from '../components/signup/SignupStepIndicator';
import { CompanyInfoStep } from '../components/signup/CompanyInfoStep';
import { FmcsaVerificationStep } from '../components/signup/FmcsaVerificationStep';
import { InsuranceInfoStep } from '../components/signup/InsuranceInfoStep';
import { DocumentsUploadStep } from '../components/signup/DocumentsUploadStep';
import { CreateAccountStep } from '../components/signup/CreateAccountStep';

type SignupStep = 'company-info' | 'fmcsa-verification' | 'insurance-info' | 'w9-upload' | 'create-account';

const STEPS = [
  { id: 'company-info',       label: 'MC / DOT'       },
  { id: 'fmcsa-verification', label: 'Verify'         },
  { id: 'insurance-info',     label: 'Insurance'      },
  { id: 'w9-upload',          label: 'Documents'      },
  { id: 'create-account',     label: 'Create Account' },
] as const;

export function CarrierSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [validateCarrier] = useValidateCarrierMutation();
  const [saveCarrier] = useSaveCarrierFromValidationMutation();
  const [updateProfile] = useUpdateCarrierProfileMutation();
  const [uploadW9] = useUploadCarrierW9Mutation();
  const [uploadInsurance] = useUploadCarrierInsuranceMutation();
  const [uploadMcAuthority] = useUploadCarrierMcAuthorityMutation();

  const [currentStep, setCurrentStep] = useState<SignupStep>('company-info');
  const [isLoading, setIsLoading] = useState(false);
  const [fmcsaVerified, setFmcsaVerified] = useState(false);
  const [validationId, setValidationId] = useState<string | null>(null);
  const [fmcsaData, setFmcsaData] = useState<LookupResponse | null>(null);
  const [w9File, setW9File] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [mcAuthorityFile, setMcAuthorityFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    companyName: '', dotNumber: '', mcNumber: '', phoneNumber: '',
    insuranceCompany: '', cargoInsurance: '', liabilityInsurance: '',
    taxIdType: 'EIN' as 'SSN' | 'EIN',
    taxId: '', mailingAddress: '', city: '', state: '', zipCode: '',
    carrierOperation: '', dbaName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleCompanyInfoSubmit = () => {
    const errs = buildErrors([
      [!formData.mcNumber.trim(), 'mcNumber', 'MC number is required.'],
      [!!formData.mcNumber.trim() && !isValidMcNumber(formData.mcNumber), 'mcNumber', 'MC number must be 1–7 digits (e.g. 123456).'],
      [!!formData.dotNumber.trim() && !isValidDotNumber(formData.dotNumber), 'dotNumber', 'DOT number must be 1–8 digits with no letters.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('fmcsa-verification');
  };

  const handleCarrierVerification = async () => {
    setIsLoading(true);
    try {
      const lookupType = formData.mcNumber.trim() ? 'MC' : 'DOT';
      const lookupValue = lookupType === 'MC' ? formData.mcNumber.trim() : formData.dotNumber.trim();
      const result = await validateCarrier({ lookupValue, lookupType }).unwrap();
      setValidationId(result.validationId);
      setFmcsaData(result);
      setFmcsaVerified(true);
      setFormData(prev => ({
        ...prev,
        companyName: result.legalName || prev.companyName,
        dbaName: result.dbaName || '',
        dotNumber: result.dotNumber || prev.dotNumber,
        mcNumber: result.mcNumber || prev.mcNumber,
        phoneNumber: result.phone || prev.phoneNumber,
        mailingAddress: result.phyStreet || prev.mailingAddress,
        city: result.phyCity || prev.city,
        state: result.phyState || prev.state,
        zipCode: result.phyZip || prev.zipCode,
        carrierOperation: result.carrierOperation?.join(', ') || '',
      }));
      toast.success('Carrier verification successful!');
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || 'Verification failed. Please check your DOT/MC number and try again.';
      toast.error(msg);
      setFmcsaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsuranceSubmit = () => {
    const errs = buildErrors([
      [!formData.insuranceCompany.trim(), 'insuranceCompany', 'Insurance company name is required.'],
      [!!formData.insuranceCompany.trim() && !isValidCompanyName(formData.insuranceCompany), 'insuranceCompany', 'Insurance company name must be 2–100 characters.'],
      [!formData.cargoInsurance.trim(), 'cargoInsurance', 'Cargo insurance amount is required.'],
      [!!formData.cargoInsurance.trim() && !isValidInsuranceAmount(formData.cargoInsurance), 'cargoInsurance', 'Enter a valid amount between $1 and $999,999,999.'],
      [!formData.liabilityInsurance.trim(), 'liabilityInsurance', 'Liability insurance amount is required.'],
      [!!formData.liabilityInsurance.trim() && !isValidInsuranceAmount(formData.liabilityInsurance), 'liabilityInsurance', 'Enter a valid amount between $1 and $999,999,999.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('w9-upload');
  };

  const makeUploadHandler = (
    setFile: (f: File) => void,
    successMsg: string,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    setFile(file);
    toast.success(successMsg);
  };

  const handleDocumentsSubmit = () => {
    const taxId = formData.taxId.trim();
    const errs = buildErrors([
      [!formData.taxId.trim(), 'taxId', `${formData.taxIdType} is required.`],
      [!!taxId && formData.taxIdType === 'EIN' && !isValidEIN(taxId), 'taxId', 'EIN must be in the format XX-XXXXXXX (9 digits).'],
      [!!taxId && formData.taxIdType === 'SSN' && !isValidSSN(taxId), 'taxId', 'SSN must be in the format XXX-XX-XXXX (9 digits).'],
      [!w9File, 'w9File', 'W9 document is required.'],
      [!insuranceFile, 'insuranceFile', 'Insurance certificate is required.'],
      [!mcAuthorityFile, 'mcAuthorityFile', 'MC Authority document is required.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('create-account');
  };

  const handleCreateAccount = async () => {
    const errs = buildErrors([
      [!formData.email.trim(), 'email', 'Email address is required.'],
      [!!formData.email.trim() && !isValidEmail(formData.email), 'email', 'Please enter a valid email address.'],
      [!formData.password, 'password', 'Password is required.'],
      [!!formData.password && !isStrongPassword(formData.password), 'password', passwordRequirementsText],
      [!formData.confirmPassword, 'confirmPassword', 'Please confirm your password.'],
      [!!formData.confirmPassword && formData.password !== formData.confirmPassword, 'confirmPassword', 'Passwords do not match.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setIsLoading(true);
    try {
      if (!validationId) { toast.error('Carrier verification is required before creating your account.'); return; }
      const res = await saveCarrier({ validationId, email: formData.email.trim(), password: formData.password }).unwrap();
      const userProfile: UserProfile = {
        id: res.userId, role: 'carrier', email: res.email,
        phoneNumber: formData.phoneNumber, phoneVerified: false,
        companyName: formData.companyName, mcNumber: formData.mcNumber, dotNumber: formData.dotNumber,
        insuranceCompany: formData.insuranceCompany,
        cargoInsurance: formData.cargoInsurance ? parseFloat(formData.cargoInsurance) : 0,
        liabilityInsurance: formData.liabilityInsurance ? parseFloat(formData.liabilityInsurance) : 0,
        w9Document: w9File?.name, taxId: formData.taxId, taxIdType: formData.taxIdType,
        fmcsaVerified: true, verificationDate: new Date().toISOString(),
        mailingAddress: formData.mailingAddress, city: formData.city,
        state: formData.state, zipCode: formData.zipCode, createdAt: new Date().toISOString(),
      };
      dispatch(setCredentials({ user: userProfile, token: res.token, userId: res.userId, email: res.email, role: res.role, adminApproved: res.adminApproved }));

      try { await updateProfile({ companyName: formData.companyName, dotNumber: formData.dotNumber, mcNumber: formData.mcNumber, phoneNumber: formData.phoneNumber, insuranceCompany: formData.insuranceCompany, cargoInsurance: formData.cargoInsurance ? parseFloat(formData.cargoInsurance) : undefined, liabilityInsurance: formData.liabilityInsurance ? parseFloat(formData.liabilityInsurance) : undefined, taxIdType: formData.taxIdType, taxId: formData.taxId, mailingAddress: formData.mailingAddress, city: formData.city, state: formData.state, zipCode: formData.zipCode }).unwrap(); } catch { toast.warning('Profile data will be saved once your email is verified.'); }

      for (const [file, upload, msg] of [
        [w9File, uploadW9, 'W9 upload will be available once your email is verified.'],
        [insuranceFile, uploadInsurance, 'Insurance certificate upload will be available once your email is verified.'],
        [mcAuthorityFile, uploadMcAuthority, 'MC Authority upload will be available once your email is verified.'],
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
      <AuthNavbar subtitle="Carrier Registration" />
      <ContentWrapper>
        <SignupStepIndicator steps={STEPS} currentIndex={currentIndex} />

        {currentStep === 'company-info' && (
          <CompanyInfoStep
            formData={{ mcNumber: formData.mcNumber, dotNumber: formData.dotNumber }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            onSubmit={handleCompanyInfoSubmit}
          />
        )}

        {currentStep === 'fmcsa-verification' && (
          <FmcsaVerificationStep
            role="carrier"
            formData={formData}
            fmcsaVerified={fmcsaVerified}
            fmcsaData={fmcsaData}
            isLoading={isLoading}
            onVerify={handleCarrierVerification}
            onContinue={() => setCurrentStep('insurance-info')}
            onBack={() => { setFmcsaVerified(false); setCurrentStep('company-info'); }}
          />
        )}

        {currentStep === 'insurance-info' && (
          <InsuranceInfoStep
            formData={{ insuranceCompany: formData.insuranceCompany, cargoInsurance: formData.cargoInsurance, liabilityInsurance: formData.liabilityInsurance }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            onSubmit={handleInsuranceSubmit}
            onBack={() => setCurrentStep('fmcsa-verification')}
          />
        )}

        {currentStep === 'w9-upload' && (
          <DocumentsUploadStep
            formData={{ taxIdType: formData.taxIdType, taxId: formData.taxId }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            w9File={w9File}
            insuranceFile={insuranceFile}
            mcAuthorityFile={mcAuthorityFile}
            onW9Upload={makeUploadHandler(setW9File, 'W9 document uploaded successfully')}
            onInsuranceUpload={makeUploadHandler(setInsuranceFile, 'Insurance certificate uploaded successfully')}
            onMcAuthorityUpload={makeUploadHandler(setMcAuthorityFile, 'MC Authority document uploaded successfully')}
            onSubmit={handleDocumentsSubmit}
            onBack={() => setCurrentStep('insurance-info')}
          />
        )}

        {currentStep === 'create-account' && (
          <CreateAccountStep
            role="carrier"
            formData={{ email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword, companyName: formData.companyName, mcNumber: formData.mcNumber, dotNumber: formData.dotNumber }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            isLoading={isLoading}
            onSubmit={handleCreateAccount}
            onBack={() => setCurrentStep('w9-upload')}
          />
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}

