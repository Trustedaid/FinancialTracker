import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle, Progress, Badge } from '../ui';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';
import type { BudgetDto } from '../../types/api';

interface BudgetOverviewCardProps {
  budgets: BudgetDto[];
  loading: boolean;
  onAddBudget: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  budgets,
  loading,
  onAddBudget
}) => {
  if (loading) {
    return (
      <Card className="dashboard-card h-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target size={20} className="text-primary-600" />
            Bütçe Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // const activeBudgets = budgets.filter(budget => budget.percentageUsed > 0);
  const overBudgetCount = budgets.filter(budget => budget.percentageUsed >= 100).length;
  const nearLimitCount = budgets.filter(budget => budget.percentageUsed >= 80 && budget.percentageUsed < 100).length;

  return (
    <Card className="dashboard-card h-80 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target size={20} className="text-primary-600" />
            Bütçe Durumu
          </CardTitle>
          <Link to="/budgets">
            <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
              Tümünü Gör
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <Target size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm mb-4">Bu ay için bütçe bulunmuyor</p>
            <Button
              onClick={onAddBudget}
              variant="text"
              size="small"
              startIcon={<Plus size={16} />}
              sx={{ textTransform: 'none' }}
            >
              İlk Bütçeyi Oluştur
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-600">{budgets.length}</div>
                <div className="text-xs text-blue-600">Toplam</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-lg font-bold text-orange-600">{nearLimitCount}</div>
                <div className="text-xs text-orange-600">Yaklaşan</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <div className="text-lg font-bold text-red-600">{overBudgetCount}</div>
                <div className="text-xs text-red-600">Aşan</div>
              </div>
            </div>

            {/* Recent Budgets */}
            <div className="space-y-3 max-h-44 overflow-y-auto">
              {budgets.slice(0, 4).map((budget) => (
                <div key={budget.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.categoryColor }}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {budget.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {budget.percentageUsed >= 100 && (
                        <AlertTriangle size={12} className="text-red-500" />
                      )}
                      <Badge 
                        variant={
                          budget.percentageUsed >= 100 ? 'danger' :
                          budget.percentageUsed >= 80 ? 'warning' : 'success'
                        }
                        size="sm"
                      >
                        %{budget.percentageUsed.toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress
                    value={Math.min(budget.percentageUsed, 100)}
                    className={`h-1.5 ${
                      budget.percentageUsed >= 100 ? 'progress-danger' :
                      budget.percentageUsed >= 80 ? 'progress-warning' : 'progress-success'
                    }`}
                  />
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      <CurrencyDisplay amount={budget.spentAmount} fromCurrency={'TRY' as const} size="sm" />
                    </span>
                    <span className="text-xs text-gray-500">
                      <CurrencyDisplay amount={budget.amount} fromCurrency={'TRY' as const} size="sm" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {budgets.length > 4 && (
              <div className="text-center pt-2 border-t border-gray-200">
                <Link to="/budgets">
                  <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
                    +{budgets.length - 4} bütçe daha
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