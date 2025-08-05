import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts';
import type { RegisterRequest, ApiError } from '../../types';

// Dynamic validation schema - will be created inside component
const createRegisterSchema = (t: (key: string) => string) => yup.object({
  firstName: yup
    .string()
    .required(t('auth.validation.first_name_required'))
    .min(2, t('auth.validation.first_name_min'))
    .max(50, t('auth.validation.first_name_max')),
  lastName: yup
    .string()
    .required(t('auth.validation.last_name_required'))
    .min(2, t('auth.validation.last_name_min'))
    .max(50, t('auth.validation.last_name_max')),
  email: yup
    .string()
    .required(t('auth.validation.email_required'))
    .email(t('auth.validation.email_invalid')),
  password: yup
    .string()
    .required(t('auth.validation.password_required'))
    .min(6, t('auth.validation.password_min'))
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      t('auth.validation.password_pattern')
    ),
  confirmPassword: yup
    .string()
    .required(t('auth.validation.confirm_password_required'))
    .oneOf([yup.ref('password')], t('auth.validation.passwords_no_match')),
});

interface RegisterFormProps {
  onSubmit: (data: RegisterRequest) => Promise<void>;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterRequest>({
    resolver: yupResolver(createRegisterSchema(t)),
    mode: 'onBlur',
  });

  const handleFormSubmit = async (data: RegisterRequest) => {
    try {
      setSubmitError('');
      await onSubmit(data);
    } catch (error) {
      const apiError = error as ApiError;
      
      if (apiError.errors) {
        // Set field-specific errors
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          const fieldName = field.charAt(0).toLowerCase() + field.slice(1); // Convert to camelCase
          setError(fieldName as keyof RegisterRequest, {
            type: 'server',
            message: messages[0],
          });
        });
      } else {
        // Set general error
        setSubmitError(apiError.message || t('auth.validation.register_error'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {submitError && (
        <div className="error-message">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      {/* Name Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* First Name Input */}
        <div className="enhanced-input-group">
          <input
            type="text"
            placeholder={t('auth.first_name_placeholder')}
            className={`enhanced-input ${errors.firstName ? 'error' : ''}`}
            {...register('firstName')}
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          <User className="input-icon" size={20} />
          {errors.firstName && (
            <div id="firstName-error" className="field-error">
              {errors.firstName.message}
            </div>
          )}
        </div>

        {/* Last Name Input */}
        <div className="enhanced-input-group">
          <input
            type="text"
            placeholder={t('auth.last_name_placeholder')}
            className={`enhanced-input ${errors.lastName ? 'error' : ''}`}
            {...register('lastName')}
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          <User className="input-icon" size={20} />
          {errors.lastName && (
            <div id="lastName-error" className="field-error">
              {errors.lastName.message}
            </div>
          )}
        </div>
      </div>

      {/* Email Input */}
      <div className="enhanced-input-group">
        <input
          type="email"
          placeholder={t('auth.email_placeholder')}
          className={`enhanced-input ${errors.email ? 'error' : ''}`}
          {...register('email')}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        <Mail className="input-icon" size={20} />
        {errors.email && (
          <div id="email-error" className="field-error">
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Password Input */}
      <div className="enhanced-input-group">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.password_placeholder')}
          className={`enhanced-input ${errors.password ? 'error' : ''}`}
          {...register('password')}
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        <Lock className="input-icon" size={20} />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle"
          aria-label={showPassword ? t('auth.password_hide') : t('auth.password_show')}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && (
          <div id="password-error" className="field-error">
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="enhanced-input-group">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('auth.confirm_password_placeholder')}
          className={`enhanced-input ${errors.confirmPassword ? 'error' : ''}`}
          {...register('confirmPassword')}
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        <Lock className="input-icon" size={20} />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="password-toggle"
          aria-label={showConfirmPassword ? t('auth.password_hide') : t('auth.password_show')}
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.confirmPassword && (
          <div id="confirmPassword-error" className="field-error">
            {errors.confirmPassword.message}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="enhanced-login-btn"
        disabled={isLoading}
        aria-label={isLoading ? t('auth.signing_up') : t('auth.sign_up')}
      >
        {isLoading ? (
          <>
            <Loader2 className="loading-spinner" size={20} />
            {t('auth.signing_up')}
          </>
        ) : (
          t('auth.sign_up')
        )}
      </button>
    </form>
  );
};