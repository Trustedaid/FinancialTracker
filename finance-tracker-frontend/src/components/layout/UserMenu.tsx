/**
 * User Menu Component for Financial Tracker Application
 * 
 * Features:
 * - Glass morphism dropdown with backdrop blur
 * - Profile section with user information
 * - Language selection (English/Turkish)
 * - Currency selection (TL/USD/EUR)
 * - Logout functionality
 * - Keyboard navigation and accessibility support
 * - Smooth animations and hover effects
 * - Consistent with existing purple/blue gradient theme
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Settings, 
  Globe, 
  DollarSign, 
  ChevronDown,
  Check,
  Palette
} from 'lucide-react';
import { useAuth, useLanguage, useCurrency, useTheme } from '../../contexts';
import { ThemeToggle } from '../ui';
import type { Language } from '../../contexts/LanguageContext';
import type { Currency } from '../../contexts/CurrencyContext';

interface UserMenuProps {
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, getCurrencyInfo } = useCurrency();
  const { theme } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setActiveSubmenu(null);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          // Focus next menu item logic can be added here
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Focus previous menu item logic can be added here
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          // Handle selection logic can be added here
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    setActiveSubmenu(null);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setActiveSubmenu(null);
    setIsOpen(false);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setActiveSubmenu(null);
    setIsOpen(false);
  };

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'tr', name: t('language.turkish'), flag: '🇹🇷' }
  ];

  const currencies: Currency[] = ['TRY', 'USD', 'EUR'];

  if (!user) {
    return null;
  }

  return (
    <div className={`user-menu ${className}`}>
      {/* User Avatar Button */}
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        className="user-menu-trigger"
        aria-label={t('userMenu.profile')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="user-avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <span className="user-name">
            {user.firstName} {user.lastName}
          </span>
          <span className="user-email">{user.email}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`chevron-icon ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="user-menu-dropdown"
          role="menu"
          aria-label={t('userMenu.profile')}
        >
          {/* Profile Section */}
          <div className="menu-section">
            <div className="menu-section-header">
              <User size={16} />
              <span>{t('userMenu.account')}</span>
            </div>
            <div className="user-details">
              <div className="user-name-full">
                {user.firstName} {user.lastName}
              </div>
              <div className="user-email-full">{user.email}</div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="menu-section">
            <div className="menu-section-header">
              <Settings size={16} />
              <span>{t('userMenu.preferences')}</span>
            </div>

            {/* Language Selection */}
            <div className="menu-item">
              <button
                onClick={() => toggleSubmenu('language')}
                className="menu-item-button"
                aria-expanded={activeSubmenu === 'language'}
              >
                <Globe size={16} />
                <span>{t('userMenu.language')}</span>
                <ChevronDown 
                  size={14} 
                  className={`submenu-chevron ${activeSubmenu === 'language' ? 'rotated' : ''}`}
                />
              </button>
              
              {activeSubmenu === 'language' && (
                <div className="submenu" role="menu">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`submenu-item ${language === lang.code ? 'active' : ''}`}
                      role="menuitem"
                    >
                      <span className="flag">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {language === lang.code && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selection */}
            <div className="menu-item">
              <button
                onClick={() => toggleSubmenu('currency')}
                className="menu-item-button"
                aria-expanded={activeSubmenu === 'currency'}
              >
                <DollarSign size={16} />
                <span>{t('userMenu.currency')}</span>
                <ChevronDown 
                  size={14} 
                  className={`submenu-chevron ${activeSubmenu === 'currency' ? 'rotated' : ''}`}
                />
              </button>
              
              {activeSubmenu === 'currency' && (
                <div className="submenu" role="menu">
                  {currencies.map((curr) => {
                    const currInfo = getCurrencyInfo(curr);
                    return (
                      <button
                        key={curr}
                        onClick={() => handleCurrencyChange(curr)}
                        className={`submenu-item ${currency === curr ? 'active' : ''}`}
                        role="menuitem"
                      >
                        <span className="flag">{currInfo.flag}</span>
                        <span>{currInfo.name} ({currInfo.symbol})</span>
                        {currency === curr && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Theme Selection */}
            <div className="menu-item">
              <div className="menu-item-button theme-selector">
                <Palette size={16} />
                <span>Theme</span>
                <div className="theme-toggle-wrapper">
                  <ThemeToggle size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="menu-section menu-section-logout">
            <button
              onClick={handleLogout}
              className="menu-item-button logout-button"
              role="menuitem"
            >
              <LogOut size={16} />
              <span>{t('userMenu.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;