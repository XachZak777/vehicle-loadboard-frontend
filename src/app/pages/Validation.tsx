import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

export function Validation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode');

  useEffect(() => {
    // Non-blocking info page; backend has no OTP/verification.
    const t = window.setTimeout(() => {
      navigate(mode === 'login' ? '/login' : '/login', { replace: true });
    }, 2500);

    return () => window.clearTimeout(t);
  }, [navigate, mode]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="size-6 text-green-600" />
            All set
          </CardTitle>
          <CardDescription>
            Account created successfully. You can log in now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This app doesn’t require OTP/email verification at the moment.
          </p>
          <div className="flex gap-2">
            <Link to="/login" className="flex-1">
              <Button className="w-full gap-2">
                Go to Login
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
