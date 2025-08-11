import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Pin } from 'lucide-react';
import { Button } from '@mui/material';
import { Badge } from '../ui';
import type { CategoryDto } from '../../types/api';

interface CategorySummaryCardProps {
  categories: CategoryDto[];
  loading: boolean;
  onAddCategory: () => void;
}

export const CategorySummaryCard: React.FC<CategorySummaryCardProps> = ({
  categories,
  loading,
  onAddCategory
}) => {
  if (loading) {
    return (
      <div className="enhanced-dashboard-card w-full h-[30rem] sm:h-[30rem] md:h-[30rem] overflow-hidden flex flex-col">
        <div className="enhanced-card-header flex-shrink-0">
          <div className="enhanced-card-title flex items-center gap-2">
            <FolderOpen size={20} className="text-primary-600" />
            Kategoriler
          </div>
        </div>
        <div className="enhanced-card-content flex-1">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard-card w-full h-[30rem] sm:h-[30rem] md:h-[30rem] overflow-hidden flex flex-col">
      <div className="enhanced-card-header flex-shrink-0">
        <div className="enhanced-card-title flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen size={20} className="text-primary-600" />
            Kategoriler
          </div>
          <Link to="/categories">
            <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
              Tümünü Gör
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="enhanced-card-content flex-1 overflow-hidden">
        {categories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <FolderOpen size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm mb-4">Henüz kategori bulunmuyor</p>
            <Button
              onClick={onAddCategory}
              variant="text"
              size="small"
              startIcon={<Plus size={16} />}
              sx={{ textTransform: 'none' }}
            >
              İlk Kategoriyi Oluştur
            </Button>
          </div>
        ) : (
          <div className="space-y-3 h-full overflow-y-auto">
            {categories.slice(0, 6).map((category) => {
              return (
                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
                  {/* Category Item with Pin Color Indicator */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Pin Color Indicator */}
                        <Pin 
                          size={16}
                          className="flex-shrink-0 drop-shadow-sm"
                          style={{ color: category.color }}
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                            {category.name}
                          </span>
                          {category.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {category.isDefault && (
                        <Badge 
                          variant="default" 
                          size="sm"
                          className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 flex-shrink-0"
                        >
                          Varsayılan
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {categories.length > 6 && (
              <div className="text-center pt-3 border-t border-gray-200">
                <Link to="/categories">
                  <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
                    +{categories.length - 6} kategori daha
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};