import { CheckCircle, Upload } from 'lucide-react';
import { Label } from '../ui/label';
import { DropZone, DropZoneUploadLabel, DropZoneHint, DropZoneSuccess } from '../../styles/signup.styles';

interface Props {
  label: string;
  fieldId: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function DocumentUploadField({ label, fieldId, file, onChange, error }: Props) {
  return (
    <div>
      <Label>{label}</Label>
      <DropZone className={error ? 'border-destructive' : ''}>
        <Upload className="size-10 mx-auto mb-4 text-muted-foreground" />
        <input
          id={fieldId}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={onChange}
          className="hidden"
        />
        <DropZoneUploadLabel htmlFor={fieldId}>
          <span className="upload-link">Click to upload {label}</span>
          <span className="upload-or"> or drag and drop</span>
        </DropZoneUploadLabel>
        <DropZoneHint>PDF, DOC, or DOCX (max 5MB)</DropZoneHint>
        {file && (
          <DropZoneSuccess>
            <CheckCircle className="size-4" />
            <span>{file.name}</span>
          </DropZoneSuccess>
        )}
      </DropZone>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
