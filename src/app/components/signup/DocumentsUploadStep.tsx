import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DocumentUploadField } from './DocumentUploadField';
import { type FieldErrors } from '../../utils/validation';

interface Props {
  fieldErrors: FieldErrors;
  w9File: File | null;
  mcAuthorityFile: File | null;
  insuranceFile?: File | null;
  onW9Upload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMcAuthorityUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInsuranceUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function DocumentsUploadStep({
  fieldErrors,
  w9File, mcAuthorityFile, insuranceFile,
  onW9Upload, onMcAuthorityUpload, onInsuranceUpload,
  onSubmit, onBack,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>Upload your W9{onInsuranceUpload ? ', Insurance Certificate,' : ''} and MC Authority documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DocumentUploadField
          label="W9 Document *"
          fieldId="w9File"
          file={w9File}
          onChange={onW9Upload}
          error={fieldErrors.w9File}
        />

        {onInsuranceUpload && (
          <DocumentUploadField
            label="Insurance Certificate *"
            fieldId="insuranceFile"
            file={insuranceFile ?? null}
            onChange={onInsuranceUpload}
            error={fieldErrors.insuranceFile}
          />
        )}

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
          Continue
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
