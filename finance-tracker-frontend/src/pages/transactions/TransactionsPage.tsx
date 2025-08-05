import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard
} from 'lucide-react';
import { 
  Button, 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Badge,
  FilterBar,
  type FilterConfig,
  type SortConfig
} from '../../components/ui';
import { TransactionModal } from '../../components/forms';
import { transactionService, categoryService } from '../../services';
import type { TransactionDto, TransactionFilterDto, CategoryDto, TransactionType, CreateTransactionDto, UpdateTransactionDto } from '../../types';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<TransactionFilterDto>({
    page: 1,
    pageSize: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // UI state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | undefined>();
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

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

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionService.getTransactions(filters);
      
      if (response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      setError('İşlemler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await transactionService.deleteTransaction(id);
      if (response.error) {
        setError(response.error.message);
      } else {
        await loadTransactions();
      }
    } catch (err) {
      setError('İşlem silinirken bir hata oluştu');
    }
  };

  const handleCreateTransaction = async (transactionData: CreateTransactionDto) => {
    try {
      setModalLoading(true);
      
      const response = await transactionService.createTransaction(transactionData);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        setShowModal(false);
        setEditingTransaction(undefined);
        await loadTransactions();
      }
    } catch (err) {
      setError('İşlem eklenirken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateTransaction = async (transactionData: UpdateTransactionDto) => {
    if (!editingTransaction) return;

    try {
      setModalLoading(true);
      
      const response = await transactionService.updateTransaction(editingTransaction.id, transactionData);
      
      if (response.error) {
        setError(response.error.message);
      } else {
        setShowModal(false);
        setEditingTransaction(undefined);
        await loadTransactions();
      }
    } catch (err) {
      setError('İşlem güncellenirken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditTransaction = (transaction: TransactionDto) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleAddNewTransaction = () => {
    setEditingTransaction(undefined);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getTransactionTypeIcon = (type: TransactionType) => {
    return type === 1 ? (
      <TrendingUp className="w-4 h-4 text-success-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-danger-600" />
    );
  };

  const getTransactionTypeText = (type: TransactionType) => {
    return type === 1 ? 'Gelir' : 'Gider';
  };

  const getTransactionAmountClass = (type: TransactionType) => {
    return type === 1 ? 'text-success-600' : 'text-danger-600';
  };

  // Filter configuration for FilterBar
  const filterConfigs: FilterConfig[] = [
    {
      key: 'type',
      label: 'Transaction Type',
      type: 'select',
      icon: <TrendingUp size={16} />,
      options: [
        { label: 'Income', value: 1, icon: <TrendingUp size={14} className="text-success-600" /> },
        { label: 'Expense', value: 2, icon: <TrendingDown size={14} className="text-danger-600" /> }
      ]
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'select',
      icon: <Filter size={16} />,
      options: categories.map(cat => ({
        label: cat.name,
        value: cat.id,
        icon: <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
      }))
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    }
  ];

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'dateRange') {
      setFilters(prev => ({
        ...prev,
        startDate: value?.start,
        endDate: value?.end,
        page: 1
      }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    }
  };

  const handleFilterClear = () => {
    setFilters({ page: 1, pageSize: 10 });
  };

  const getCurrentFilterValues = () => ({
    type: filters.type,
    categoryId: filters.categoryId,
    dateRange: filters.startDate || filters.endDate ? {
      start: filters.startDate,
      end: filters.endDate
    } : undefined
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="loading-container">
            <div className="loading-spinner-enhanced"></div>
            <p className="loading-text">İşlemler yükleniyor...</p>
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
              <h1>İşlemler</h1>
              <p>Gelir ve gider işlemlerinizi görüntüleyin ve yönetin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={handleAddNewTransaction}
                leftIcon={<Plus size={20} />}
                className="quick-action-btn bg-primary-600 hover:bg-primary-700 text-white"
              >
                Yeni İşlem Ekle
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

        {/* Filters */}
        <div className="mb-8">
          <div className="enhanced-dashboard-card">
            <div className="enhanced-card-content">
              <FilterBar
                filters={filterConfigs}
                values={getCurrentFilterValues()}
                onChange={handleFilterChange}
                onClear={handleFilterClear}
                variant="card"
                showActiveCount
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="enhanced-dashboard-card">
          <div className="enhanced-card-header">
            <div className="enhanced-card-title">
              <CreditCard size={20} className="text-primary-600" />
              İşlemler
            </div>
          </div>
          <div className="enhanced-card-content">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={40} className="empty-state-icon" />
                <p className="empty-state-text">Henüz işlem bulunmuyor</p>
                <Button 
                  onClick={handleAddNewTransaction}
                  leftIcon={<Plus size={16} />}
                  className="mt-4"
                >
                  İlk İşleminizi Ekleyin
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          sortable 
                          sortKey="date" 
                          sortConfig={sortConfig} 
                          onSort={handleSort}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-primary-600" />
                            Tarih
                          </div>
                        </TableHead>
                        <TableHead 
                          sortable 
                          sortKey="description" 
                          sortConfig={sortConfig} 
                          onSort={handleSort}
                        >
                          Açıklama
                        </TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tür</TableHead>
                        <TableHead 
                          align="right"
                          sortable 
                          sortKey="amount" 
                          sortConfig={sortConfig} 
                          onSort={handleSort}
                        >
                          Tutar
                        </TableHead>
                        <TableHead align="right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow 
                          key={transaction.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(transaction.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={transaction.description}>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {transaction.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: transaction.categoryColor }}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {transaction.categoryName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={transaction.type === 1 ? 'outline-success' : 'outline-danger'}
                              icon={getTransactionTypeIcon(transaction.type)}
                            >
                              {getTransactionTypeText(transaction.type)}
                            </Badge>
                          </TableCell>
                          <TableCell align="right" variant="numeric">
                            <div className={`text-sm font-bold ${getTransactionAmountClass(transaction.type)}`}>
                              <CurrencyDisplay 
                                amount={transaction.type === 1 ? transaction.amount : -transaction.amount} 
                                fromCurrency={'TRY' as const} 
                                size="sm"
                                showPositiveSign={transaction.type === 1}
                              />
                            </div>
                          </TableCell>
                          <TableCell align="right" variant="action">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                                leftIcon={<Edit size={14} />}
                              >
                                Düzenle
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                leftIcon={<Trash2 size={14} />}
                                className="text-danger-600 hover:text-danger-700 hover:border-danger-300 hover:bg-danger-50"
                              >
                                Sil
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="transaction-item p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      {/* Header with Type and Amount */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant={transaction.type === 1 ? 'outline-success' : 'outline-danger'}
                          icon={getTransactionTypeIcon(transaction.type)}
                        >
                          {getTransactionTypeText(transaction.type)}
                        </Badge>
                        <div className={`font-semibold ${getTransactionAmountClass(transaction.type)}`}>
                          <CurrencyDisplay 
                            amount={transaction.amount} 
                            fromCurrency={'TRY' as const} 
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {transaction.description}
                        </p>
                      </div>
                      
                      {/* Category and Date */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: transaction.categoryColor }}
                          />
                          <span className="text-gray-600 dark:text-gray-400">{transaction.categoryName}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          leftIcon={<Edit size={14} />}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          leftIcon={<Trash2 size={14} />}
                          className="text-danger-600 hover:text-danger-700 hover:border-danger-300 hover:bg-danger-50"
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={filters.page!}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    itemsPerPage={filters.pageSize!}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(pageSize) => setFilters(prev => ({ ...prev, pageSize, page: 1 }))}
                    showPageSizeSelector
                    showInfo
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTransaction(undefined);
        }}
        onSave={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
        transaction={editingTransaction}
        categories={categories}
        loading={modalLoading}
      />
    </div>
  );
};

export default TransactionsPage;