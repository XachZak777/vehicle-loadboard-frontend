import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AuthNavbar } from '../components/AuthNavbar';
import { useResendVerificationMutation } from '../store/services/hauliusApi';
import { toast } from 'sonner';

export function CheckEmail() {
  const location = useLocation();
  const email: string = (location.state as any)?.email ?? '';
  const [resend, { isLoading }] = useResendVerificationMutation();
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }
    try {
      await resend({ email }).unwrap();
      setResent(true);
      toast.success('Verification email resent!', {
        description: 'Please check your inbox (and spam folder).',
      });
    } catch {
      toast.error('Failed to resend. Please try again in a moment.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md">

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
              <Mail className="size-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Check your inbox</CardTitle>
            <CardDescription className="text-base mt-1">
              We sent a verification link to{' '}
              {email ? (
                <span className="font-semibold text-foreground">{email}</span>
              ) : (
                'your email address'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to verify your account. It expires in{' '}
              <span className="font-medium text-foreground">24 hours</span>.
            </p>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-1">
              <p>📬 Can't find the email? Check your <strong>spam / junk</strong> folder.</p>
              <p>📧 Make sure you signed up with the correct address.</p>
            </div>

            {resent && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="size-4 shrink-0" />
                Email resent! Please check your inbox.
              </div>
            )}

            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={handleResend}
              disabled={isLoading}
            >
              <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Sending…' : 'Resend verification email'}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already verified?{' '}
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
