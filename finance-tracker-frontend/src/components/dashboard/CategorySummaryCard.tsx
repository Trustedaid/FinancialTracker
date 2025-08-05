import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../ui';
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
    <Card className="dashboard-card h-80 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={20} className="text-primary-600" />
            Kategoriler
          </CardTitle>
          <Link to="/categories">
            <button className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">
              Tümünü Gör
            </button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm mb-4">Henüz kategori bulunmuyor</p>
            <button
              onClick={onAddCategory}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Plus size={16} />
              İlk Kategoriyi Oluştur
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {categories.slice(0, 6).map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    {category.description && (
                      <p className="text-xs text-gray-500 truncate max-w-32">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                {category.isDefault && (
                  <Badge variant="default" size="sm">
                    Varsayılan
                  </Badge>
                )}
              </div>
            ))}
            
            {categories.length > 6 && (
              <div className="text-center pt-3 border-t border-gray-200">
                <Link to="/categories">
                  <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
                    +{categories.length - 6} kategori daha
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};