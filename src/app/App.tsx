import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { store } from './store';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AIAssistant } from './components/AIAssistant';

export default function App() {
  return (
    <ErrorBoundary>
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_CAPTCHA_WEB_KEY}>
        <Provider store={store}>
          <RouterProvider router={router} />
          <Toaster />
          <AIAssistant />
        </Provider>
      </GoogleReCaptchaProvider>
    </ErrorBoundary>
  );
}