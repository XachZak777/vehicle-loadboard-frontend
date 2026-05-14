import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Button } from '../components/ui/button';
import { Mail, Phone, Lock, Save, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../store/hooks';
import {
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
  useUpdateBrokerProfileMutation,
  useUpdateCarrierProfileMutation,
} from '../store/services/hauliusApi';
import { Link } from 'react-router';

export function Settings() {
  const user = useAppSelector((s) => s.auth.user);
  const isBroker = user?.role === 'broker' || user?.role === 'dealer';
  const isCarrier = user?.role === 'carrier';

  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const { data: carrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });

  const [updateBrokerProfile, { isLoading: updatingBroker }] = useUpdateBrokerProfileMutation();
  const [updateCarrierProfile, { isLoading: updatingCarrier }] = useUpdateCarrierProfileMutation();

  const profile = isBroker ? brokerProfile : carrierProfile;
  const isUpdating = updatingBroker || updatingCarrier;

  const [phoneValue, setPhoneValue] = useState('');

  const currentPhone = profile?.phoneNumber ?? '';

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = phoneValue.trim();
    if (!phone) return;

    try {
      if (isBroker) {
        await updateBrokerProfile({ phoneNumber: phone }).unwrap();
      } else {
        await updateCarrierProfile({ phoneNumber: phone }).unwrap();
      }
      toast.success('Phone number updated successfully!', {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      });
      setPhoneValue('');
    } catch {
      toast.error('Failed to update phone number. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Email Address — read-only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Address
              </CardTitle>
              <CardDescription>Your login email address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-none border border-border">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium break-all">{user.email}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                To change your email, please contact support.
              </p>
            </CardContent>
          </Card>

          {/* Phone Number */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Number
              </CardTitle>
              <CardDescription>Update your contact phone number</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPhone && (
                <p className="text-sm text-muted-foreground mb-3">
                  Current: <span className="font-medium text-foreground">{currentPhone}</span>
                </p>
              )}
              <form onSubmit={handleUpdatePhone} className="space-y-4">
                <div>
                  <Label htmlFor="phone">New Phone Number</Label>
                  <PhoneInput
                    id="phone"
                    value={phoneValue}
                    onChange={setPhoneValue}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isUpdating || !phoneValue.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating…' : 'Update Phone'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Reset your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                To change your password, use the password reset flow. We will send a secure reset link to your email address.
              </p>
              <Link to="/forgot-password">
                <Button variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Reset Password via Email
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Account Information</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {profile?.companyName && (
                    <p>• Company: <span className="font-medium text-foreground">{profile.companyName}</span></p>
                  )}
                  <p>• Account Type: <span className="font-medium text-foreground capitalize">{user.role}</span></p>
                  {profile?.dotNumber && (
                    <p>• DOT Number: <span className="font-medium text-foreground">{profile.dotNumber}</span></p>
                  )}
                  {profile?.mcNumber && (
                    <p>• MC Number: <span className="font-medium text-foreground">{profile.mcNumber}</span></p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
