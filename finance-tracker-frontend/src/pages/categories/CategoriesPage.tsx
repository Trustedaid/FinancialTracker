import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FolderOpen
} from 'lucide-react';
import { 
  Button,
  IconButton
} from '@mui/material';
import {
  Edit,
  Delete
} from '@mui/icons-material';
// Removed unused Input import - no longer needed
import { CategoryModal } from '../../components/forms/CategoryModal';
// Removed unused getContrastTextColor import
import { categoryService } from '../../services';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../types/api';
import styles from './CategoriesPage.module.css';

const CategoriesPage: React.FC = () => {
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
      setError('Kategori oluşturulurken bir hata oluştu');
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

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await categoryService.deleteCategory(categoryId);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        await loadCategories();
      }
    } catch (err) {
      setError('Kategori silinirken bir hata oluştu');
    }
  };

  const handleSaveCategory = (categoryData: CreateCategoryDto | UpdateCategoryDto) => {
    if (editingCategory) {
      handleUpdateCategory(categoryData);
    } else {
      handleCreateCategory(categoryData);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(undefined);
    setShowModal(true);
  };

  const openEditModal = (category: CategoryDto) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(undefined);
    setModalLoading(false);
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
              <p>İşlemlerinizi düzenlemek için kategoriler oluşturun ve yönetin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="contained"
                onClick={openCreateModal}
                startIcon={<Plus size={20} />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5
                }}
              >
                Yeni Kategori
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

        {/* Categories Section */}
        <div className="enhanced-dashboard-card">
          <div className="enhanced-card-header">
            <div className="enhanced-card-title">
              <FolderOpen size={20} className="text-primary-600" />
              Kategoriler
            </div>
          </div>
          <div className="enhanced-card-content">
            {categories.length === 0 ? (
              <div className="empty-state">
                <FolderOpen size={40} className="empty-state-icon" />
                <p className="empty-state-text">Henüz kategori yok</p>
                <Button 
                  variant="contained"
                  onClick={openCreateModal}
                  startIcon={<Plus size={16} />}
                  sx={{ 
                    mt: 2,
                    textTransform: 'none',
                    borderRadius: '12px'
                  }}
                >
                  İlk Kategorinizi Oluşturun
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`${styles.enhancedCategoryCard} group cursor-pointer`}
                  >
                    {/* Enhanced Color Header Section - matches Dashboard stats cards */}
                    <div 
                      className={styles.colorHeaderSection}
                      style={{ 
                        background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                      }}
                    >
                      <div className={styles.headerOverlay}></div>
                    </div>
                    
                    {/* Card Content */}
                    <div className={styles.cardContent}>
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`${styles.colorDot} transition-transform duration-200 group-hover:scale-105`}
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className={`${styles.categoryTitle} text-base font-semibold text-gray-900 dark:text-white truncate`}>
                              {category.name}
                            </h3>
                          </div>
                        </div>
                        <div className={`${styles.actionButtons} flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                          <IconButton
                            onClick={() => openEditModal(category)}
                            size="small"
                            title="Düzenle"
                            sx={{
                              color: 'rgb(156, 163, 175)',
                              '&:hover': {
                                color: '#2563eb',
                                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease',
                              padding: '6px'
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteCategory(category.id)}
                            size="small"
                            title="Sil"
                            sx={{
                              color: 'rgb(156, 163, 175)',
                              '&:hover': {
                                color: '#dc2626',
                                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease',
                              padding: '6px'
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      </div>

                      {/* Category Description */}
                      {category.description ? (
                        <p className={`${styles.categoryDescription} text-xs text-gray-600 dark:text-gray-300 mb-3 overflow-hidden`} style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {category.description}
                        </p>
                      ) : (
                        <p className={`${styles.emptyDescription} text-xs text-gray-400 dark:text-gray-500 mb-3 italic`}>
                          Açıklama eklenmemiş
                        </p>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSaveCategory}
        category={editingCategory}
        loading={modalLoading}
      />
    </div>
  );
};

export default CategoriesPage;