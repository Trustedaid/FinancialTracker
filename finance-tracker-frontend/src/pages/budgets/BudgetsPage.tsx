import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Button, IconButton } from '@mui/material';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input,
  Progress,
  Badge
} from '../../components/ui';
import { budgetService, categoryService } from '../../services';
import type { BudgetDto, CreateBudgetDto, UpdateBudgetDto, CategoryDto } from '../../types';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgetData: CreateBudgetDto | UpdateBudgetDto) => void;
  budget?: BudgetDto;
  categories: CategoryDto[];
  loading?: boolean;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  budget, 
  categories,
  loading = false 
}) => {
  const [formData, setFormData] = useState<CreateBudgetDto>({
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
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
      const now = new Date();
      setFormData({
        amount: 0,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        categoryId: categories.length > 0 ? categories[0].id : 0
      });
    }
    setErrors({});
  }, [budget, categories, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Bütçe tutarı 0\'dan büyük olmalıdır';
    }

    if (formData.categoryId <= 0) {
      newErrors.categoryId = 'Kategori seçimi gereklidir';
    }

    if (formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Geçerli bir ay seçiniz';
    }

    if (formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Geçerli bir yıl giriniz (2020-2030)';
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

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {budget ? 'Bütçe Düzenle' : 'Yeni Bütçe Oluştur'}
            </h3>
            <IconButton
              onClick={onClose}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <X size={20} />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              {/* Budget Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bütçe Tutarı (₺) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ay *
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => handleInputChange('month', Number(e.target.value))}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      errors.month ? 'border-danger-300' : ''
                    }`}
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {errors.month && (
                    <p className="mt-1 text-sm text-danger-600">{errors.month}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yıl *
                  </label>
                  <Input
                    type="number"
                    min="2020"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', Number(e.target.value))}
                    className={errors.year ? 'border-danger-300' : ''}
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-danger-600">{errors.year}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg">
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

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetDto | undefined>();

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await budgetService.getBudgets({
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.data) {
        setBudgets(response.data);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Bütçeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (budgetData: CreateBudgetDto) => {
    try {
      setModalLoading(true);
      
      const response = await budgetService.createBudget(budgetData);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        setShowModal(false);
        setEditingBudget(undefined);
        await loadBudgets();
      }
    } catch (err) {
      setError('Bütçe oluşturulurken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateBudget = async (budgetData: UpdateBudgetDto) => {
    if (!editingBudget) return;

    try {
      setModalLoading(true);
      
      const response = await budgetService.updateBudget(editingBudget.id, budgetData);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        setShowModal(false);
        setEditingBudget(undefined);
        await loadBudgets();
      }
    } catch (err) {
      setError('Bütçe güncellenirken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBudget = async (id: number, categoryName: string) => {
    if (!window.confirm(`"${categoryName}" kategorisi için oluşturulan bütçeyi silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await budgetService.deleteBudget(id);
      if (response.error) {
        setError(response.error.message);
      } else {
        await loadBudgets();
      }
    } catch (err) {
      setError('Bütçe silinirken bir hata oluştu');
    }
  };

  const handleEditBudget = (budget: BudgetDto) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleAddNewBudget = () => {
    setEditingBudget(undefined);
    setShowModal(true);
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  if (loading && budgets.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="loading-container">
            <div className="loading-spinner-enhanced"></div>
            <p className="loading-text">Bütçeler yükleniyor...</p>
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
              <h1>Bütçeler</h1>
              <p>Aylık bütçelerinizi oluşturun ve harcamalarınızı takip edin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                variant="contained"
                onClick={handleAddNewBudget}
                startIcon={<Plus size={20} />}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5
                }}
              >
                Yeni Bütçe Ekle
              </Button>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <div className="mb-8">
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-content">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ay
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yıl
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 text-sm text-gray-600">
                  <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong> dönemine ait bütçeler
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-content">
              <div className="empty-state">
                <Target size={40} className="empty-state-icon" />
                <p className="empty-state-text">Bu dönem için bütçe bulunmuyor</p>
                <p className="text-gray-500 text-sm mb-4">
                  <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong> dönemi için ilk bütçenizi oluşturun.
                </p>
                <Button 
                  variant="contained"
                  onClick={handleAddNewBudget}
                  startIcon={<Plus size={16} />}
                  sx={{ 
                    mt: 2,
                    textTransform: 'none',
                    borderRadius: '12px'
                  }}
                >
                  İlk Bütçenizi Oluşturun
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-cards-grid">
            {budgets.map((budget) => (
              <div key={budget.id} className="dashboard-card">
                <Card className="h-full">
                  {/* Budget Header with Color */}
                  <div 
                    className="h-2 w-full"
                    style={{ backgroundColor: budget.categoryColor }}
                  />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: budget.categoryColor }}
                        />
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            {budget.categoryName}
                          </CardTitle>
                          <div className="text-sm text-gray-500">
                            {monthNames[budget.month - 1]} {budget.year}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          budget.percentageUsed >= 100 
                            ? 'danger' 
                            : budget.percentageUsed >= 80 
                            ? 'warning' 
                            : 'success'
                        }
                        size="sm"
                      >
                        %{budget.percentageUsed.toFixed(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Budget Progress */}
                    <div className="mb-4">
                      <Progress
                        value={budget.percentageUsed}
                        max={100}
                        showLabel
                        showPercentage
                        animated
                        striped
                        label="Harcama Durumu"
                        formatValue={() => 
                          `${budget.spentAmount.toFixed(0)} / ${budget.amount.toFixed(0)} TL`
                        }
                        size="lg"
                        className="mb-2"
                      />
                    </div>

                    {/* Budget Details */}
                    <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-600">Bütçe:</span>
                        <CurrencyDisplay 
                          amount={budget.amount} 
                          fromCurrency={'TRY' as const} 
                          size="sm"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-600">Harcanan:</span>
                        <CurrencyDisplay 
                          amount={budget.spentAmount} 
                          fromCurrency={'TRY' as const} 
                          size="sm"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                        <span className="font-medium text-gray-600">Kalan:</span>
                        <CurrencyDisplay 
                          amount={budget.remainingAmount} 
                          fromCurrency={'TRY' as const} 
                          size="sm"
                          className={budget.remainingAmount >= 0 ? 'text-success-600' : 'text-danger-600'}
                        />
                      </div>
                    </div>

                    {/* Warning for over-budget */}
                    {budget.percentageUsed >= 100 && (
                      <div className="flex items-center space-x-2 p-3 bg-danger-50 border border-danger-200 rounded-lg mb-4">
                        <AlertTriangle size={16} className="text-danger-600" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-danger-800">Bütçe aşıldı!</p>
                          <p className="text-xs text-danger-700">
                            <CurrencyDisplay 
                              amount={budget.spentAmount - budget.amount} 
                              fromCurrency={'TRY' as const} 
                              size="sm"
                            /> fazla harcama yapıldı
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Near budget warning */}
                    {budget.percentageUsed >= 80 && budget.percentageUsed < 100 && (
                      <div className="flex items-center space-x-2 p-3 bg-warning-50 border border-warning-200 rounded-lg mb-4">
                        <AlertTriangle size={16} className="text-warning-600" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-warning-800">Bütçe limitine yaklaşıyorsunuz</p>
                          <p className="text-xs text-warning-700">
                            Kalan: <CurrencyDisplay 
                              amount={budget.remainingAmount} 
                              fromCurrency={'TRY' as const} 
                              size="sm"
                            />
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditBudget(budget)}
                        startIcon={<Edit size={14} />}
                        sx={{ textTransform: 'none' }}
                      >
                        Düzenle
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteBudget(budget.id, budget.categoryName)}
                        startIcon={<Trash2 size={14} />}
                        sx={{ textTransform: 'none' }}
                      >
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBudget(undefined);
        }}
        onSave={editingBudget ? handleUpdateBudget : handleCreateBudget}
        budget={editingBudget}
        categories={categories}
        loading={modalLoading}
      />
    </div>
  );
};

export default BudgetsPage;