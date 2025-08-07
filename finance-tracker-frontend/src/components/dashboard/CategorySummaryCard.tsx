import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../ui';
import { getContrastTextColor } from '../../utils';
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
      <Card className="dashboard-card h-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={20} className="text-primary-600" />
            Kategoriler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dashboard-card h-80 overflow-hidden w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={20} className="text-primary-600" />
            Kategoriler
          </CardTitle>
          <Link to="/categories">
            <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
              Tümünü Gör
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {categories.length === 0 ? (
          <div className="text-center py-8">
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
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {categories.slice(0, 6).map((category) => {
              const textColor = getContrastTextColor(category.color);
              
              return (
                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Category Header with Selected Color Background */}
                  <div 
                    className="p-3 border-b border-gray-100 dark:border-gray-600"
                    style={{ 
                      backgroundColor: category.color,
                      color: textColor
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </div>
                      </div>
                      {category.isDefault && (
                        <Badge 
                          variant="default" 
                          size="sm"
                          className="bg-white/20 text-current border-white/30"
                        >
                          Varsayılan
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-3 bg-white dark:bg-gray-800">
                    {category.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {category.description}
                      </p>
                    )}
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
      </CardContent>
    </Card>
  );
};