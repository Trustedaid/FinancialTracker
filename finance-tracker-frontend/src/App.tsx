import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, LanguageProvider, CurrencyProvider, ThemeProvider } from './contexts';
import { ProtectedRoute, DashboardLayout } from './components';
import { 
  LoginPage, 
  RegisterPage, 
  DashboardPage, 
  HomePage,
  TransactionsPage,
  CategoriesPage,
  BudgetsPage
} from './pages';
import { HomeRoute } from './components/layout/HomeRoute';

function App() {
  return (
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
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TransactionsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CategoriesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/budgets" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <BudgetsPage />
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
  );
}

export default App;
