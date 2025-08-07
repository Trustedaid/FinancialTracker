import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, LanguageProvider, CurrencyProvider, ThemeProvider } from './contexts';
import { ProtectedRoute, DashboardLayout } from './components';
import { Skeleton } from './components/ui';
import { HomeRoute } from './components/layout/HomeRoute';
import { muiTheme } from './theme/muiTheme';

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const TransactionsPage = lazy(() => import('./pages/transactions/TransactionsPage'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const BudgetsPage = lazy(() => import('./pages/budgets/BudgetsPage'));

// Loading component for suspense fallback
const PageLoadingSkeleton = () => (
  <div className="min-h-screen p-6 space-y-6">
    <Skeleton className="h-8 w-1/3" />
    <div className="grid gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

// Create a client with optimized settings for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <Router>
              <div className="App">
              <Routes>
            {/* Home route - shows homepage for unauthenticated users, redirects to dashboard for authenticated users */}
            <Route path="/" element={<HomeRoute />} />
            
            {/* Public routes */}
            <Route 
              path="/home" 
              element={
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <HomePage />
                </Suspense>
              } 
            />
            <Route 
              path="/login" 
              element={
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <LoginPage />
                </Suspense>
              } 
            />
            <Route 
              path="/register" 
              element={
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <RegisterPage />
                </Suspense>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <DashboardPage />
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <TransactionsPage />
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <CategoriesPage />
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/budgets" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <BudgetsPage />
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </div>
              </Router>
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </MuiThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
