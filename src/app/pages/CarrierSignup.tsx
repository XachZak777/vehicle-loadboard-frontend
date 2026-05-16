import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import {
  useRegisterMutation,
  useUpdateCarrierProfileMutation,
  useUploadCarrierW9Mutation,
  useUploadCarrierInsuranceMutation,
  useUploadCarrierMcAuthorityMutation,
  PreferredLine,
} from '../store/services/hauliusApi';
import { AuthNavbar } from '../components/AuthNavbar';
import { PageWrapper, ContentWrapper } from '../styles/signup.styles';
import {
  isValidMcNumber, isValidDotNumber, isValidCompanyName, isValidInsuranceAmount,
  isBusinessEmail, businessEmailError, isValidEIN, isValidSSN,
  isStrongPassword, passwordRequirementsText, buildErrors, type FieldErrors,
} from '../utils/validation';
import { SignupStepIndicator } from '../components/signup/SignupStepIndicator';
import { CompanyInfoStep } from '../components/signup/CompanyInfoStep';
import { CarrierInfoStep } from '../components/signup/CarrierInfoStep';
import { DocumentsUploadStep } from '../components/signup/DocumentsUploadStep';
import { CreateAccountStep } from '../components/signup/CreateAccountStep';

type SignupStep = 'company-info' | 'info' | 'documents' | 'create-account';

const STEPS = [
  { id: 'company-info',    label: 'Company Info'   },
  { id: 'info',            label: 'Information'    },
  { id: 'documents',       label: 'Documents'      },
  { id: 'create-account',  label: 'Create Account' },
] as const;

export function CarrierSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register] = useRegisterMutation();
  const [updateProfile] = useUpdateCarrierProfileMutation();
  const [uploadW9] = useUploadCarrierW9Mutation();
  const [uploadInsurance] = useUploadCarrierInsuranceMutation();
  const [uploadMcAuthority] = useUploadCarrierMcAuthorityMutation();

  const [currentStep, setCurrentStep] = useState<SignupStep>('company-info');
  const [isLoading, setIsLoading] = useState(false);
  const [w9File, setW9File] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [mcAuthorityFile, setMcAuthorityFile] = useState<File | null>(null);
  const [preferredLines, setPreferredLines] = useState<PreferredLine[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    companyName: '', dbaName: '', dotNumber: '', mcNumber: '', phoneNumber: '',
    insuranceCompany: '', cargoInsurance: '', liabilityInsurance: '',
    taxIdType: 'EIN' as 'SSN' | 'EIN',
    taxId: '', mailingAddress: '', city: '', state: '', zipCode: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleCompanyInfoSubmit = () => {
    const errs = buildErrors([
      [!formData.companyName.trim(), 'companyName', 'Company name is required.'],
      [!!formData.companyName.trim() && !isValidCompanyName(formData.companyName), 'companyName', 'Company name must be 2–100 characters.'],
      [!formData.dotNumber.trim(), 'dotNumber', 'DOT number is required.'],
      [!!formData.dotNumber.trim() && !isValidDotNumber(formData.dotNumber), 'dotNumber', 'DOT number must be 1–8 digits with no letters.'],
      [!!formData.mcNumber.trim() && !isValidMcNumber(formData.mcNumber), 'mcNumber', 'MC number must be 1–7 digits (e.g. 123456).'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('info');
  };

  const handleInfoSubmit = () => {
    const taxId = formData.taxId.trim();
    const errs = buildErrors([
      [!formData.insuranceCompany.trim(), 'insuranceCompany', 'Insurance company name is required.'],
      [!!formData.insuranceCompany.trim() && !isValidCompanyName(formData.insuranceCompany), 'insuranceCompany', 'Insurance company name must be 2–100 characters.'],
      [!formData.cargoInsurance.trim(), 'cargoInsurance', 'Cargo insurance amount is required.'],
      [!!formData.cargoInsurance.trim() && !isValidInsuranceAmount(formData.cargoInsurance), 'cargoInsurance', 'Enter a valid amount between $1 and $999,999,999.'],
      [!formData.liabilityInsurance.trim(), 'liabilityInsurance', 'Liability insurance amount is required.'],
      [!!formData.liabilityInsurance.trim() && !isValidInsuranceAmount(formData.liabilityInsurance), 'liabilityInsurance', 'Enter a valid amount between $1 and $999,999,999.'],
      [!formData.taxId.trim(), 'taxId', `${formData.taxIdType} is required.`],
      [!!taxId && formData.taxIdType === 'EIN' && !isValidEIN(taxId), 'taxId', 'EIN must be in the format XX-XXXXXXX (9 digits).'],
      [!!taxId && formData.taxIdType === 'SSN' && !isValidSSN(taxId), 'taxId', 'SSN must be in the format XXX-XX-XXXX (9 digits).'],
      [preferredLines.length < 3, 'preferredLines', 'At least 3 preferred lanes are required.'],
      [preferredLines.some(l => !l.fromState || !l.toState), 'preferredLines', 'All lanes must have both a from and to state selected.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('documents');
  };

  const makeUploadHandler = (setFile: (f: File) => void, successMsg: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
      setFile(file);
      toast.success(successMsg);
    };

  const handleDocumentsSubmit = () => {
    const errs = buildErrors([
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
      const res = await register({ email: formData.email.trim(), password: formData.password, role: 'CARRIER' }).unwrap();
      dispatch(setCredentials({
        user: { id: res.userId, role: 'carrier', email: res.email, createdAt: new Date().toISOString() },
        token: res.token, userId: res.userId, email: res.email, role: res.role, adminApproved: res.adminApproved,
      }));

      try {
        await updateProfile({
          companyName: formData.companyName, dotNumber: formData.dotNumber, mcNumber: formData.mcNumber,
          phoneNumber: formData.phoneNumber, insuranceCompany: formData.insuranceCompany,
          cargoInsurance: formData.cargoInsurance ? parseFloat(formData.cargoInsurance) : undefined,
          liabilityInsurance: formData.liabilityInsurance ? parseFloat(formData.liabilityInsurance) : undefined,
          taxIdType: formData.taxIdType, taxId: formData.taxId,
          mailingAddress: formData.mailingAddress, city: formData.city,
          state: formData.state, zipCode: formData.zipCode,
          preferredLines: preferredLines.length > 0 ? JSON.stringify(preferredLines) : undefined,
        }).unwrap();
      } catch { toast.warning('Profile data will be saved once your email is verified.'); }

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
            role="carrier"
            formData={{
              companyName: formData.companyName, dbaName: formData.dbaName,
              mcNumber: formData.mcNumber, dotNumber: formData.dotNumber,
              phoneNumber: formData.phoneNumber, mailingAddress: formData.mailingAddress,
              city: formData.city, state: formData.state, zipCode: formData.zipCode,
            }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            onSubmit={handleCompanyInfoSubmit}
          />
        )}

        {currentStep === 'info' && (
          <CarrierInfoStep
            formData={{
              insuranceCompany: formData.insuranceCompany,
              cargoInsurance: formData.cargoInsurance,
              liabilityInsurance: formData.liabilityInsurance,
              taxIdType: formData.taxIdType,
              taxId: formData.taxId,
            }}
            preferredLines={preferredLines}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            onPreferredLinesChange={setPreferredLines}
            onSubmit={handleInfoSubmit}
            onBack={() => setCurrentStep('company-info')}
          />
        )}

        {currentStep === 'documents' && (
          <DocumentsUploadStep
            fieldErrors={fieldErrors}
            w9File={w9File}
            insuranceFile={insuranceFile}
            mcAuthorityFile={mcAuthorityFile}
            onW9Upload={makeUploadHandler(setW9File, 'W9 document uploaded successfully')}
            onInsuranceUpload={makeUploadHandler(setInsuranceFile, 'Insurance certificate uploaded successfully')}
            onMcAuthorityUpload={makeUploadHandler(setMcAuthorityFile, 'MC Authority document uploaded successfully')}
            onSubmit={handleDocumentsSubmit}
            onBack={() => setCurrentStep('info')}
          />
        )}

        {currentStep === 'create-account' && (
          <CreateAccountStep
            role="carrier"
            formData={{
              email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword,
              companyName: formData.companyName, mcNumber: formData.mcNumber, dotNumber: formData.dotNumber,
            }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            isLoading={isLoading}
            onSubmit={handleCreateAccount}
            onBack={() => setCurrentStep('documents')}
          />
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}
