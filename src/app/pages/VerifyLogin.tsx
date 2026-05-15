import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Mail, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthNavbar } from '../components/AuthNavbar';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useRequestLoginCodeMutation, useVerifyLoginCodeMutation } from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';

export function VerifyLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email as string | undefined;

  const [code, setCode] = useState('');

  const [requestCode, { isLoading: isSending }] = useRequestLoginCodeMutation();
  const [verifyCode, { isLoading: isVerifying }] = useVerifyLoginCodeMutation();

  if (!email) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleResend = () => {
    setCode('');
    requestCode({ email })
      .unwrap()
      .then(() => toast.success('A new code has been sent to your email.'))
      .catch(() => toast.error('Could not resend the code. Please try again.'));
  };

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }
    try {
      const res = await verifyCode({ email, code: code.trim() }).unwrap();

      const rawRole = res.role?.toLowerCase() ?? '';
      const role: import('../types/user').UserRole =
        rawRole === 'broker' ? 'broker' : rawRole === 'admin' ? 'admin' : 'carrier';

      const user: UserProfile = {
        id: res.userId,
        role,
        email: res.email,
        phoneVerified: true,
        fmcsaVerified: true,
        createdAt: new Date().toISOString(),
      };

      dispatch(setCredentials({
        user,
        token: res.token,
        userId: res.userId,
        email: res.email,
        role: res.role,
        adminApproved: res.adminApproved,
      }));

      toast.success('Welcome back!', { description: `Logged in as ${res.email}` });

      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'broker') navigate('/broker/dashboard', { replace: true });
      else navigate('/loads', { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid or expired code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar showSignup={false} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
                <Mail className="size-8 text-amber-500" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription className="text-base mt-1">
                We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div>
                <Label htmlFor="code">6-Digit Code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={handleVerify}
                disabled={isVerifying || code.length !== 6}
              >
                {isVerifying ? <><Loader2 className="size-4 mr-2 animate-spin" />Verifying…</> : 'Verify & Sign In'}
              </Button>

              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="size-3 text-green-500 shrink-0" />
                  Code sent to <strong>{email}</strong>
                </div>
                <p>Check your spam folder if you don't see it.</p>
              </div>

              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={handleResend}
                disabled={isSending}
              >
                {isSending ? 'Sending…' : 'Resend code'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                  <ArrowLeft className="size-3" /> Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
