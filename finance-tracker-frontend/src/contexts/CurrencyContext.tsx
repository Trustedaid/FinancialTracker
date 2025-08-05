import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Supported currencies
export type Currency = 'TRY' | 'USD' | 'EUR';

// Currency information
export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string; // Flag emoji or icon
}

// Currency context type
export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencyInfo: CurrencyInfo;
  formatAmount: (amount: number) => string;
  getCurrencyInfo: (currency: Currency) => CurrencyInfo;
}

// Currency configurations
const currencyConfigs: Record<Currency, CurrencyInfo> = {
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    flag: '🇹🇷'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺'
  }
};

// Create the currency context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// CurrencyProvider props
interface CurrencyProviderProps {
  children: ReactNode;
}

// CurrencyProvider component
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('TRY'); // Default to Turkish Lira

  // Initialize currency from localStorage on app load
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && currencyConfigs[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Set currency and persist to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  // Get current currency info
  const currencyInfo = currencyConfigs[currency];

  // Get currency info for any currency
  const getCurrencyInfo = (currencyCode: Currency): CurrencyInfo => {
    return currencyConfigs[currencyCode];
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number): string => {
    const formattedNumber = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    // For Turkish Lira, symbol comes after the number
    if (currency === 'TRY') {
      return `${formattedNumber} ${currencyInfo.symbol}`;
    }
    
    // For USD and EUR, symbol comes before the number
    return `${currencyInfo.symbol}${formattedNumber}`;
  };

  // Context value
  const value: CurrencyContextType = {
    currency,
    setCurrency,
    currencyInfo,
    formatAmount,
    getCurrencyInfo,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  
  return context;
};