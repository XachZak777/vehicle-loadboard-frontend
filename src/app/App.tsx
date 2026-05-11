import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </ErrorBoundary>
  );
}