import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button, Input } from '../ui';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../types/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CreateCategoryDto | UpdateCategoryDto) => void;
  category?: CategoryDto;
  loading?: boolean;
}

const PREDEFINED_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
  '#DC2626', // Red-600
  '#EA580C', // Orange-600
  '#CA8A04', // Yellow-600
  '#16A34A', // Green-600
  '#0891B2', // Cyan-600
  '#2563EB', // Blue-600
  '#7C3AED', // Purple-600
  '#DB2777', // Pink-600
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    color: PREDEFINED_COLORS[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: PREDEFINED_COLORS[0]
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kategori adı en az 2 karakter olmalıdır';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Kategori adı en fazla 50 karakter olmalıdır';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Açıklama en fazla 200 karakter olmalıdır';
    }

    if (!formData.color) {
      newErrors.color = 'Renk seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      color: formData.color
    };

    onSave(categoryData);
  };

  const handleInputChange = (field: keyof CreateCategoryDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
              {category ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
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
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Kategori adını girin"
                  className={errors.name ? 'border-danger-300' : ''}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Kategori açıklaması"
                  rows={3}
                  maxLength={200}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    errors.description ? 'border-danger-300' : ''
                  }`}
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {formData.description?.length || 0}/200
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renk *
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all
                        ${formData.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Özel renk seç:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.color.toUpperCase()}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-danger-600">{errors.color}</p>
                )}
              </div>

              {/* Preview */}
              {formData.name && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Önizleme:</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-sm font-medium">{formData.name}</span>
                  </div>
                  {formData.description && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      {formData.description}
                    </p>
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
                {category ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;