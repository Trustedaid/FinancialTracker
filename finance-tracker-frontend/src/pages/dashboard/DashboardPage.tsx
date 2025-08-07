import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../contexts';
import { TransactionModal, CategoryModal, BudgetModal } from '../../components/forms';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import { Button } from '@mui/material';
import { CategorySummaryCard, BudgetOverviewCard } from '../../components/dashboard';
import { LazyChart } from '../../components/charts/LazyChart';

// Lazy load chart components for better performance
const IncomeExpenseTrendChart = React.lazy(() => 
  import('../../components/charts/IncomeExpenseTrendChart').then(module => ({ default: module.IncomeExpenseTrendChart }))
);

const CategorySpendingChart = React.lazy(() => 
  import('../../components/charts/CategorySpendingChart').then(module => ({ default: module.CategorySpendingChart }))
);

const BudgetProgressChart = React.lazy(() => 
  import('../../components/charts/BudgetProgressChart').then(module => ({ default: module.BudgetProgressChart }))
);

const MonthlyComparisonChart = React.lazy(() => 
  import('../../components/charts/MonthlyComparisonChart').then(module => ({ default: module.MonthlyComparisonChart }))
);
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, CreditCard, BarChart3 } from 'lucide-react';
import { transactionService, budgetService, categoryService } from '../../services';
import type { TransactionDto, BudgetDto, CategoryDto, CreateTransactionDto, CreateCategoryDto, CreateBudgetDto } from '../../types/api';
import { Link } from 'react-router-dom';
import './dashboard.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  // Currency formatting handled by CurrencyDisplay component
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<TransactionDto[]>([]);
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Load monthly summary
      const monthlyResponse = await transactionService.getMonthlySummary(currentYear, currentMonth);
      if (monthlyResponse.data) {
        setMonthlyData(monthlyResponse.data);
      }
      
      // Load recent transactions (last 5)
      const transactionsResponse = await transactionService.getTransactions({ page: 1, pageSize: 5 });
      if (transactionsResponse.data) {
        setRecentTransactions(transactionsResponse.data.transactions);
      }
      
      // Load current month budgets
      const budgetsResponse = await budgetService.getCurrentMonthBudgets();
      if (budgetsResponse.data) {
        setBudgets(budgetsResponse.data);
      }

      // Load categories for modals
      const categoriesResponse = await categoryService.getCategories();
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
      
    } catch (err) {
      setError(t('dashboard.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  // Removed local formatCurrency function - now using useCurrency hook

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getTransactionTypeIcon = (type: number) => {
    return type === 1 ? (
      <TrendingUp className="w-4 h-4 text-success-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-danger-600" />
    );
  };

  const getTransactionAmountClass = (type: number) => {
    return type === 1 ? 'text-success-600' : 'text-danger-600';
  };

  // Modal handlers
  const handleTransactionSave = async (transactionData: CreateTransactionDto) => {
    try {
      setModalLoading(true);
      const response = await transactionService.createTransaction(transactionData);
      if (response.data) {
        setIsTransactionModalOpen(false);
        // Reload dashboard data to show the new transaction
        loadDashboardData();
      }
    } catch (err) {
      setError(t('dashboard.error_transaction'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleCategorySave = async (categoryData: CreateCategoryDto) => {
    try {
      setModalLoading(true);
      const response = await categoryService.createCategory(categoryData);
      if (response.data) {
        setIsCategoryModalOpen(false);
        // Reload categories
        const categoriesResponse = await categoryService.getCategories();
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      }
    } catch (err) {
      setError(t('dashboard.error_category'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleBudgetSave = async (budgetData: CreateBudgetDto) => {
    try {
      setModalLoading(true);
      const response = await budgetService.createBudget(budgetData);
      if (response.data) {
        setIsBudgetModalOpen(false);
        // Reload budgets
        const budgetsResponse = await budgetService.getCurrentMonthBudgets();
        if (budgetsResponse.data) {
          setBudgets(budgetsResponse.data);
        }
      }
    } catch (err) {
      setError(t('dashboard.error_budget'));
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="loading-container">
            <div className="loading-spinner-enhanced"></div>
            <p className="loading-text">{t('dashboard.loading')}</p>
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
          <h1>
            {t('dashboard.welcome')}, {user?.firstName}!
          </h1>
          <p>
            {t('dashboard.welcome_message')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="enhanced-stats-card">
            <div className="stats-card-header">
              <div className="stats-card-title">{t('dashboard.balance')}</div>
              <div className="stats-card-icon balance">
                <DollarSign size={24} />
              </div>
            </div>
            <div className={`stats-card-value ${
              monthlyData.balance >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              <CurrencyDisplay amount={monthlyData.balance} fromCurrency={'TRY' as const} size="lg" />
            </div>
            <div className="stats-card-description">
              {t('dashboard.balance_description')}
            </div>
          </div>

          <div className="enhanced-stats-card">
            <div className="stats-card-header">
              <div className="stats-card-title">{t('dashboard.income')}</div>
              <div className="stats-card-icon income">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="stats-card-value text-success-600">
              <CurrencyDisplay amount={monthlyData.totalIncome} fromCurrency={'TRY' as const} size="lg" />
            </div>
            <div className="stats-card-description">
              {t('dashboard.income_description')}
            </div>
          </div>

          <div className="enhanced-stats-card">
            <div className="stats-card-header">
              <div className="stats-card-title">{t('dashboard.expense')}</div>
              <div className="stats-card-icon expense">
                <TrendingDown size={24} />
              </div>
            </div>
            <div className="stats-card-value text-danger-600">
              <CurrencyDisplay amount={monthlyData.totalExpense} fromCurrency={'TRY' as const} size="lg" />
            </div>
            <div className="stats-card-description">
              {t('dashboard.expense_description')}
            </div>
          </div>
        </div>

        {/* Görsel ayırıcı - Stats ve Hızlı İşlemler arası */}
        <div className="w-full h-10 mb-10"></div>

        {/* Quick Actions */}
        <div>
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-header">
              <div className="enhanced-card-title">
                <PlusCircle size={20} className="text-primary-600" />
                {t('dashboard.quick_actions')}
              </div>
            </div>
            <div className="enhanced-card-content">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button 
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusCircle size={20} />}
                  onClick={() => setIsTransactionModalOpen(true)}
                  sx={{ 
                    height: '80px', 
                    flexDirection: 'column',
                    gap: 1,
                    textTransform: 'none',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.500'
                    }
                  }}
                >
                  <span className="text-xs font-medium">{t('dashboard.add_transaction')}</span>
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusCircle size={20} />}
                  onClick={() => setIsCategoryModalOpen(true)}
                  sx={{ 
                    height: '80px', 
                    flexDirection: 'column',
                    gap: 1,
                    textTransform: 'none',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.500'
                    }
                  }}
                >
                  <span className="text-xs font-medium">{t('dashboard.add_category')}</span>
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusCircle size={20} />}
                  onClick={() => setIsBudgetModalOpen(true)}
                  sx={{ 
                    height: '80px', 
                    flexDirection: 'column',
                    gap: 1,
                    textTransform: 'none',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.500'
                    }
                  }}
                >
                  <span className="text-xs font-medium">{t('dashboard.create_budget')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div>
          {/* Recent Transactions and Categories Side by Side */}
          <div className="dashboard-side-by-side-grid w-full min-h-0">
            {/* Recent Transactions */}
            <div className="enhanced-dashboard-card w-full h-80 overflow-hidden">
              <div className="enhanced-card-header">
                <div className="enhanced-card-title">
                  <CreditCard size={20} className="text-primary-600" />
                  {t('dashboard.recent_transactions')}
                </div>
                <Link to="/transactions">
                  <Button 
                    variant="text" 
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    {t('common.view_all')}
                  </Button>
                </Link>
              </div>
              <div className="enhanced-card-content">
                {recentTransactions.length === 0 ? (
                  <div className="empty-state">
                    <CreditCard size={40} className="empty-state-icon" />
                    <p className="empty-state-text">{t('dashboard.no_transactions')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="transaction-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTransactionTypeIcon(transaction.type)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold whitespace-nowrap ${getTransactionAmountClass(transaction.type)}`}>
                            <CurrencyDisplay 
                              amount={transaction.type === 1 ? transaction.amount : -transaction.amount} 
                              fromCurrency={'TRY' as const} 
                              size="sm"
                              showPositiveSign={transaction.type === 1}
                            />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Categories Summary */}
            <div className="w-full">
              <CategorySummaryCard
                categories={categories}
                loading={loading}
                onAddCategory={() => setIsCategoryModalOpen(true)}
              />
            </div>
          </div>

          {/* Görsel ayırıcı - Kartlar arasında net bir boşluk oluşturur */}
          <div className="w-full h-20 flex items-center justify-center">
            <div className="w-1/3 border-t-2 border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Budget Overview - Full Width */}
          <div className="grid grid-cols-1 last-item">
            <BudgetOverviewCard
              budgets={budgets}
              loading={loading}
              onAddBudget={() => setIsBudgetModalOpen(true)}
            />
          </div>

          {/* Visual separator for Charts section */}
          <div className="w-full h-20 flex items-center justify-center">
            <div className="w-1/3 border-t-2 border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="enhanced-dashboard-card mb-6">
              <div className="enhanced-card-header">
                <div className="enhanced-card-title">
                  <BarChart3 size={20} className="text-primary-600" />
                  Financial Analytics
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Income vs Expense Trends */}
              <LazyChart height={350} threshold={0.1} rootMargin="100px">
                <IncomeExpenseTrendChart 
                  monthsBack={6}
                  height={350}
                  className="w-full"
                />
              </LazyChart>
              
              {/* Category Spending Distribution */}
              <LazyChart height={350} threshold={0.1} rootMargin="100px">
                <CategorySpendingChart 
                  height={350}
                  className="w-full"
                  onCategoryClick={(categoryId) => {
                    // TODO: Navigate to transactions filtered by category
                    console.log('Category clicked:', categoryId);
                  }}
                />
              </LazyChart>
            </div>

            {/* Second row of charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Budget Progress */}
              <LazyChart height={350} threshold={0.1} rootMargin="100px">
                <BudgetProgressChart 
                  height={350}
                  className="w-full"
                  onBudgetClick={(budgetId) => {
                    // TODO: Navigate to budget details
                    console.log('Budget clicked:', budgetId);
                  }}
                />
              </LazyChart>
              
              {/* Monthly Comparison */}
              <LazyChart height={350} threshold={0.1} rootMargin="100px">
                <MonthlyComparisonChart 
                  height={350}
                  className="w-full"
                />
              </LazyChart>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleTransactionSave}
        categories={categories}
        loading={modalLoading}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleCategorySave}
        loading={modalLoading}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleBudgetSave}
        categories={categories}
        loading={modalLoading}
      />
    </div>
  );
};

export default DashboardPage;