import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Clock, LogOut, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { AuthNavbar } from '../components/AuthNavbar';

export function PendingApproval() {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md">

        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
                <Clock className="size-10 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Account Under Review</CardTitle>
            <CardDescription className="text-base mt-2">
              Your registration has been submitted successfully. Our team is reviewing your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="size-4 mt-0.5 shrink-0 text-amber-500" />
                <p>You'll receive an email notification once your account has been approved by an administrator.</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="size-4 mt-0.5 shrink-0 text-amber-500" />
                <p>Review typically takes 1–2 business days. Please check your inbox and spam folder.</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already approved?{' '}
              <button
                onClick={handleLogout}
                className="text-amber-500 hover:text-amber-600 font-medium underline-offset-4 hover:underline"
              >
                Sign in again
              </button>
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
