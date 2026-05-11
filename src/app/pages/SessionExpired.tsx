import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShieldAlert, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthNavbar } from '../components/AuthNavbar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useRequestLoginCodeMutation, useVerifyLoginCodeMutation } from '../store/services/hauliusApi';

export function SessionExpired() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const existingUser = useAppSelector((s) => s.auth.user);
  const email = existingUser?.email ?? '';

  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const [requestCode, { isLoading: isSending }] = useRequestLoginCodeMutation();
  const [verifyCode, { isLoading: isVerifying }] = useVerifyLoginCodeMutation();

  useEffect(() => {
    if (!email) return;
    requestCode({ email })
      .unwrap()
      .then(() => setCodeSent(true))
      .catch(() => toast.error('Could not send sign-in code. Please try again.'));
  }, []);

  const handleResend = () => {
    setCode('');
    requestCode({ email })
      .unwrap()
      .then(() => {
        setCodeSent(true);
        toast.success('A new code has been sent.');
      })
      .catch(() => toast.error('Could not resend code. Please try again.'));
  };

  const handleVerify = async () => {
    if (code.trim().length !== 6) { toast.error('Enter the 6-digit code from your email.'); return; }
    try {
      const res = await verifyCode({ email, code: code.trim() }).unwrap();
      const userProfile = {
        ...(existingUser ?? {}),
        id: res.userId,
        role: res.role as any,
        email: res.email,
        adminApproved: res.adminApproved,
      };
      dispatch(setCredentials({ user: userProfile, token: res.token, userId: res.userId, email: res.email, role: res.role, adminApproved: res.adminApproved }));
      toast.success('Signed in successfully.');
      navigate('/loads', { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid or expired code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar showLogin={false} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
                {isSending
                  ? <Loader2 className="size-8 text-amber-500 animate-spin" />
                  : codeSent
                    ? <Mail className="size-8 text-amber-500" />
                    : <ShieldAlert className="size-8 text-amber-500" />
                }
              </div>
              <CardTitle className="text-2xl">
                {codeSent ? 'Check your email' : 'Session expired'}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isSending
                  ? 'Sending a sign-in code…'
                  : codeSent
                    ? <>We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.</>
                    : 'Your session has timed out.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {codeSent && (
                <>
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
                    {isVerifying ? 'Verifying…' : 'Sign in'}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
