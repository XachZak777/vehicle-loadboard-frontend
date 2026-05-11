import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { US_STATES } from '../../constants';
import type { PreferredLine } from '../../store/services/hauliusApi';

interface Props {
  lines: PreferredLine[];
  onChange: (lines: PreferredLine[]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function PreferredLinesStep({ lines, onChange, onSubmit, onBack }: Props) {
  const addLine = () => onChange([...lines, { fromState: '', toState: '' }]);
  const removeLine = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'fromState' | 'toState', value: string) => {
    const updated = lines.map((l, idx) => idx === i ? { ...l, [field]: value } : l);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferred Lanes</CardTitle>
        <CardDescription>
          Add origin-to-destination state pairs for loads you prefer to haul. You can edit these from your profile at any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lines.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No preferred lanes added. You can skip this step or add lanes now.
          </p>
        )}

        {lines.map((line, i) => (
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

        {lines.length < 10 && (
          <Button type="button" variant="outline" className="w-full gap-2" onClick={addLine}>
            <Plus className="size-4" />
            Add Lane
          </Button>
        )}

        <Button onClick={onSubmit} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          Continue to Create Account
        </Button>
        <Button type="button" variant="ghost" className="w-full text-sm" onClick={onBack}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}
