import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  AlertTriangle
} from 'lucide-react';
import { Button, IconButton } from '@mui/material';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Progress,
  Badge
} from '../../components/ui';
import { BudgetModal } from '../../components/forms';
import { budgetService, categoryService } from '../../services';
import type { BudgetDto, CreateBudgetDto, UpdateBudgetDto, CategoryDto } from '../../types';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

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

  const months = [
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

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, [selectedMonth, selectedYear]);

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

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
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

  const handleDeleteBudget = async (budgetId: number) => {
    if (!window.confirm('Bu bütçeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await budgetService.deleteBudget(budgetId);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        await loadBudgets();
      }
    } catch (err) {
      setError('Bütçe silinirken bir hata oluştu');
    }
  };

  const handleSaveBudget = (budgetData: CreateBudgetDto | UpdateBudgetDto) => {
    if (editingBudget) {
      handleUpdateBudget(budgetData);
    } else {
      handleCreateBudget(budgetData);
    }
  };

  const openCreateModal = () => {
    setEditingBudget(undefined);
    setShowModal(true);
  };

  const openEditModal = (budget: BudgetDto) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(undefined);
    setModalLoading(false);
  };

  // Removed unused getProgressColor function

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'default';
  };

  const calculateBudgetProgress = (budget: BudgetDto) => {
    const spent = budget.spentAmount || 0;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;
    
    return {
      spent,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(remaining, 0),
      isOverBudget: percentage > 100
    };
  };

  const filteredBudgets = budgets.filter(budget => 
    budget.month === selectedMonth && budget.year === selectedYear
  );

  if (loading) {
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
              <p>Aylık harcamalarınızı kontrol altında tutun</p>
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
                Yeni Bütçe
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

        {/* Budgets Section */}
        <div className="enhanced-dashboard-card">
          <div className="enhanced-card-header">
            <div className="enhanced-card-title">
              <Target size={20} className="text-primary-600" />
              Bütçelerim
            </div>
          </div>
          <div className="enhanced-card-content">
            {/* Month/Year Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 6 }, (_, i) => {
                    const year = new Date().getFullYear() - 1 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Budgets Grid */}
            {filteredBudgets.length === 0 ? (
              <div className="empty-state">
                <Target size={40} className="empty-state-icon" />
                <p className="empty-state-text">
                  {months.find(m => m.value === selectedMonth)?.label} {selectedYear} için bütçe bulunamadı
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Bu ay için ilk bütçenizi oluşturun.
                </p>
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
                  Bütçe Oluştur
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const progress = calculateBudgetProgress(budget);
            const category = categories.find(c => c.id === budget.categoryId);
            
            return (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {category && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category?.name || 'Kategori bulunamadı'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <IconButton
                        size="small"
                        onClick={() => openEditModal(budget)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Budget Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bütçe</span>
                    <CurrencyDisplay amount={budget.amount} className="font-semibold" />
                  </div>

                  {/* Spent Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Harcanan</span>
                    <CurrencyDisplay 
                      amount={progress.spent} 
                      className={`font-semibold ${progress.isOverBudget ? 'text-red-600' : 'text-gray-900'}`} 
                    />
                  </div>

                  {/* Remaining Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kalan</span>
                    <CurrencyDisplay 
                      amount={progress.remaining} 
                      className={`font-semibold ${progress.isOverBudget ? 'text-red-600' : 'text-green-600'}`} 
                    />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İlerleme</span>
                      <span className={`font-medium ${progress.isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        %{progress.percentage.toFixed(0)}
                      </span>
                    </div>
                    <Progress 
                      value={progress.percentage} 
                      variant={getProgressVariant(progress.percentage)}
                      className="h-2"
                    />
                  </div>

                  {/* Over Budget Warning */}
                  {progress.isOverBudget && (
                    <Badge variant="danger" className="w-full justify-center py-1">
                      <AlertTriangle size={12} className="mr-1" />
                      Bütçe Aşıldı!
                    </Badge>
                  )}

                  {/* Period */}
                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    {months.find(m => m.value === budget.month)?.label} {budget.year}
                  </div>
                </CardContent>
              </Card>
            );
          })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSaveBudget}
        budget={editingBudget}
        categories={categories}
        loading={modalLoading}
      />
    </div>
  );
};

export default BudgetsPage;