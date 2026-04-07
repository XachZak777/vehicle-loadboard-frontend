import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Truck, ArrowLeft, Building2, TruckIcon } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function Signup() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Truck className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LoadBoard Pro</h1>
                <p className="text-sm text-muted-foreground">Choose Your Account Type</p>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Join LoadBoard Pro Today
            </h2>
            <p className="text-xl text-muted-foreground">
              Select the account type that best describes your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Carrier Card */}
            <Card className="border hover:border-amber-500 transition-all hover:shadow-2xl cursor-pointer group">
              <Link to="/signup/carrier">
                <CardHeader className="text-center pt-10">
                  <div className="size-24 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-600 dark:group-hover:bg-amber-500 transition-colors">
                    <TruckIcon className="size-12 text-amber-600 dark:text-amber-500 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    I'm a Carrier
                  </CardTitle>
                  <CardDescription className="text-base">
                    I transport vehicles and want to find loads
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-10">
                  <ul className="space-y-3 text-foreground">
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Browse available vehicle transport loads
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Request and book loads instantly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Track your load history and earnings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Connect with verified brokers
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white">
                    Register as Carrier
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Broker Card */}
            <Card className="border hover:border-amber-500 transition-all hover:shadow-2xl cursor-pointer group">
              <Link to="/signup/broker">
                <CardHeader className="text-center pt-10">
                  <div className="size-24 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-600 dark:group-hover:bg-amber-500 transition-colors">
                    <Building2 className="size-12 text-amber-600 dark:text-amber-500 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    I'm a Broker
                  </CardTitle>
                  <CardDescription className="text-base">
                    I ship vehicles and need to find carriers
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-10">
                  <ul className="space-y-3 text-foreground">
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Post vehicle transport loads
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      View and manage booking requests
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Access the full load board
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 bg-amber-500 rounded-full"></div>
                      Connect with verified carriers
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white">
                    Register as Broker
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-500 hover:text-amber-600 font-semibold">
                Log in
              </Link>
            </p>
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