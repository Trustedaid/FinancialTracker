import { useState, useCallback, useRef } from 'react';
import { toast } from '../components/ui/Toast';

export interface ValidationRule<T = any> {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  email?: boolean | string;
  url?: boolean | string;
  custom?: (value: T) => string | null | Promise<string | null>;
  depends?: string[]; // Field dependencies for conditional validation
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

export interface FormErrors {
  [fieldName: string]: string | string[] | null;
}

export interface FormTouched {
  [fieldName: string]: boolean;
}

export interface FormState<T = any> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}

export interface FormConfig<T = any> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  revalidateOnChange?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
  onValidationError?: (errors: FormErrors) => void;
}

export const useFormValidation = <T extends Record<string, any>>(config: FormConfig<T>) => {
  const {
    initialValues,
    validationSchema = {},
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
    revalidateOnChange = true,
    onSubmit,
    onValidationError,
  } = config;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const validateField = useCallback(
    async (fieldName: keyof T, value: any, allValues: T = state.values): Promise<string | null> => {
      const rule = validationSchema[fieldName as string];
      if (!rule) return null;

      // Check dependencies first
      if (rule.depends) {
        const dependencyMet = rule.depends.every(dep => {
          const depValue = allValues[dep as keyof T];
          return depValue !== undefined && depValue !== null && depValue !== '';
        });
        if (!dependencyMet) {
          return null; // Skip validation if dependencies are not met
        }
      }

      // Required validation
      if (rule.required) {
        const isEmpty = value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0);
        
        if (isEmpty) {
          return typeof rule.required === 'string' ? rule.required : `${String(fieldName)} is required`;
        }
      }

      // Skip further validation if field is empty and not required
      if (value === undefined || value === null || value === '') {
        return null;
      }

      // String-based validations
      if (typeof value === 'string') {
        // Email validation
        if (rule.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return typeof rule.email === 'string' ? rule.email : 'Please enter a valid email address';
          }
        }

        // URL validation
        if (rule.url) {
          try {
            new URL(value);
          } catch {
            return typeof rule.url === 'string' ? rule.url : 'Please enter a valid URL';
          }
        }

        // Pattern validation
        if (rule.pattern) {
          const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
          if (!regex.test(value)) {
            return `${String(fieldName)} format is invalid`;
          }
        }

        // Length validations
        if (rule.minLength !== undefined) {
          const minLength = typeof rule.minLength === 'string' ? parseInt(rule.minLength) : rule.minLength;
          if (value.length < minLength) {
            return typeof rule.minLength === 'string' && rule.minLength.includes('must') 
              ? rule.minLength 
              : `${String(fieldName)} must be at least ${minLength} characters`;
          }
        }

        if (rule.maxLength !== undefined) {
          const maxLength = typeof rule.maxLength === 'string' ? parseInt(rule.maxLength) : rule.maxLength;
          if (value.length > maxLength) {
            return typeof rule.maxLength === 'string' && rule.maxLength.includes('must') 
              ? rule.maxLength 
              : `${String(fieldName)} must be no more than ${maxLength} characters`;
          }
        }
      }

      // Numeric validations
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = typeof value === 'number' ? value : Number(value);

        if (rule.min !== undefined) {
          const min = typeof rule.min === 'string' ? parseFloat(rule.min) : rule.min;
          if (numValue < min) {
            return typeof rule.min === 'string' && rule.min.includes('must') 
              ? rule.min 
              : `${String(fieldName)} must be at least ${min}`;
          }
        }

        if (rule.max !== undefined) {
          const max = typeof rule.max === 'string' ? parseFloat(rule.max) : rule.max;
          if (numValue > max) {
            return typeof rule.max === 'string' && rule.max.includes('must') 
              ? rule.max 
              : `${String(fieldName)} must be no more than ${max}`;
          }
        }
      }

      // Custom validation
      if (rule.custom) {
        try {
          return await rule.custom(value);
        } catch (error) {
          console.error(`Custom validation error for ${String(fieldName)}:`, error);
          return 'Validation error occurred';
        }
      }

      return null;
    },
    [validationSchema, state.values]
  );

  const validateForm = useCallback(
    async (values: T = state.values): Promise<FormErrors> => {
      const errors: FormErrors = {};
      
      setState(prev => ({ ...prev, isValidating: true }));

      try {
        const validationPromises = Object.keys(validationSchema).map(async (fieldName) => {
          const error = await validateField(fieldName as keyof T, values[fieldName as keyof T], values);
          return { fieldName, error };
        });

        const results = await Promise.all(validationPromises);
        
        results.forEach(({ fieldName, error }) => {
          if (error) {
            errors[fieldName] = error;
          }
        });
      } finally {
        setState(prev => ({ ...prev, isValidating: false }));
      }

      return errors;
    },
    [validationSchema, validateField, state.values]
  );

  const setFieldValue = useCallback(
    (fieldName: keyof T, value: any, shouldValidate = validateOnChange) => {
      setState(prev => ({
        ...prev,
        values: {
          ...prev.values,
          [fieldName]: value,
        },
      }));

      if (shouldValidate || (revalidateOnChange && state.errors[fieldName as string])) {
        // Clear previous timeout
        if (validationTimeouts.current[fieldName as string]) {
          clearTimeout(validationTimeouts.current[fieldName as string]);
        }

        // Debounce validation
        validationTimeouts.current[fieldName as string] = setTimeout(async () => {
          const error = await validateField(fieldName, value);
          setState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              [fieldName]: error,
            },
          }));
        }, 300);
      }
    },
    [validateOnChange, revalidateOnChange, state.errors, validateField]
  );

  const setFieldTouched = useCallback((fieldName: keyof T, isTouched = true) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: isTouched,
      },
    }));
  }, []);

  const setFieldError = useCallback((fieldName: keyof T, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: error,
      },
    }));
  }, []);

  const handleFieldBlur = useCallback(
    async (fieldName: keyof T) => {
      setFieldTouched(fieldName, true);

      if (validateOnBlur) {
        const error = await validateField(fieldName, state.values[fieldName]);
        setFieldError(fieldName, error);
      }
    },
    [validateOnBlur, state.values, validateField, setFieldTouched, setFieldError]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      setState(prev => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
      }));

      try {
        let errors: FormErrors = {};

        if (validateOnSubmit) {
          errors = await validateForm();
        }

        const hasErrors = Object.values(errors).some(error => error !== null && error !== '');

        if (hasErrors) {
          setState(prev => ({
            ...prev,
            errors,
            touched: Object.keys(validationSchema).reduce(
              (acc, key) => ({ ...acc, [key]: true }),
              prev.touched
            ),
          }));

          onValidationError?.(errors);

          // Show error toast with details
          const errorCount = Object.values(errors).filter(error => error).length;
          toast.error(`Please fix ${errorCount} error${errorCount === 1 ? '' : 's'} before submitting`);

          return;
        }

        // Clear any existing errors
        setState(prev => ({
          ...prev,
          errors: {},
        }));

        // Call onSubmit
        if (onSubmit) {
          await onSubmit(state.values);
          toast.success('Form submitted successfully!');
        }

      } catch (error: any) {
        console.error('Form submission error:', error);
        
        // Handle API validation errors
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          setState(prev => ({
            ...prev,
            errors: apiErrors,
          }));
        } else {
          toast.error(error.message || 'An error occurred while submitting the form');
        }
      } finally {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    },
    [validateOnSubmit, validateForm, onSubmit, onValidationError, state.values, validationSchema]
  );

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
    });

    // Clear any pending validation timeouts
    Object.values(validationTimeouts.current).forEach(clearTimeout);
    validationTimeouts.current = {};
  }, [initialValues]);

  const isFieldInvalid = useCallback((fieldName: keyof T) => {
    return !!(state.touched[fieldName as string] && state.errors[fieldName as string]);
  }, [state.touched, state.errors]);

  const getFieldProps = useCallback((fieldName: keyof T) => {
    return {
      value: state.values[fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFieldValue(fieldName, e.target.value);
      },
      onBlur: () => handleFieldBlur(fieldName),
      error: isFieldInvalid(fieldName) ? state.errors[fieldName as string] : undefined,
    };
  }, [state.values, state.errors, setFieldValue, handleFieldBlur, isFieldInvalid]);

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    submitCount: state.submitCount,

    // Actions
    setFieldValue,
    setFieldTouched,
    setFieldError,
    handleSubmit,
    reset,
    validateForm,
    validateField,

    // Helpers
    isFieldInvalid,
    getFieldProps,
    isValid: Object.keys(state.errors).length === 0,
    isDirty: JSON.stringify(state.values) !== JSON.stringify(initialValues),
  };
};

// Pre-defined validation rules
export const validationRules = {
  required: { required: true },
  email: { required: true, email: true },
  password: { 
    required: true, 
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      return null;
    }
  },
  phone: { 
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: string) => {
      if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  positiveNumber: { 
    min: 0.01,
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Must be a positive number';
      return null;
    }
  },
  currency: {
    pattern: /^\d+(\.\d{1,2})?$/,
    custom: (value: string) => {
      if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
        return 'Please enter a valid amount (e.g., 10.50)';
      }
      return null;
    }
  },
};

export default useFormValidation;