import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy-loaded pages — Vite splits each into its own chunk
const Welcome         = lazy(() => import('./pages/Welcome').then(m => ({ default: m.Welcome })));
const LoadBoard       = lazy(() => import('./pages/LoadBoard').then(m => ({ default: m.LoadBoard })));
const LoadDetail      = lazy(() => import('./pages/LoadDetail').then(m => ({ default: m.LoadDetail })));
const PostLoad        = lazy(() => import('./pages/PostLoad').then(m => ({ default: m.PostLoad })));
const EditLoad        = lazy(() => import('./pages/EditLoad').then(m => ({ default: m.EditLoad })));
const Login           = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup          = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const CarrierSignup   = lazy(() => import('./pages/CarrierSignup').then(m => ({ default: m.CarrierSignup })));
const BrokerSignup    = lazy(() => import('./pages/BrokerSignup').then(m => ({ default: m.BrokerSignup })));
const DealerSignup    = lazy(() => import('./pages/DealerSignup').then(m => ({ default: m.DealerSignup })));
const BrokerDashboard = lazy(() => import('./pages/BrokerDashboard').then(m => ({ default: m.BrokerDashboard })));
const CarrierHistory  = lazy(() => import('./pages/CarrierHistory').then(m => ({ default: m.CarrierHistory })));
const CarrierLoadsPage = lazy(() => import('./pages/CarrierLoadsPage').then(m => ({ default: m.CarrierLoadsPage })));
const CompanyProfile  = lazy(() => import('./pages/CompanyProfile').then(m => ({ default: m.CompanyProfile })));
const PendingApproval = lazy(() => import('./pages/PendingApproval').then(m => ({ default: m.PendingApproval })));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CheckEmail      = lazy(() => import('./pages/CheckEmail').then(m => ({ default: m.CheckEmail })));
const VerifyEmail     = lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword   = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const SessionExpired  = lazy(() => import('./pages/SessionExpired').then(m => ({ default: m.SessionExpired })));
const VerifyLogin     = lazy(() => import('./pages/VerifyLogin').then(m => ({ default: m.VerifyLogin })));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService  = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const CookiePolicy    = lazy(() => import('./pages/CookiePolicy').then(m => ({ default: m.CookiePolicy })));
const AboutUs         = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const Contact         = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));

// Thin root layout – Redux Provider lives in App.tsx
function RootLayout() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <Outlet />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Welcome />,
      },
      {
        path: '/loads',
        element: (
          <ProtectedRoute>
            <LoadBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/load/:id',
        element: (
          <ProtectedRoute>
            <LoadDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/post-load',
        element: (
          <ProtectedRoute allowedRoles={['broker', 'dealer']}>
            <PostLoad />
          </ProtectedRoute>
        ),
      },
      {
        path: '/broker/edit-load/:id',
        element: (
          <ProtectedRoute allowedRoles={['broker', 'dealer']}>
            <EditLoad />
          </ProtectedRoute>
        ),
      },
      {
        path: '/broker/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['broker', 'dealer']}>
            <BrokerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/broker/company',
        element: (
          <ProtectedRoute allowedRoles={['broker', 'dealer']}>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/carrier/history',
        element: (
          <ProtectedRoute allowedRoles={['carrier']}>
            <CarrierHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: '/carrier/assigned',
        element: (
          <ProtectedRoute allowedRoles={['carrier']}>
            <CarrierLoadsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/carrier/requested',
        element: (
          <ProtectedRoute allowedRoles={['carrier']}>
            <CarrierLoadsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/carrier/offers',
        element: (
          <ProtectedRoute allowedRoles={['carrier']}>
            <CarrierLoadsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/carrier/company',
        element: (
          <ProtectedRoute allowedRoles={['carrier']}>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pending-approval',
        element: (
          <ProtectedRoute skipApprovalCheck>
            <PendingApproval />
          </ProtectedRoute>
        ),
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/signup/carrier',
        element: <CarrierSignup />,
      },
      {
        path: '/signup/broker',
        element: <BrokerSignup />,
      },
      {
        path: '/signup/dealer',
        element: <DealerSignup />,
      },
      {
        path: '/check-email',
        element: <CheckEmail />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/session-expired',
        element: <SessionExpired />,
      },
      {
        path: '/verify-login',
        element: <VerifyLogin />,
      },
      {
        path: '/privacy',
        element: <PrivacyPolicy />,
      },
      {
        path: '/terms',
        element: <TermsOfService />,
      },
      {
        path: '/cookies',
        element: <CookiePolicy />,
      },
      {
        path: '/about',
        element: <AboutUs />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
    ],
  },
]);