import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HintText } from '../../styles/signup.styles';
import { sanitizeTaxId, type FieldErrors } from '../../utils/validation';
import { US_STATES } from '../../constants';
import type { PreferredLine } from '../../store/services/hauliusApi';

interface Props {
  formData: {
    insuranceCompany: string;
    cargoInsurance: string;
    liabilityInsurance: string;
    taxIdType: 'EIN' | 'SSN';
    taxId: string;
  };
  preferredLines: PreferredLine[];
  fieldErrors: FieldErrors;
  onChange: (field: string, value: string) => void;
  onPreferredLinesChange: (lines: PreferredLine[]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function CarrierInfoStep({
  formData, preferredLines, fieldErrors,
  onChange, onPreferredLinesChange, onSubmit, onBack,
}: Props) {
  const addLine = () => onPreferredLinesChange([...preferredLines, { fromState: '', toState: '' }]);
  const removeLine = (i: number) => onPreferredLinesChange(preferredLines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'fromState' | 'toState', value: string) => {
    onPreferredLinesChange(preferredLines.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance, Tax & Preferred Lanes</CardTitle>
        <CardDescription>Provide your insurance details, tax identification, and at least one preferred lane</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="insuranceCompany">Insurance Company <span className="text-destructive">*</span></Label>
          <Input
            id="insuranceCompany"
            placeholder="Insurance Company Name"
            value={formData.insuranceCompany}
            onChange={e => onChange('insuranceCompany', e.target.value.trimStart())}
            maxLength={100}
            aria-invalid={!!fieldErrors.insuranceCompany}
          />
          {fieldErrors.insuranceCompany && <p className="text-xs text-destructive mt-1">{fieldErrors.insuranceCompany}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cargoInsurance">Cargo Insurance <span className="text-destructive">*</span></Label>
            <Input
              id="cargoInsurance"
              placeholder="e.g. 100000"
              inputMode="numeric"
              value={formData.cargoInsurance}
              onChange={e => onChange('cargoInsurance', e.target.value.replace(/[^\d.]/g, ''))}
              maxLength={20}
              aria-invalid={!!fieldErrors.cargoInsurance}
            />
            {fieldErrors.cargoInsurance && <p className="text-xs text-destructive mt-1">{fieldErrors.cargoInsurance}</p>}
          </div>
          <div>
            <Label htmlFor="liabilityInsurance">Liability Insurance <span className="text-destructive">*</span></Label>
            <Input
              id="liabilityInsurance"
              placeholder="e.g. 1000000"
              inputMode="numeric"
              value={formData.liabilityInsurance}
              onChange={e => onChange('liabilityInsurance', e.target.value.replace(/[^\d.]/g, ''))}
              maxLength={20}
              aria-invalid={!!fieldErrors.liabilityInsurance}
            />
            {fieldErrors.liabilityInsurance && <p className="text-xs text-destructive mt-1">{fieldErrors.liabilityInsurance}</p>}
          </div>
        </div>

        <div className="border-t border-border pt-4">
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
            onChange={e => onChange('taxId', sanitizeTaxId(e.target.value))}
            placeholder={formData.taxIdType === 'EIN' ? '12-3456789' : '123-45-6789'}
            maxLength={11}
            aria-invalid={!!fieldErrors.taxId}
          />
          {fieldErrors.taxId
            ? <p className="text-xs text-destructive mt-1">{fieldErrors.taxId}</p>
            : <HintText>{formData.taxIdType === 'EIN' ? 'Format: XX-XXXXXXX' : 'Format: XXX-XX-XXXX'}</HintText>
          }
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div>
            <Label>Preferred Lanes <span className="text-destructive">*</span></Label>
            <p className="text-xs text-muted-foreground mt-0.5">At least one origin → destination pair is required</p>
          </div>

          {preferredLines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select value={line.fromState} onValueChange={v => updateLine(i, 'fromState', v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="From state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              <Select value={line.toState} onValueChange={v => updateLine(i, 'toState', v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="To state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeLine(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          {fieldErrors.preferredLines && (
            <p className="text-xs text-destructive">{fieldErrors.preferredLines}</p>
          )}

          {preferredLines.length < 10 && (
            <Button type="button" variant="outline" className="w-full gap-2" onClick={addLine}>
              <Plus className="size-4" />
              Add Lane
            </Button>
          )}
        </div>

        <Button onClick={onSubmit} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          Continue to Documents
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
