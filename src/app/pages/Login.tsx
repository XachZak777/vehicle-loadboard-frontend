import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useLoginUserMutation } from '../store/services/hauliusApi';
import { UserProfile } from '../types/user';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Truck, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '../components/ThemeToggle';
import { APP_NAME } from '../constants';

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loginUser] = useLoginUserMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email.trim() || !password) {
      setIsLoading(false);
      setError('Email and password are required.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setIsLoading(false);
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setIsLoading(false);
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await loginUser({ email: email.trim(), password }).unwrap();

      const role = res.role?.toLowerCase() === 'broker' ? 'broker' : 'carrier';

      const minimalUser: UserProfile = {
        id: res.userId,
        role,
        email: res.email,
        phoneNumber: '',
        phoneVerified: true,
        companyName: role === 'broker' ? 'Broker' : 'Carrier',
        mcNumber: '',
        dotNumber: '',
        insuranceCompany: '',
        cargoInsurance: 0,
        liabilityInsurance: 0,
        taxId: '',
        taxIdType: 'EIN',
        fmcsaVerified: true,
        mailingAddress: '',
        city: '',
        state: '',
        zipCode: '',
        createdAt: new Date().toISOString(),
      };

      dispatch(setCredentials({
        user: minimalUser,
        token: res.token,
        userId: res.userId,
        email: res.email,
        role: res.role,
      }));

      toast.success('Welcome back!', {
        description: `Logged in as ${res.email}`,
      });

      navigate(role === 'broker' ? '/broker/dashboard' : '/loads');
    } catch (e: any) {
      const message = (e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Login failed.');
      setError(message);
      toast.error('Login failed', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Truck className="size-8 text-white" />
            </div>
            <span className="text-3xl font-bold">{APP_NAME}</span>
          </Link>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Log in to your {APP_NAME} account
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <a href="#" className="text-amber-500 hover:text-amber-400">
                  Forgot password?
                </a>
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
              <div className="mt-4 text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="size-4" />
                {error}
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
  );
}
