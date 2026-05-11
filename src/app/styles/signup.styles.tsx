import { cn } from '../components/ui/utils';

// ─── Page Shell ──────────────────────────────────────────────────────────────

export function PageWrapper({ children }: React.PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}

export function ContentWrapper({ children }: React.PropsWithChildren) {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

export function StepIndicatorWrapper({ children }: React.PropsWithChildren) {
  return (
    <div className="mb-6 p-3 sm:p-4 bg-card border border-border rounded-xl">{children}</div>
  );
}

export function StepList({ children }: React.PropsWithChildren) {
  return (
    <div className="flex items-start justify-center px-1">{children}</div>
  );
}

export function StepItem({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-col items-center flex-shrink-0">{children}</div>
  );
}

export function StepCircleWrapper({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-col items-center gap-1.5">{children}</div>
  );
}

export function StepCircle({ active, children }: React.PropsWithChildren<{ active: boolean }>) {
  return (
    <div className={cn(
      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
      active ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground',
    )}>
      {children}
    </div>
  );
}

export function StepLabel({ active, children }: React.PropsWithChildren<{ active: boolean }>) {
  return (
    <div className={cn(
      'text-[0.7rem] mt-1 text-center whitespace-nowrap transition-colors',
      active ? 'text-foreground font-semibold' : 'text-muted-foreground font-normal',
    )}>
      {children}
    </div>
  );
}

export function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div className={cn(
      'h-0.5 flex-1 min-w-6 mx-1.5 mt-5 transition-colors',
      completed ? 'bg-amber-500' : 'bg-muted',
    )} />
  );
}

// ─── Form Sections ────────────────────────────────────────────────────────────

export function FormGrid({ children }: React.PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  );
}

export function HintText({ children }: React.PropsWithChildren) {
  return <p className="text-xs text-muted-foreground mt-1">{children}</p>;
}

export function InfoBox({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-muted border border-border rounded-lg p-4">{children}</div>
  );
}

export function SuccessBox({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">{children}</div>
  );
}

export function SuccessBoxHeader({ children }: React.PropsWithChildren) {
  return (
    <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">{children}</div>
  );
}

export function SuccessBoxText({ children }: React.PropsWithChildren) {
  return <p className="text-sm text-foreground">{children}</p>;
}

// ─── W9 Upload ────────────────────────────────────────────────────────────────

export function DropZone({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn(
      'mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center bg-card transition-colors hover:border-amber-500',
      className,
    )}>
      {children}
    </div>
  );
}

export function DropZoneUploadLabel({ htmlFor, children }: React.PropsWithChildren<{ htmlFor: string }>) {
  return (
    <label
      htmlFor={htmlFor}
      className="cursor-pointer [&_.upload-link]:text-amber-500 [&_.upload-link]:font-semibold hover:[&_.upload-link]:text-amber-600 [&_.upload-or]:text-muted-foreground"
    >
      {children}
    </label>
  );
}

export function DropZoneHint({ children }: React.PropsWithChildren) {
  return <p className="text-xs text-muted-foreground mt-2">{children}</p>;
}

export function DropZoneSuccess({ children }: React.PropsWithChildren) {
  return (
    <div className="flex items-center justify-center gap-2 text-green-600 text-sm mt-4">{children}</div>
  );
}
