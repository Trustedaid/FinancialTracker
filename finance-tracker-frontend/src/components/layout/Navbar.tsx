/**
 * Global Navigation Bar Component for Financial Tracker Application
 * 
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Glass morphism effects consistent with existing design
 * - Different navigation items based on authentication state
 * - Integrates with existing authentication context
 * - Maintains purple/blue gradient color scheme (#667eea to #764ba2)
 * - Smooth transitions and hover effects
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../contexts';
import { UserMenu } from './UserMenu';
import { Button, IconButton } from '@mui/material';
import { 
  TrendingUp, 
  Menu, 
  X, 
  LogOut, 
  Home, 
  CreditCard, 
  FolderOpen, 
  Target,
  User
} from 'lucide-react';

interface NavbarProps {
  className?: string;
}

// Navigation items for authenticated users (using translation keys)
const authenticatedNavItems = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: Home },
  { nameKey: 'nav.transactions', href: '/transactions', icon: CreditCard },
  { nameKey: 'nav.categories', href: '/categories', icon: FolderOpen },
  { nameKey: 'nav.budgets', href: '/budgets', icon: Target },
];

// Navigation items for unauthenticated users (using translation keys)
const publicNavItems = [
  { nameKey: 'nav.home', href: '/', icon: Home },
  { nameKey: 'nav.features', href: '#features', icon: Target },
  { nameKey: 'nav.about', href: '#about', icon: User },
];

export const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isCurrentPath = (path: string) => {
    if (path.startsWith('#')) {
      return false; // Hash links are handled separately
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMobileMenu();
  };

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  return (
    <>
      {/* Main Navbar */}
      <nav className={`navbar ${className}`}>
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Brand/Logo */}
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
              className="navbar-brand"
              onClick={closeMobileMenu}
            >
              <div className="navbar-logo">
                <TrendingUp size={24} />
              </div>
              <span className="navbar-title">Financial Tracker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-nav desktop">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isCurrentPath(item.href);
                const name = t(item.nameKey);
                
                if (item.href.startsWith('#')) {
                  const sectionId = item.href.substring(1);
                  return (
                    <Button
                      key={item.nameKey}
                      onClick={() => handleScrollToSection(sectionId)}
                      className={`navbar-link ${isActive ? 'active' : ''}`}
                      variant="text"
                      startIcon={<Icon size={18} />}
                      sx={{
                        textTransform: 'none',
                        color: isActive ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {name}
                    </Button>
                  );
                }

                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className={`navbar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} className="navbar-link-icon" />
                    {name}
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="navbar-actions desktop">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="navbar-auth-actions">
                  <Link to="/login" className="navbar-action-btn secondary">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="navbar-action-btn primary">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <IconButton 
              className="navbar-mobile-toggle"
              onClick={handleMobileMenuToggle}
              aria-label={t('navbar.toggle_menu')}
              sx={{ color: 'text.primary' }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="navbar-mobile-overlay" onClick={closeMobileMenu}>
            <div className="navbar-mobile-menu" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Navigation Items */}
              <div className="navbar-mobile-nav">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isCurrentPath(item.href);
                  const name = t(item.nameKey);
                  
                  if (item.href.startsWith('#')) {
                    const sectionId = item.href.substring(1);
                    return (
                      <Button
                        key={item.nameKey}
                        onClick={() => handleScrollToSection(sectionId)}
                        className={`navbar-mobile-link ${isActive ? 'active' : ''}`}
                        variant="text"
                        fullWidth
                        startIcon={<Icon size={20} />}
                        sx={{
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          color: isActive ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {name}
                      </Button>
                    );
                  }

                  return (
                    <Link
                      key={item.nameKey}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={`navbar-mobile-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={20} className="navbar-mobile-link-icon" />
                      {name}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Actions */}
              <div className="navbar-mobile-actions">
                {isAuthenticated ? (
                  <>
                    <div className="navbar-mobile-user-info">
                      <User size={20} />
                      <span>{user?.firstName} {user?.lastName}</span>
                    </div>
                    <Button 
                      onClick={handleLogout}
                      className="navbar-mobile-action-btn logout"
                      variant="text"
                      fullWidth
                      startIcon={<LogOut size={20} />}
                      sx={{
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        color: 'error.main'
                      }}
                    >
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={closeMobileMenu}
                      className="navbar-mobile-action-btn secondary"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={closeMobileMenu}
                      className="navbar-mobile-action-btn primary"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;