import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts';
import type { LoginRequest } from '../../types/auth';
import type { ApiError } from '../../types/api';

// Dynamic validation schema - will be created inside component
const createLoginSchema = (t: (key: string) => string) => yup.object({
  email: yup
    .string()
    .required(t('auth.validation.email_required'))
    .email(t('auth.validation.email_invalid')),
  password: yup
    .string()
    .required(t('auth.validation.password_required'))
    .min(6, t('auth.validation.password_min')),
  rememberMe: yup.boolean().default(false),
}).required();

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: yupResolver(createLoginSchema(t)),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError('');
      
      // Handle remember me functionality (store in localStorage)
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      await onSubmit({ email: data.email, password: data.password });
    } catch (error) {
      const apiError = error as ApiError;
      
      if (apiError.errors) {
        // Set field-specific errors
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          setError(field as keyof LoginFormData, {
            type: 'server',
            message: messages[0],
          });
        });
      } else {
        // Set general error
        setSubmitError(apiError.message || t('auth.validation.login_error'));
      }
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {submitError && (
        <div className="error-message">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

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
          style={{ paddingRight: watchedEmail ? '3rem' : '1rem' }}
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
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        <Lock className="input-icon" size={20} />
        {watchedPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
            aria-label={showPassword ? t('auth.password_hide') : t('auth.password_show')}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {errors.password && (
          <div id="password-error" className="field-error">
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="remember-forgot-container">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="rememberMe"
            className="enhanced-checkbox"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
            {t('auth.remember_me')}
          </label>
        </div>
        <a href="#" className="forgot-password text-sm">
          {t('auth.forgot_password')}
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="enhanced-login-btn"
        disabled={isLoading}
        aria-label={isLoading ? t('auth.signing_in') : t('auth.sign_in')}
      >
        {isLoading ? (
          <>
            <Loader2 className="loading-spinner" size={20} />
            {t('auth.signing_in')}
          </>
        ) : (
          t('auth.sign_in')
        )}
      </button>
    </form>
  );
};