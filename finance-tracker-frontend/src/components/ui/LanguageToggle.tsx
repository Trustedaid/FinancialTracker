/**
 * Language Toggle Component for Financial Tracker Application
 * 
 * Features:
 * - Toggle between English (EN) and Turkish (TR)
 * - Animated flag icons with smooth transitions
 * - Accessible design with proper ARIA labels
 * - Glass morphism styling consistent with app design
 * - Keyboard navigation support
 * - Hover effects and visual feedback
 * - Tooltip showing current and next language
 */

import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { IconButton, Tooltip } from '@mui/material';
import { useLanguage } from '../../contexts';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { language, setLanguage, t } = useLanguage();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  const handleToggle = () => {
    const newLanguage = language === 'en' ? 'tr' : 'en';
    setLanguage(newLanguage);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const getCurrentLanguageLabel = () => {
    return language === 'en' ? t('language.english') : t('language.turkish');
  };

  const getNextLanguageLabel = () => {
    return language === 'en' ? t('language.turkish') : t('language.english');
  };

  const tooltipText = `${getCurrentLanguageLabel()} - ${t('common.switch_to')} ${getNextLanguageLabel()}`;

  return (
    <div className={`language-toggle-container ${showLabel ? 'with-label' : ''} ${className}`}>
      <Tooltip title={tooltipText}>
        <IconButton
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`language-toggle ${sizeClasses[size]} ${language}`}
          aria-label={`Switch to ${getNextLanguageLabel()}`}
          aria-pressed={language === 'tr'}
          size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(103, 126, 234, 0.08)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <div className="language-toggle-track">
            <div className={`language-toggle-thumb ${language}`}>
              <div className="language-toggle-icon-container">
                {language === 'en' ? (
                  <div className="language-flag-container">
                    <Languages 
                      size={iconSizes[size]} 
                      className="language-toggle-icon en-icon"
                    />
                    <span className="language-code">EN</span>
                  </div>
                ) : (
                  <div className="language-flag-container">
                    <Globe 
                      size={iconSizes[size]} 
                      className="language-toggle-icon tr-icon"
                    />
                    <span className="language-code">TR</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </IconButton>
      </Tooltip>
      
      {showLabel && (
        <span className="language-toggle-label">
          {getCurrentLanguageLabel()}
        </span>
      )}
    </div>
  );
};

export default LanguageToggle;