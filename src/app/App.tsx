import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  );
}