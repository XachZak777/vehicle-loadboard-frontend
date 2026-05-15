import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Mail, Phone, Lock, Save, CheckCircle, Info, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../store/hooks';
import {
  useGetMyBrokerProfileQuery,
  useGetMyCarrierProfileQuery,
  useUpdateBrokerProfileMutation,
  useUpdateCarrierProfileMutation,
  useForgotPasswordMutation,
} from '../store/services/hauliusApi';

export function Settings() {
  const user = useAppSelector((s) => s.auth.user);
  const isBroker = user?.role === 'broker' || user?.role === 'dealer';
  const isCarrier = user?.role === 'carrier';

  const { data: brokerProfile } = useGetMyBrokerProfileQuery(undefined, { skip: !isBroker });
  const { data: carrierProfile } = useGetMyCarrierProfileQuery(undefined, { skip: !isCarrier });

  const [updateBrokerProfile, { isLoading: updatingBroker }] = useUpdateBrokerProfileMutation();
  const [updateCarrierProfile, { isLoading: updatingCarrier }] = useUpdateCarrierProfileMutation();
  const [forgotPassword, { isLoading: sendingReset }] = useForgotPasswordMutation();

  const profile = isBroker ? brokerProfile : carrierProfile;
  const isUpdating = updatingBroker || updatingCarrier;

  const [phoneValue, setPhoneValue] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

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
      toast.success('Phone number updated.');
      setPhoneValue('');
    } catch {
      toast.error('Failed to update phone number. Please try again.');
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    try {
      await forgotPassword({ email: user.email }).unwrap();
      setResetEmailSent(true);
      toast.success('Password reset email sent.');
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-5">

          <div className="pb-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your account settings and preferences</p>
          </div>

          {/* Email */}
          <Card>
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </CardTitle>
              <CardDescription>Your login email address</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md border bg-muted/40">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium break-all">{user.email}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                To change your email address, please contact support.
              </p>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card>
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone Number
              </CardTitle>
              <CardDescription>Update your contact phone number</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="px-6 py-4">
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
                <Button type="submit" disabled={isUpdating || !phoneValue.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating…' : 'Update Phone'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Change Password
              </CardTitle>
              <CardDescription>Reset your password via email confirmation</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="px-6 py-4 space-y-4">
              {resetEmailSent ? (
                <div className="flex items-start gap-3 rounded-md border bg-muted/40 px-4 py-3">
                  <CheckCircle className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Check your inbox</p>
                    <p className="text-muted-foreground mt-0.5">
                      A password reset link was sent to <span className="font-medium text-foreground">{user.email}</span>. It expires in 24 hours.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    We'll send a secure reset link to <span className="font-medium text-foreground">{user.email}</span>.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleSendPasswordReset}
                    disabled={sendingReset}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingReset ? 'Sending…' : 'Send Reset Email'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account info */}
          <Card>
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold">Account Information</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="px-6 py-4">
              <div className="text-sm text-muted-foreground space-y-1.5">
                {profile?.companyName && (
                  <p>Company: <span className="font-medium text-foreground">{profile.companyName}</span></p>
                )}
                <p>Account type: <span className="font-medium text-foreground capitalize">{user.role}</span></p>
                {profile?.dotNumber && (
                  <p>DOT: <span className="font-medium text-foreground">{profile.dotNumber}</span></p>
                )}
                {profile?.mcNumber && (
                  <p>MC: <span className="font-medium text-foreground">{profile.mcNumber}</span></p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
