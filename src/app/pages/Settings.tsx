import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserProfile } from '../store/slices/authSlice';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { 
  Settings as SettingsIcon, 
  Mail, 
  Phone, 
  Lock, 
  Save,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { isStrongPassword, passwordRequirementsText } from '../utils/validation';

export function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: user?.email || '' });
  const [phoneForm, setPhoneForm] = useState({ phone: user?.phoneNumber || '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) return null;
  
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required.');
      return;
    }

    if (!isStrongPassword(passwordForm.newPassword)) {
      toast.error('Password too weak', { description: passwordRequirementsText });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure your new passwords match.'
      });
      return;
    }

    setIsUpdating(true);

    setTimeout(() => {
      // In production, you would verify the current password and update it
      setIsUpdating(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!', {
        description: 'Your password has been changed.',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-amber-500 p-3 rounded-lg">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>

          {/* Account Info */}
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Account Information</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Company: <span className="font-medium text-foreground">{user.companyName}</span></p>
                  <p>• Account Type: <span className="font-medium text-foreground capitalize">{user.role}</span></p>
                  <p>• DOT Number: <span className="font-medium text-foreground">{user.dotNumber}</span></p>
                  <p>• Member since: <span className="font-medium text-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    required
                    maxLength={128}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Min 8 chars, uppercase & number required"
                    required
                    minLength={8}
                    maxLength={128}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{passwordRequirementsText}</p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    maxLength={128}
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
