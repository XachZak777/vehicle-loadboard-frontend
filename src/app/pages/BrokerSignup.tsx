import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import {
  useUpdateBrokerProfileMutation,
  useUploadBrokerW9Mutation,
  useUploadBrokerMcAuthorityMutation,
  useValidateBrokerMutation,
  useSaveBrokerFromValidationMutation,
  LookupResponse,
} from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { AuthNavbar } from '../components/AuthNavbar';
import { PageWrapper, ContentWrapper } from '../styles/signup.styles';
import {
  isValidMcNumber, isValidDotNumber, isBusinessEmail, businessEmailError,
  isValidEIN, isValidSSN,
  isStrongPassword, passwordRequirementsText, buildErrors, type FieldErrors,
} from '../utils/validation';
import { SignupStepIndicator } from '../components/signup/SignupStepIndicator';
import { McVerifyStep } from '../components/signup/McVerifyStep';
import { BrokerInfoStep } from '../components/signup/BrokerInfoStep';
import { DocumentsUploadStep } from '../components/signup/DocumentsUploadStep';
import { CreateAccountStep } from '../components/signup/CreateAccountStep';

type SignupStep = 'mc-verify' | 'info' | 'documents' | 'create-account';

const STEPS = [
  { id: 'mc-verify',       label: 'MC / DOT'       },
  { id: 'info',            label: 'Information'    },
  { id: 'documents',       label: 'Documents'      },
  { id: 'create-account',  label: 'Create Account' },
] as const;

export function BrokerSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [validateBroker] = useValidateBrokerMutation();
  const [saveBroker] = useSaveBrokerFromValidationMutation();
  const [updateProfile] = useUpdateBrokerProfileMutation();
  const [uploadW9] = useUploadBrokerW9Mutation();
  const [uploadMcAuthority] = useUploadBrokerMcAuthorityMutation();

  const [currentStep, setCurrentStep] = useState<SignupStep>('mc-verify');
  const [isLoading, setIsLoading] = useState(false);
  const [validationId, setValidationId] = useState<string | null>(null);
  const [fmcsaVerified, setFmcsaVerified] = useState(false);
  const [fmcsaData, setFmcsaData] = useState<LookupResponse | null>(null);
  const [w9File, setW9File] = useState<File | null>(null);
  const [mcAuthorityFile, setMcAuthorityFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    companyName: '', dotNumber: '', mcNumber: '', phoneNumber: '',
    bondCompany: '', bondPolicyNumber: '', bondCoverage: '', bondEffectiveDate: '',
    bondAgentFirstName: '', bondAgentLastName: '', bondAgentEmail: '', bondAgentPhone: '',
    taxIdType: 'EIN' as 'SSN' | 'EIN', taxId: '',
    mailingAddress: '', city: '', state: '', zipCode: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleBrokerVerification = async () => {
    const errs = buildErrors([
      [!formData.mcNumber.trim(), 'mcNumber', 'MC number is required.'],
      [!!formData.mcNumber.trim() && !isValidMcNumber(formData.mcNumber), 'mcNumber', 'MC number must be 1–7 digits (e.g. 123456).'],
      [!!formData.dotNumber.trim() && !isValidDotNumber(formData.dotNumber), 'dotNumber', 'DOT number must be 1–8 digits with no letters.'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
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

  const handleInfoSubmit = () => {
    const taxId = formData.taxId.trim();
    const errs = buildErrors([
      [!formData.bondCompany.trim(), 'bondCompany', 'Bond company is required.'],
      [!formData.bondPolicyNumber.trim(), 'bondPolicyNumber', 'Bond policy number is required.'],
      [!formData.bondCoverage.trim(), 'bondCoverage', 'Bond coverage amount is required.'],
      [!formData.bondEffectiveDate, 'bondEffectiveDate', 'Bond effective date is required.'],
      [!formData.bondAgentFirstName.trim(), 'bondAgentFirstName', 'Bond agent first name is required.'],
      [!formData.bondAgentLastName.trim(), 'bondAgentLastName', 'Bond agent last name is required.'],
      [!formData.bondAgentEmail.trim(), 'bondAgentEmail', 'Bond agent email is required.'],
      [!formData.bondAgentPhone.trim(), 'bondAgentPhone', 'Bond agent phone is required.'],
      [!formData.taxId.trim(), 'taxId', `${formData.taxIdType} is required.`],
      [!!taxId && formData.taxIdType === 'EIN' && !isValidEIN(taxId), 'taxId', 'EIN must be in the format XX-XXXXXXX (9 digits).'],
      [!!taxId && formData.taxIdType === 'SSN' && !isValidSSN(taxId), 'taxId', 'SSN must be in the format XXX-XX-XXXX (9 digits).'],
    ]);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCurrentStep('documents');
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
    const errs = buildErrors([
      [!w9File, 'w9File', 'W9 document is required.'],
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
      if (!validationId) { toast.error('Broker verification is required before creating your account.'); return; }
      const res = await saveBroker({ validationId, email: formData.email.trim(), password: formData.password }).unwrap();
      const userProfile: UserProfile = {
        id: res.userId, role: 'broker', email: res.email,
        phoneNumber: formData.phoneNumber, phoneVerified: false,
        companyName: formData.companyName, mcNumber: formData.mcNumber, dotNumber: formData.dotNumber,
        w9Document: w9File?.name, taxId: formData.taxId, taxIdType: formData.taxIdType,
        fmcsaVerified: true, verificationDate: new Date().toISOString(),
        mailingAddress: formData.mailingAddress, city: formData.city,
        state: formData.state, zipCode: formData.zipCode, createdAt: new Date().toISOString(),
      };
      dispatch(setCredentials({ user: userProfile, token: res.token, userId: res.userId, email: res.email, role: res.role, adminApproved: res.adminApproved }));

      try { await updateProfile({ companyName: formData.companyName, dotNumber: formData.dotNumber, mcNumber: formData.mcNumber, phoneNumber: formData.phoneNumber, taxIdType: formData.taxIdType, taxId: formData.taxId, mailingAddress: formData.mailingAddress, city: formData.city, state: formData.state, zipCode: formData.zipCode, bondCompany: formData.bondCompany || undefined, bondPolicyNumber: formData.bondPolicyNumber || undefined, bondCoverage: formData.bondCoverage || undefined, bondEffectiveDate: formData.bondEffectiveDate || undefined, bondAgentFirstName: formData.bondAgentFirstName || undefined, bondAgentLastName: formData.bondAgentLastName || undefined, bondAgentEmail: formData.bondAgentEmail || undefined, bondAgentPhone: formData.bondAgentPhone || undefined }).unwrap(); } catch { toast.warning('Profile data will be saved once your email is verified.'); }

      for (const [file, upload, msg] of [
        [w9File, uploadW9, 'W9 upload will be available once your email is verified.'],
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
      <AuthNavbar subtitle="Broker Registration" />
      <ContentWrapper>
        <SignupStepIndicator steps={STEPS} currentIndex={currentIndex} />

        {currentStep === 'mc-verify' && (
          <McVerifyStep
            role="broker"
            formData={{ ...formData, dbaName: '' }}
            fmcsaVerified={fmcsaVerified}
            fmcsaData={fmcsaData}
            isLoading={isLoading}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            onVerify={handleBrokerVerification}
            onContinue={() => setCurrentStep('info')}
            onBack={() => { setFmcsaVerified(false); setFmcsaData(null); setValidationId(null); setFieldErrors({}); }}
          />
        )}

        {currentStep === 'info' && (
          <BrokerInfoStep
            formData={{
              bondCompany: formData.bondCompany,
              bondPolicyNumber: formData.bondPolicyNumber,
              bondCoverage: formData.bondCoverage,
              bondEffectiveDate: formData.bondEffectiveDate,
              bondAgentFirstName: formData.bondAgentFirstName,
              bondAgentLastName: formData.bondAgentLastName,
              bondAgentEmail: formData.bondAgentEmail,
              bondAgentPhone: formData.bondAgentPhone,
              taxIdType: formData.taxIdType,
              taxId: formData.taxId,
            }}
            fieldErrors={fieldErrors}
            onChange={handleInputChange}
            onSubmit={handleInfoSubmit}
            onBack={() => setCurrentStep('mc-verify')}
          />
        )}

        {currentStep === 'documents' && (
          <DocumentsUploadStep
            fieldErrors={fieldErrors}
            w9File={w9File}
            mcAuthorityFile={mcAuthorityFile}
            onW9Upload={makeUploadHandler(setW9File, 'W9 document uploaded successfully')}
            onMcAuthorityUpload={makeUploadHandler(setMcAuthorityFile, 'MC Authority document uploaded successfully')}
            onSubmit={handleDocumentsSubmit}
            onBack={() => setCurrentStep('info')}
          />
        )}

        {currentStep === 'create-account' && (
          <CreateAccountStep
            role="broker"
            formData={{ email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword, companyName: formData.companyName, mcNumber: formData.mcNumber, dotNumber: formData.dotNumber }}
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
