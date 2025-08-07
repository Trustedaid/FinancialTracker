import React, { forwardRef, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string | string[];
  success?: string;
  helpText?: string;
  variant?: 'default' | 'filled' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isTextarea?: boolean;
  rows?: number;
  showPasswordToggle?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  validator?: (value: string) => string | null;
  debounceMs?: number;
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(({
  label,
  error,
  success,
  helpText,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  isTextarea = false,
  rows = 3,
  showPasswordToggle = false,
  validateOnBlur = true,
  validateOnChange = false,
  validator,
  debounceMs = 300,
  className,
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const finalError = error || localError;
  const hasError = !!finalError;
  const hasSuccess = !!success && !hasError;
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  // Input type handling for password toggle
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default: `border rounded-lg ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : hasSuccess 
      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    } bg-white dark:bg-gray-800 dark:border-gray-600`,
    filled: `border-0 rounded-lg ${hasError 
      ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/20 dark:focus:bg-red-900/30' 
      : hasSuccess 
      ? 'bg-green-50 focus:bg-green-100 dark:bg-green-900/20 dark:focus:bg-green-900/30'
      : 'bg-gray-100 focus:bg-gray-200 dark:bg-gray-700 dark:focus:bg-gray-600'
    }`,
    underline: `border-0 border-b-2 rounded-none ${hasError 
      ? 'border-red-300 focus:border-red-500' 
      : hasSuccess 
      ? 'border-green-300 focus:border-green-500'
      : 'border-gray-300 focus:border-blue-500'
    } bg-transparent`,
  };

  const validateField = async (value: string) => {
    if (!validator) return;

    setIsValidating(true);
    
    try {
      const validationResult = await validator(value);
      setLocalError(validationResult);
    } catch (err) {
      setLocalError('Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    props.onChange?.(e);

    if (validateOnChange && validator) {
      // Clear previous timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Set new timeout for debounced validation
      const timeout = setTimeout(() => {
        validateField(value);
      }, debounceMs);

      setDebounceTimeout(timeout);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    props.onBlur?.(e);

    if (validateOnBlur && validator) {
      validateField(e.target.value);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    props.onFocus?.(e);
    // Clear error on focus to provide immediate feedback
    if (localError) {
      setLocalError(null);
    }
  };

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    const positionClasses = position === 'left' 
      ? 'left-3' 
      : 'right-3';

    return (
      <div className={`absolute ${positionClasses} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none`}>
        {icon}
      </div>
    );
  };

  const renderPasswordToggle = () => {
    if (!showPasswordToggle || type !== 'password') return null;

    return (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    );
  };

  const renderStatusIcon = () => {
    if (isValidating) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
        </div>
      );
    }

    if (hasError) {
      return renderIcon(<AlertCircle className="h-4 w-4 text-red-500" />, 'right');
    }

    if (hasSuccess) {
      return renderIcon(<CheckCircle className="h-4 w-4 text-green-500" />, 'right');
    }

    return null;
  };

  const inputClasses = cn(
    'w-full outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500',
    sizeClasses[size],
    variantClasses[variant],
    leftIcon && 'pl-10',
    (rightIcon || hasError || hasSuccess || showPasswordToggle || isValidating) && 'pr-10',
    className
  );

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium',
            hasError ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <InputComponent
          ref={ref as any}
          id={fieldId}
          type={inputType}
          className={inputClasses}
          rows={isTextarea ? rows : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          aria-invalid={hasError}
          aria-describedby={
            [
              finalError && `${fieldId}-error`,
              success && `${fieldId}-success`,
              helpText && `${fieldId}-help`,
            ]
            .filter(Boolean)
            .join(' ') || undefined
          }
          {...props}
        />

        {leftIcon && renderIcon(leftIcon, 'left')}
        {showPasswordToggle && renderPasswordToggle()}
        {!showPasswordToggle && (rightIcon || renderStatusIcon())}
      </div>

      {/* Error Messages */}
      {finalError && (
        <div id={`${fieldId}-error`} className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            {Array.isArray(finalError) ? (
              <ul className="list-disc list-inside space-y-1">
                {finalError.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            ) : (
              <span>{finalError}</span>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && !hasError && (
        <div id={`${fieldId}-success`} className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && !success && (
        <p id={`${fieldId}-help`} className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;