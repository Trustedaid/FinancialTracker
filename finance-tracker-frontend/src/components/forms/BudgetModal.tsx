import React, { useState, useEffect } from 'react';
import { X, Check, Target, Calendar } from 'lucide-react';
import { Button, IconButton } from '@mui/material';
import { Input } from '../ui';
import type { BudgetDto, CreateBudgetDto, UpdateBudgetDto, CategoryDto } from '../../types/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgetData: CreateBudgetDto | UpdateBudgetDto) => void;
  budget?: BudgetDto;
  categories: CategoryDto[];
  loading?: boolean;
}

const MONTHS = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' }
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  budget, 
  categories,
  loading = false 
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [formData, setFormData] = useState<CreateBudgetDto>({
    amount: 0,
    month: currentMonth,
    year: currentYear,
    categoryId: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (budget) {
      setFormData({
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        categoryId: budget.categoryId
      });
    } else {
      setFormData({
        amount: 0,
        month: currentMonth,
        year: currentYear,
        categoryId: categories.length > 0 ? categories[0].id : 0
      });
    }
    setErrors({});
  }, [budget, categories, isOpen, currentMonth, currentYear]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Bütçe tutarı 0\'dan büyük olmalıdır';
    } else if (formData.amount > 10000000) {
      newErrors.amount = 'Bütçe tutarı çok yüksek';
    }

    if (formData.categoryId <= 0) {
      newErrors.categoryId = 'Kategori seçimi gereklidir';
    }

    if (formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Geçerli bir ay seçiniz';
    }

    if (formData.year < currentYear - 1 || formData.year > currentYear + 5) {
      newErrors.year = 'Yıl geçmiş 1 yıl ile gelecek 5 yıl arasında olmalıdır';
    }

    // Check if this is not an edit and the selected month/year is in the past
    if (!budget && (formData.year < currentYear || (formData.year === currentYear && formData.month < currentMonth))) {
      newErrors.month = 'Geçmiş aylar için bütçe oluşturamazsınız';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field: keyof CreateBudgetDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === formData.categoryId);
  };

  const generateYearOptions = () => {
    const years = [];
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {budget ? 'Bütçe Düzenle' : 'Yeni Bütçe Oluştur'}
            </h3>
            <IconButton
              onClick={onClose}
              sx={{ color: 'text.secondary' }}
            >
              <X size={20} />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    errors.categoryId ? 'border-danger-300' : ''
                  }`}
                >
                  <option value={0}>Kategori seçiniz</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-danger-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bütçe Tutarı (₺) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                  placeholder="Bütçe tutarını girin"
                  className={errors.amount ? 'border-danger-300' : ''}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>
                )}
              </div>

              {/* Month and Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ay *
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => handleInputChange('month', Number(e.target.value))}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      errors.month ? 'border-danger-300' : ''
                    }`}
                  >
                    {MONTHS.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  {errors.month && (
                    <p className="mt-1 text-sm text-danger-600">{errors.month}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yıl *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', Number(e.target.value))}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      errors.year ? 'border-danger-300' : ''
                    }`}
                  >
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="mt-1 text-sm text-danger-600">{errors.year}</p>
                  )}
                </div>
              </div>

              {/* Preview */}
              {formData.amount > 0 && formData.categoryId > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Önizleme:</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-primary-600" />
                      <div>
                        {getSelectedCategory() && (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getSelectedCategory()?.color }}
                            />
                            <span className="text-sm font-medium">
                              {getSelectedCategory()?.name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>
                            {MONTHS.find(m => m.value === formData.month)?.label} {formData.year}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">
                      {formatCurrency(formData.amount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? undefined : <Check size={16} />}
                sx={{ textTransform: 'none' }}
              >
                {loading ? 'Yükleniyor...' : (budget ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;