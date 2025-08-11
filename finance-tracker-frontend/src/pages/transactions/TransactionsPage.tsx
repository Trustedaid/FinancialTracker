import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import { 
  Pagination,
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
                variant="contained"
                onClick={handleAddNewTransaction}
                startIcon={<Plus size={20} />}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5
                }}
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
                  variant="contained"
                  onClick={handleAddNewTransaction}
                  startIcon={<Plus size={16} />}
                  sx={{ 
                    mt: 2,
                    textTransform: 'none',
                    borderRadius: '12px'
                  }}
                >
                  İlk İşleminizi Ekleyin
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      '& .MuiTable-root': {
                        minWidth: 750
                      }
                    }}
                  >
                    <Table size="medium" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600, 
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                            onClick={() => handleSort('date')}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Calendar size={16} />
                              <Typography variant="subtitle2" fontWeight={600}>
                                Tarih
                              </Typography>
                              {sortConfig?.key === 'date' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp size={16} color="primary" /> : 
                                <ChevronDown size={16} color="primary" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                            onClick={() => handleSort('description')}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Açıklama
                              </Typography>
                              {sortConfig?.key === 'description' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp size={16} color="primary" /> : 
                                <ChevronDown size={16} color="primary" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Kategori
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Tür
                            </Typography>
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                            onClick={() => handleSort('amount')}
                          >
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Tutar
                              </Typography>
                              {sortConfig?.key === 'amount' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp size={16} color="primary" /> : 
                                <ChevronDown size={16} color="primary" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              İşlemler
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow 
                            key={transaction.id}
                            hover
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: 'action.hover'
                              },
                              '&:hover': {
                                backgroundColor: 'action.selected',
                                transform: 'scale(1.001)',
                                transition: 'all 0.2s ease'
                              },
                              cursor: 'pointer'
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Calendar size={14} color="gray" />
                                <Typography variant="body2" fontWeight={500}>
                                  {formatDate(transaction.date)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={transaction.description} arrow>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={500}
                                  sx={{
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {transaction.description}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: transaction.categoryColor
                                  }}
                                />
                                <Typography variant="body2" fontWeight={500}>
                                  {transaction.categoryName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="small"
                                icon={getTransactionTypeIcon(transaction.type)}
                                label={getTransactionTypeText(transaction.type)}
                                variant="outlined"
                                color={transaction.type === 1 ? 'success' : 'error'}
                                sx={{
                                  fontWeight: 500,
                                  borderWidth: 1.5,
                                  '& .MuiChip-icon': {
                                    marginLeft: '4px'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                sx={{
                                  color: transaction.type === 1 ? 'success.main' : 'error.main'
                                }}
                              >
                                <CurrencyDisplay 
                                  amount={transaction.type === 1 ? transaction.amount : -transaction.amount} 
                                  fromCurrency={'TRY' as const} 
                                  size="sm"
                                  showPositiveSign={transaction.type === 1}
                                />
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box display="flex" justifyContent="flex-end" gap={1}>
                                <Tooltip title="Düzenle" arrow>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTransaction(transaction);
                                    }}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText'
                                      }
                                    }}
                                  >
                                    <Edit size={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Sil" arrow>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTransaction(transaction.id);
                                    }}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'error.light',
                                        color: 'error.contrastText'
                                      }
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {transactions.map((transaction) => (
                    <Paper
                      key={transaction.id} 
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          elevation: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {/* Header with Type and Amount */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip 
                          size="small"
                          icon={getTransactionTypeIcon(transaction.type)}
                          label={getTransactionTypeText(transaction.type)}
                          variant="outlined"
                          color={transaction.type === 1 ? 'success' : 'error'}
                          sx={{
                            fontWeight: 500,
                            borderWidth: 1.5
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          fontWeight={600}
                          sx={{
                            color: transaction.type === 1 ? 'success.main' : 'error.main'
                          }}
                        >
                          <CurrencyDisplay 
                            amount={transaction.amount} 
                            fromCurrency={'TRY' as const} 
                            size="sm"
                          />
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          {transaction.description}
                        </Typography>
                      </Box>
                      
                      {/* Category and Date */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: transaction.categoryColor
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {transaction.categoryName}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Calendar size={12} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(transaction.date)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box 
                        display="flex" 
                        justifyContent="flex-end" 
                        gap={1} 
                        pt={2}
                        sx={{
                          borderTop: 1,
                          borderColor: 'divider'
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditTransaction(transaction)}
                          startIcon={<Edit size={14} />}
                          sx={{ textTransform: 'none' }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          startIcon={<Trash2 size={14} />}
                          sx={{ textTransform: 'none' }}
                        >
                          Sil
                        </Button>
                      </Box>
                    </Paper>
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