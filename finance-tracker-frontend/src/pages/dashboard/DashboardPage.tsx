import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../contexts';
import { TransactionModal, CategoryModal, BudgetModal } from '../../components/forms';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import { CategorySummaryCard, BudgetOverviewCard } from '../../components/dashboard';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
import { transactionService, budgetService, categoryService } from '../../services';
import type { TransactionDto, BudgetDto, CategoryDto, CreateTransactionDto, CreateCategoryDto, CreateBudgetDto } from '../../types/api';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
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
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-header">
              <div className="enhanced-card-title">
                <PlusCircle size={20} className="text-primary-600" />
                {t('dashboard.quick_actions')}
              </div>
            </div>
            <div className="enhanced-card-content">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  className="quick-action-btn flex-col h-20 justify-center" 
                  onClick={() => setIsTransactionModalOpen(true)}
                >
                  <PlusCircle className="quick-action-icon" />
                  <span className="text-xs mt-1">{t('dashboard.add_transaction')}</span>
                </button>
                <button 
                  className="quick-action-btn flex-col h-20 justify-center" 
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <PlusCircle className="quick-action-icon" />
                  <span className="text-xs mt-1">{t('dashboard.add_category')}</span>
                </button>
                <button 
                  className="quick-action-btn flex-col h-20 justify-center" 
                  onClick={() => setIsBudgetModalOpen(true)}
                >
                  <PlusCircle className="quick-action-icon" />
                  <span className="text-xs mt-1">{t('dashboard.create_budget')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-header">
              <div className="enhanced-card-title">
                <CreditCard size={20} className="text-primary-600" />
                {t('dashboard.recent_transactions')}
              </div>
              <Link to="/transactions">
                <button className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">
                  {t('common.view_all')}
                </button>
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
          <CategorySummaryCard
            categories={categories}
            loading={loading}
            onAddCategory={() => setIsCategoryModalOpen(true)}
          />

          {/* Budget Overview */}
          <BudgetOverviewCard
            budgets={budgets}
            loading={loading}
            onAddBudget={() => setIsBudgetModalOpen(true)}
          />
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