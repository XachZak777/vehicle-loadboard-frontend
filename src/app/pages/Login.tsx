import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, setCredentials } from '../store/slices/authSlice';
import { hauliusApi, useLoginUserMutation, useLogoutUserMutation } from '../store/services/hauliusApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { AuthNavbar } from '../components/AuthNavbar';
import { APP_NAME } from '../constants';
import { isBusinessEmail, businessEmailError } from '../utils/validation';
import type { UserProfile } from '../types/user';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [loginUser] = useLoginUserMutation();
  const [logoutUser] = useLogoutUserMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      logoutUser().finally(() => {
        dispatch(logout());
        dispatch(hauliusApi.util.resetApiState());
        navigate('/login', { replace: true });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const justVerified = (location.state as any)?.verified === true;
  const justResetPassword = (location.state as any)?.passwordReset === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowResend(false);

    if (!email.trim()) {
      setIsLoading(false);
      setError('Email address is required.');
      return;
    }

    if (!isBusinessEmail(email.trim())) {
      setIsLoading(false);
      setError(businessEmailError);
      return;
    }

    if (!password) {
      setIsLoading(false);
      setError('Password is required.');
      return;
    }

    try {
      const res = await loginUser({ email: email.trim(), password }).unwrap();

      // Admin users get a token directly — no email code step
      if (res.token && res.role?.toLowerCase() === 'admin') {
        const user: UserProfile = {
          id: res.userId!,
          role: 'admin',
          email: res.email,
          phoneNumber: '',
          phoneVerified: true,
          companyName: 'Admin',
          createdAt: new Date().toISOString(),
        };
        dispatch(setCredentials({
          user,
          token: res.token,
          userId: res.userId!,
          email: res.email,
          role: res.role,
          adminApproved: res.adminApproved ?? true,
        }));
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      navigate('/verify-login', { state: { email: res.email } });
    } catch (e: any) {
      const status = e?.status ?? e?.originalStatus;
      const message =
        e?.data?.message ??
        (e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Login failed.');

      setError(message);

      if (status === 403) {
        setShowResend(true);
      }

      toast.error('Login failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar showSignup={true} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Log in to your {APP_NAME} account
              </CardDescription>
            </CardHeader>
          <CardContent>
            {justVerified && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <CheckCircle className="size-4 shrink-0" />
                Email verified successfully! You can now log in.
              </div>
            )}
            {justResetPassword && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <CheckCircle className="size-4 shrink-0" />
                Password reset successfully! Please log in with your new password.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-amber-500 hover:text-amber-400">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
                {showResend && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                    onClick={() => navigate('/check-email', { state: { email: email.trim() } })}
                  >
                    Resend verification email
                  </Button>
                )}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-amber-500 hover:text-amber-400 font-semibold">
                Sign up
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
