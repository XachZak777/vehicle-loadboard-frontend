import { createBrowserRouter, Outlet } from 'react-router';
import { Welcome } from './pages/Welcome';
import { LoadBoard } from './pages/LoadBoard';
import { LoadDetail } from './pages/LoadDetail';
import { PostLoad } from './pages/PostLoad';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { CarrierSignup } from './pages/CarrierSignup';
import { BrokerSignup } from './pages/BrokerSignup';
import { Validation } from './pages/Validation';
import { BrokerDashboard } from './pages/BrokerDashboard';
import { CarrierHistory } from './pages/CarrierHistory';
import { CompanyProfile } from './pages/CompanyProfile';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

// Thin root layout – Redux Provider lives in App.tsx
function RootLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        Component: Welcome,
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
          <ProtectedRoute allowedRoles={['broker']}>
            <PostLoad />
          </ProtectedRoute>
        ),
      },
      {
        path: '/broker/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['broker']}>
            <BrokerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/broker/company',
        element: (
          <ProtectedRoute allowedRoles={['broker']}>
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
        path: '/carrier/company',
        element: (
          <ProtectedRoute allowedRoles={['carrier']}>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/signup',
        Component: Signup,
      },
      {
        path: '/validation',
        Component: Validation,
      },
      {
        path: '/signup/carrier',
        Component: CarrierSignup,
      },
      {
        path: '/signup/broker',
        Component: BrokerSignup,
      },
    ],
  },
]);