import { Clock, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { useLogout } from '../hooks/useLogout';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { AuthNavbar } from '../components/AuthNavbar';
import { useAppSelector } from '../store/hooks';

export function PendingApproval() {
  const handleLogout = useLogout();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md space-y-6">

          {/* Icon + heading */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border bg-muted">
                <ShieldCheck className="size-8 text-muted-foreground" />
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Account Under Review</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email ?? 'Your account'} is pending admin approval.
              </p>
            </div>
          </div>

          <Separator />

          {/* Info list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </span>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground mb-0.5">Email notification</p>
                You'll receive an email once your account is approved. Check your inbox and spam folder.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                <Clock className="size-4 text-muted-foreground" />
              </span>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground mb-0.5">Review time</p>
                Approval typically takes 1–2 business days. No action is required on your end.
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <p className="text-center text-xs text-muted-foreground">
              Already approved? Log out and sign back in to refresh your access.
            </p>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
