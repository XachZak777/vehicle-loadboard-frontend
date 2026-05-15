import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthNavbar } from '../components/AuthNavbar';
import { useResetPasswordMutation } from '../store/services/hauliusApi';
import { toast } from 'sonner';
import { isStrongPassword, passwordRequirementsText } from '../utils/validation';
import { useLogout } from '../hooks/useLogout';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const handleLogout = useLogout();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <AlertCircle className="size-12 text-red-500 mx-auto" />
          <p className="text-lg font-semibold">Invalid reset link</p>
          <p className="text-muted-foreground">
            This password reset link is missing or malformed.
          </p>
          <Link to="/forgot-password">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Request a new reset link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isStrongPassword(newPassword)) {
      setError(passwordRequirementsText);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, newPassword }).unwrap();
      toast.success('Password changed. Please sign in again.');
      await handleLogout();
    } catch (e: any) {
      const msg =
        e?.data?.message ??
        e?.message ??
        'This reset link is invalid or has expired.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar showLogin={true} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md">

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
              <Lock className="size-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Set new password</CardTitle>
            <CardDescription className="text-base mt-1">
              Choose a strong password for your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                  {error.toLowerCase().includes('invalid') && (
                    <Link to="/forgot-password" className="ml-auto text-amber-500 hover:text-amber-400 underline">
                      Get new link
                    </Link>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold">
                Back to Login
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
