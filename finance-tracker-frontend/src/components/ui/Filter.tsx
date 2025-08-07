import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Filter as FilterIcon, X, ChevronDown, Calendar, DollarSign } from 'lucide-react';
import { Button, IconButton } from '@mui/material';
import { Input } from './Input';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';

export interface FilterOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  min?: number;
  max?: number;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
  collapsible?: boolean;
  showActiveCount?: boolean;
  variant?: 'default' | 'compact' | 'card';
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  className,
  collapsible = true,
  showActiveCount = true,
  variant = 'default'
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const activeFiltersCount = Object.values(values).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-indigo-600/3 to-purple-600/3 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    {filter.icon && (
                      <div className="w-4 h-4 text-white">
                        {filter.icon}
                      </div>
                    )}
                  </div>
                  <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                    {filter.label}
                  </span>
                </div>
              </label>
              <select
                value={value || ''}
                onChange={(e) => onChange(filter.key, e.target.value || undefined)}
                className="w-full rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-inner focus:shadow-lg focus:bg-white transition-all duration-300 text-gray-800 font-medium px-4 py-3 focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">{filter.placeholder || `Tüm ${filter.label}`}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {option.count !== undefined && ` (${option.count})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                {filter.icon}
                {filter.label}
              </div>
            </label>
            <div className="space-y-2">
              {filter.options?.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        onChange(filter.key, newValues.length > 0 ? newValues : undefined);
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      {option.icon}
                      {option.label}
                      {option.count !== undefined && (
                        <Badge variant="secondary" size="sm">{option.count}</Badge>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                {filter.icon || <Calendar size={16} />}
                {filter.label}
              </div>
            </label>
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(filter.key, e.target.value || undefined)}
              placeholder={filter.placeholder}
            />
          </div>
        );

      case 'daterange':
        return (
          <div key={filter.key} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-indigo-600/3 to-purple-600/3 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    {filter.icon ? (
                      <div className="w-4 h-4 text-white">
                        {filter.icon}
                      </div>
                    ) : (
                      <Calendar className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                    {filter.label}
                  </span>
                </div>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Başlangıç</label>
                  <Input
                    type="date"
                    value={value?.start || ''}
                    onChange={(e) => onChange(filter.key, { 
                      ...value, 
                      start: e.target.value || undefined 
                    })}
                    placeholder="Start date"
                    className="rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-inner focus:shadow-lg focus:bg-white transition-all duration-300 text-gray-800 font-medium"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Bitiş</label>
                  <Input
                    type="date"
                    value={value?.end || ''}
                    onChange={(e) => onChange(filter.key, { 
                      ...value, 
                      end: e.target.value || undefined 
                    })}
                    placeholder="End date"
                    className="rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-inner focus:shadow-lg focus:bg-white transition-all duration-300 text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                {filter.icon || <DollarSign size={16} />}
                {filter.label}
              </div>
            </label>
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
              placeholder={filter.placeholder}
              min={filter.min}
              max={filter.max}
            />
          </div>
        );

      case 'search':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                {filter.icon}
                {filter.label}
              </div>
            </label>
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(filter.key, e.target.value || undefined)}
              placeholder={filter.placeholder}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (variant === 'card') {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl blur-lg"></div>
        <Card className={clsx('relative mb-6 bg-white/80 backdrop-blur-md border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden border-0', className)}>
          <CardHeader className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 backdrop-blur-sm border-b border-white/40 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <FilterIcon size={20} className="text-white" />
                </div>
                Filters
                {showActiveCount && activeFiltersCount > 0 && (
                  <div className="relative">
                    <Badge variant="primary" size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg animate-pulse">
                      {activeFiltersCount}
                    </Badge>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
                  </div>
                )}
              </CardTitle>
              {collapsible && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  endIcon={
                    <ChevronDown 
                      size={16} 
                      className={clsx('transition-transform duration-300', isExpanded && 'rotate-180')} 
                    />
                  }
                  sx={{ textTransform: 'none' }}
                >
                  {isExpanded ? 'Gizle' : 'Göster'}
                </Button>
              )}
            </div>
          </CardHeader>
          {isExpanded && (
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filters.map(renderFilter)}
              </div>
              {activeFiltersCount > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-3">
                      <span className="text-sm font-semibold text-gray-700 mb-2 sm:mb-0">Aktif Filtreler:</span>
                      {Object.entries(values)
                        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                        .map(([key, value]) => {
                          const filter = filters.find(f => f.key === key);
                          return (
                            <div key={key} className="relative group">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-800 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 flex items-center gap-2 pl-3 pr-8 py-2 rounded-xl shadow-sm hover:shadow-md transform hover:scale-105"
                              >
                                <span className="font-medium">{filter?.label}:</span>
                                <span className="text-blue-700">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                <IconButton
                                  onClick={() => onChange(key, undefined)}
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    right: 4,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'error.main',
                                      backgroundColor: 'error.light'
                                    }
                                  }}
                                >
                                  <X size={12} />
                                </IconButton>
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={onClear}
                      startIcon={<X size={14} />}
                      sx={{ textTransform: 'none' }}
                    >
                      Tümünü Temizle
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FilterIcon size={20} />
          Filters
          {showActiveCount && activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFiltersCount}
            </Badge>
          )}
        </h3>
        {collapsible && (
          <Button
            variant="text"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            endIcon={
              <ChevronDown 
                size={16} 
                className={clsx('transition-transform duration-200', isExpanded && 'rotate-180')} 
              />
            }
            sx={{ textTransform: 'none' }}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map(renderFilter)}
          </div>
          
          {activeFiltersCount > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outlined"
                size="small"
                color="warning"
                onClick={onClear}
                startIcon={<X size={14} />}
                sx={{ textTransform: 'none' }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { FilterBar };