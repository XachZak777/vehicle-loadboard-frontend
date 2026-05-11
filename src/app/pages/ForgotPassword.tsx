import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthNavbar } from '../components/AuthNavbar';
import { useForgotPasswordMutation } from '../store/services/hauliusApi';
import { isBusinessEmail } from '../utils/validation';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBusinessEmail(email.trim())) return;
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
    } catch {
      // Intentionally ignored — always show the same message (anti-enumeration)
    } finally {
      setSubmitted(true);
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
              {submitted
                ? <CheckCircle className="size-8 text-green-500" />
                : <Mail className="size-8 text-amber-500" />
              }
            </div>
            <CardTitle className="text-2xl">
              {submitted ? 'Check your inbox' : 'Forgot password?'}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {submitted
                ? 'If an account with that email exists, a reset link has been sent.'
                : "Enter your email and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {!submitted ? (
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
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  disabled={isLoading || !isBusinessEmail(email.trim())}
                >
                  {isLoading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-1">
                  <p>📬 Check your <strong>spam / junk</strong> folder if you don't see it.</p>
                  <p>⏱ The link expires in <strong>1 hour</strong>.</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Try a different email
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it?{' '}
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
