import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/user';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Truck, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/apiClient';
import { setAuth } from '../utils/authStorage';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
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
      const res = await api.login({ email: email.trim(), password });

      setAuth({
        token: res.token,
        userId: res.userId,
        email: res.email,
        role: res.role,
      });

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

      login(minimalUser);

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
            <span className="text-3xl font-bold">LoadBoard Pro</span>
          </Link>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Log in to your LoadBoard Pro account
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

            {/* Backend-connected auth note */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="text-sm">
                <p className="text-amber-500 font-semibold mb-2">Note:</p>
                <p className="text-foreground">
                  Login uses your backend API (configured via <code className="bg-muted px-1 py-0.5 rounded text-amber-500">VITE_API_BASE_URL</code>).
                </p>
              </div>
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
