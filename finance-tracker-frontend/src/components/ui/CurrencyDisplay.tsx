import React from 'react';
import { useCurrency, type Currency } from '../../contexts/CurrencyContext';

interface CurrencyDisplayProps {
  amount: number;
  fromCurrency?: Currency;
  className?: string;
  showPositiveSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  fromCurrency = 'TRY',
  className = '',
  showPositiveSign = false,
  size = 'md',
}) => {
  const { formatAmount } = useCurrency();

  // For now, we'll assume all amounts are in the user's preferred currency
  // In the future, this could include currency conversion logic
  const formattedAmount = formatAmount(Math.abs(amount));

  // Determine color based on amount
  const getAmountColor = () => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  // Handle positive/negative display
  const displayText = amount === 0 ? formattedAmount :
    amount > 0 ? (showPositiveSign ? `+${formattedAmount}` : formattedAmount) :
    `-${formattedAmount}`;

  return (
    <span 
      className={`${sizeClasses[size]} ${getAmountColor()} ${className}`}
      title={`${amount} ${fromCurrency} (original)`}
    >
      {displayText}
    </span>
  );
};

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  currency?: Currency;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder,
  disabled = false,
  currency,
}) => {
  const { currencyInfo, formatAmount } = useCurrency();

  const currencySymbol = currencyInfo.symbol;
  const [inputValue, setInputValue] = React.useState(value ? formatAmount(value) : '');

  React.useEffect(() => {
    setInputValue(value ? formatAmount(value) : '');
  }, [value, currency, formatAmount]);

  const parseAmount = (valueStr: string): number => {
    // Remove currency symbols and non-numeric characters except decimal separators
    const cleanValue = valueStr
      .replace(/[₺$€]/g, '')
      .replace(/\s/g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.-]/g, '');
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsed = parseAmount(newValue);
    onChange(parsed);
  };

  const handleBlur = () => {
    // Reformat the input value on blur for consistency
    if (value) {
      setInputValue(formatAmount(value));
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 text-sm font-medium">
          {currencySymbol}
        </span>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          w-full pl-8 pr-3 py-2 
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          disabled:bg-gray-100 disabled:text-gray-500
          ${className}
        `}
        placeholder={placeholder || `0.00`}
        disabled={disabled}
      />
    </div>
  );
};