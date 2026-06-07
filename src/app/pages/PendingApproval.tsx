import { MapBackground } from '../components/MapBackground';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, LogOut, Mail, RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { useLogout } from '../hooks/useLogout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { AuthNavbar } from '../components/AuthNavbar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useLazyGetMeQuery } from '../store/services/hauliusApi';

export function PendingApproval() {
  const handleLogout = useLogout();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const [fetchMe] = useLazyGetMeQuery();
  const [isChecking, setIsChecking] = useState(false);

  const roleLabel =
    user?.role === 'broker' ? 'Broker' :
    user?.role === 'dealer' ? 'Dealer' : 'Carrier';

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const me = await fetchMe().unwrap();
      if (me.adminApproved) {
        dispatch(setCredentials({
          user: { ...user!, role: user!.role },
          token: token!,
          userId: me.userId ?? user!.id,
          email: me.email ?? user!.email,
          role: user!.role.toUpperCase(),
          adminApproved: true,
        }));
        toast.success('Your account has been approved!');
        if (user?.role === 'broker' || user?.role === 'dealer') navigate('/broker/dashboard', { replace: true });
        else navigate('/loads', { replace: true });
      } else {
        toast.info('Your account is still under review.');
      }
    } catch {
      toast.error('Could not check status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <MapBackground />
      <AuthNavbar />

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md space-y-6">

          {/* Icon + heading */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                <ShieldCheck className="size-8 text-amber-500" />
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Account Under Review</h1>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{roleLabel}</Badge>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </span>
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-foreground mb-0.5">Email notification</p>
                <p className="text-muted-foreground">
                  You'll receive an email once your account is approved. Check your inbox and spam folder.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                <Clock className="size-4 text-muted-foreground" />
              </span>
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-foreground mb-0.5">Review time</p>
                <p className="text-muted-foreground">
                  Approval typically takes 1–2 business days. No action is required on your end.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              onClick={handleCheckStatus}
              disabled={isChecking}
            >
              {isChecking
                ? <><RefreshCw className="size-4 mr-2 animate-spin" />Checking…</>
                : <><RefreshCw className="size-4 mr-2" />Check Approval Status</>
              }
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(user?.role === 'carrier' ? '/carrier/company' : '/broker/company')}
            >
              <UserCog className="size-4 mr-2" />
              Complete Your Profile
            </Button>
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
