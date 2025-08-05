import React, { useState, useEffect } from 'react';
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { Button, Input } from '../ui';
import type { TransactionDto, CreateTransactionDto, UpdateTransactionDto, CategoryDto, TransactionType } from '../../types/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: CreateTransactionDto | UpdateTransactionDto) => void;
  transaction?: TransactionDto;
  categories: CategoryDto[];
  loading?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction, 
  categories,
  loading = false 
}) => {
  const [formData, setFormData] = useState<CreateTransactionDto>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 2, // Default to expense
    categoryId: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.split('T')[0], // Convert to YYYY-MM-DD format
        type: transaction.type,
        categoryId: transaction.categoryId
      });
    } else {
      setFormData({
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 2, // Default to expense
        categoryId: categories.length > 0 ? categories[0].id : 0
      });
    }
    setErrors({});
  }, [transaction, categories, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Tutar 0\'dan büyük olmalıdır';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gereklidir';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Açıklama en az 3 karakter olmalıdır';
    }

    if (!formData.date) {
      newErrors.date = 'Tarih seçimi gereklidir';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (selectedDate < oneYearAgo || selectedDate > oneYearFromNow) {
        newErrors.date = 'Tarih son 1 yıl ile gelecek 1 yıl arasında olmalıdır';
      }
    }

    if (formData.categoryId <= 0) {
      newErrors.categoryId = 'Kategori seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert date to ISO string with current time
    const transactionData = {
      ...formData,
      date: new Date(formData.date + 'T12:00:00').toISOString()
    };

    onSave(transactionData);
  };

  const handleInputChange = (field: keyof CreateTransactionDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ ...prev, type }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {transaction ? 'İşlem Düzenle' : 'Yeni İşlem Ekle'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Türü *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(1)}
                    className={`
                      flex items-center justify-center p-3 rounded-md border transition-colors
                      ${formData.type === 1
                        ? 'border-success-300 bg-success-50 text-success-700'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <TrendingUp size={16} className="mr-2" />
                    Gelir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange(2)}
                    className={`
                      flex items-center justify-center p-3 rounded-md border transition-colors
                      ${formData.type === 2
                        ? 'border-danger-300 bg-danger-50 text-danger-700'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <TrendingDown size={16} className="mr-2" />
                    Gider
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutar (₺) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                  placeholder="İşlem tutarını girin"
                  className={errors.amount ? 'border-danger-300' : ''}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="İşlem açıklaması"
                  className={errors.description ? 'border-danger-300' : ''}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-danger-300' : ''}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-danger-600">{errors.date}</p>
                )}
              </div>

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

              {/* Preview */}
              {formData.amount > 0 && formData.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-700">
                    <strong>Önizleme:</strong>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      {formData.type === 1 ? (
                        <TrendingUp className="w-4 h-4 text-success-600 mr-2" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-danger-600 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {formData.description}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      formData.type === 1 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(formData.amount)}
                    </span>
                  </div>
                  {formData.date && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(formData.date).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                leftIcon={<Check size={16} />}
              >
                {transaction ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;