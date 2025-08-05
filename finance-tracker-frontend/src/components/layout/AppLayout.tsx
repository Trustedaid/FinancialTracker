import React, { useState } from 'react';
import { useAuth } from '../../contexts';
import { Button } from '../ui';
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  FolderOpen, 
  Target,
  TrendingUp
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'İşlemler', href: '/transactions', icon: CreditCard },
  { name: 'Kategoriler', href: '/categories', icon: FolderOpen },
  { name: 'Bütçeler', href: '/budgets', icon: Target },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          
          {/* Mobile sidebar */}
          <div className="fixed top-0 left-0 z-40 w-64 h-full bg-white shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  Finans Takipçi
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="mt-4 px-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-3 py-2 mb-2 text-sm font-medium rounded-md transition-colors
                      ${isCurrentPath(item.href)
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b">
            <TrendingUp className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Finans Takipçi
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isCurrentPath(item.href)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>

              {/* Page title - will be populated by individual pages */}
              <div className="flex-1 lg:flex-none">
                <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
                  Finans Takipçi
                </h1>
              </div>
              
              {/* User menu */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hoş geldiniz, {user?.firstName} {user?.lastName}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  leftIcon={<LogOut size={16} />}
                >
                  <span className="hidden sm:inline">Çıkış</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;