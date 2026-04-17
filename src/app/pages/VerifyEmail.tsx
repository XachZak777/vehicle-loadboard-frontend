import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AuthNavbar } from '../components/AuthNavbar';
import { useVerifyEmailQuery } from '../store/services/hauliusApi';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  // Skip if no token — will show error state
  const { isLoading, isSuccess, isError } = useVerifyEmailQuery(token, {
    skip: !token,
  });

  const [autoRedirecting, setAutoRedirecting] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setAutoRedirecting(true);
      const t = setTimeout(() => {
        navigate('/login', { state: { verified: true } });
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, navigate]);

  const noToken = !token;

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md">

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
              {isLoading && (
                <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
                  <Loader2 className="size-8 text-amber-500 animate-spin" />
                </div>
              )}
              {isSuccess && (
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="size-8 text-green-500" />
                </div>
              )}
              {(isError || noToken) && (
                <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <XCircle className="size-8 text-red-500" />
                </div>
              )}
            </div>

            <CardTitle className="text-2xl">
              {isLoading && 'Verifying your email…'}
              {isSuccess && 'Email verified!'}
              {(isError || noToken) && 'Verification failed'}
            </CardTitle>

            <CardDescription className="text-base mt-1">
              {isLoading && 'Please wait while we confirm your email address.'}
              {isSuccess && `Your email has been verified. ${autoRedirecting ? 'Redirecting to login…' : ''}`}
              {isError && 'This verification link is invalid or has expired.'}
              {noToken && 'No verification token was found in the URL.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {isSuccess && (
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={() => navigate('/login', { state: { verified: true } })}
              >
                Go to Login
              </Button>
            )}

            {(isError || noToken) && (
              <>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  onClick={() => navigate('/check-email')}
                >
                  Request a new verification link
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-amber-500 hover:text-amber-400">
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
