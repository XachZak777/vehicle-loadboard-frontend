import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HintText } from '../../styles/signup.styles';
import { DocumentUploadField } from './DocumentUploadField';
import { sanitizeTaxId, type FieldErrors } from '../../utils/validation';

interface Props {
  formData: { taxIdType: 'EIN' | 'SSN'; taxId: string };
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  w9File: File | null;
  insuranceFile: File | null;
  mcAuthorityFile: File | null;
  onW9Upload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInsuranceUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMcAuthorityUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function DocumentsUploadStep({
  formData, fieldErrors, onChange,
  w9File, insuranceFile, mcAuthorityFile,
  onW9Upload, onInsuranceUpload, onMcAuthorityUpload,
  onSubmit, onBack,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>Upload your W9, Insurance Certificate, and MC Authority documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="taxIdType">Tax ID Type *</Label>
          <Select
            value={formData.taxIdType}
            onValueChange={(value: 'SSN' | 'EIN') => {
              onChange('taxIdType', value);
              onChange('taxId', '');
            }}
          >
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
            autoComplete="off"
            value={formData.taxId}
            onChange={(e) => onChange('taxId', sanitizeTaxId(e.target.value))}
            placeholder={formData.taxIdType === 'EIN' ? '12-3456789' : '123-45-6789'}
            maxLength={11}
            aria-invalid={!!fieldErrors.taxId}
          />
          {fieldErrors.taxId
            ? <p className="text-xs text-destructive mt-1">{fieldErrors.taxId}</p>
            : <HintText>{formData.taxIdType === 'EIN' ? 'Format: XX-XXXXXXX' : 'Format: XXX-XX-XXXX'}</HintText>
          }
        </div>

        <DocumentUploadField
          label="W9 Document *"
          fieldId="w9File"
          file={w9File}
          onChange={onW9Upload}
          error={fieldErrors.w9File}
        />
        <DocumentUploadField
          label="Insurance Certificate *"
          fieldId="insuranceFile"
          file={insuranceFile}
          onChange={onInsuranceUpload}
          error={fieldErrors.insuranceFile}
        />
        <DocumentUploadField
          label="MC Authority *"
          fieldId="mcAuthorityFile"
          file={mcAuthorityFile}
          onChange={onMcAuthorityUpload}
          error={fieldErrors.mcAuthorityFile}
        />

        <Button
          onClick={onSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          Continue to Create Account
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
