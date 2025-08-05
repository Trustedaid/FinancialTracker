import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen,
  X,
  Check
} from 'lucide-react';
import { 
  Button, 
  Input,
  Badge
} from '../../components/ui';
import { categoryService } from '../../services';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../types/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CreateCategoryDto | UpdateCategoryDto) => void;
  category?: CategoryDto;
  loading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    color: '#3B82F6'
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
        color: '#3B82F6'
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

    onSave(formData);
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
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {category ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori Adı *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Kategori adını girin"
                  className={errors.name ? 'border-danger-300' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Kategori açıklaması (isteğe bağlı)"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renk *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="#000000"
                    className={`flex-1 ${errors.color ? 'border-danger-300' : ''}`}
                  />
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-danger-600">{errors.color}</p>
                )}
              </div>

              {/* Color Preview */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.name || 'Kategori Adı'} - Renk Önizleme
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200"
              >
                İptal
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                leftIcon={<Check size={16} />}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all duration-200"
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

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getCategories();
      
      if (response.data) {
        setCategories(response.data);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: CreateCategoryDto) => {
    try {
      setModalLoading(true);
      
      const response = await categoryService.createCategory(categoryData);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        setShowModal(false);
        setEditingCategory(undefined);
        await loadCategories();
      }
    } catch (err) {
      setError('Kategori eklenirken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryData: UpdateCategoryDto) => {
    if (!editingCategory) return;

    try {
      setModalLoading(true);
      
      const response = await categoryService.updateCategory(editingCategory.id, categoryData);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        setShowModal(false);
        setEditingCategory(undefined);
        await loadCategories();
      }
    } catch (err) {
      setError('Kategori güncellenirken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number, categoryName: string) => {
    if (!window.confirm(`"${categoryName}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await categoryService.deleteCategory(id);
      if (response.error) {
        setError(response.error.message);
      } else {
        await loadCategories();
      }
    } catch (err) {
      setError('Kategori silinirken bir hata oluştu');
    }
  };

  const handleEditCategory = (category: CategoryDto) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleAddNewCategory = () => {
    setEditingCategory(undefined);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="loading-container">
            <div className="loading-spinner-enhanced"></div>
            <p className="loading-text">Kategoriler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1>Kategoriler</h1>
              <p>İşlem kategorilerinizi oluşturun ve yönetin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={handleAddNewCategory}
                leftIcon={<Plus size={20} />}
                className="quick-action-btn bg-primary-600 hover:bg-primary-700 text-white"
              >
                Yeni Kategori Ekle
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-content">
              <div className="empty-state">
                <FolderOpen size={40} className="empty-state-icon" />
                <p className="empty-state-text">Henüz kategori bulunmuyor</p>
                <Button 
                  onClick={handleAddNewCategory}
                  leftIcon={<Plus size={16} />}
                  className="mt-4"
                >
                  İlk Kategorinizi Oluşturun
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-cards-grid">
            {categories.map((category) => (
              <div key={category.id} className="enhanced-dashboard-card">
                {/* Category Header with Color */}
                <div 
                  className="h-1 w-full"
                  style={{ backgroundColor: category.color }}
                />
                
                <div className="enhanced-card-header">
                  <div className="enhanced-card-title">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </div>
                  {category.isDefault && (
                    <Badge variant="default">
                      Varsayılan
                    </Badge>
                  )}
                </div>
                
                <div className="enhanced-card-content">
                    {/* Description */}
                    <div className="mb-4">
                      {category.description ? (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">
                          Açıklama eklenmemiş
                        </p>
                      )}
                    </div>
                    
                    {/* Dates */}
                    <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Oluşturulma:</span>
                        <span>{formatDate(category.createdAt)}</span>
                      </div>
                      {category.updatedAt && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Güncelleme:</span>
                          <span>{formatDate(category.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        leftIcon={<Edit size={14} />}
                      >
                        Düzenle
                      </Button>
                      {!category.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          leftIcon={<Trash2 size={14} />}
                          className="text-danger-600 hover:text-danger-700 hover:border-danger-300 hover:bg-danger-50"
                        >
                          Sil
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(undefined);
        }}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
        loading={modalLoading}
      />
    </div>
  );
};

export default CategoriesPage;