import React, { useState, useEffect } from 'react';
import { X, Check, Target, Calendar } from 'lucide-react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  useTheme,
  FormHelperText,
  useMediaQuery
} from '@mui/material';
import type { BudgetDto, CreateBudgetDto, UpdateBudgetDto, CategoryDto } from '../../types/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgetData: CreateBudgetDto | UpdateBudgetDto) => void;
  budget?: BudgetDto;
  categories: CategoryDto[];
  loading?: boolean;
}

const MONTHS = [
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

export const BudgetModal: React.FC<BudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  budget, 
  categories,
  loading = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:430px)');
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [formData, setFormData] = useState<CreateBudgetDto>({
    amount: 0,
    month: currentMonth,
    year: currentYear,
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
      setFormData({
        amount: 0,
        month: currentMonth,
        year: currentYear,
        categoryId: categories.length > 0 ? categories[0].id : 0
      });
    }
    setErrors({});
  }, [budget, categories, isOpen, currentMonth, currentYear]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Bütçe tutarı 0\'dan büyük olmalıdır';
    } else if (formData.amount > 10000000) {
      newErrors.amount = 'Bütçe tutarı çok yüksek';
    }

    if (formData.categoryId <= 0) {
      newErrors.categoryId = 'Kategori seçimi gereklidir';
    }

    if (formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Geçerli bir ay seçiniz';
    }

    if (formData.year < currentYear - 1 || formData.year > currentYear + 5) {
      newErrors.year = 'Yıl geçmiş 1 yıl ile gelecek 5 yıl arasında olmalıdır';
    }

    // Check if this is not an edit and the selected month/year is in the past
    if (!budget && (formData.year < currentYear || (formData.year === currentYear && formData.month < currentMonth))) {
      newErrors.month = 'Geçmiş aylar için bütçe oluşturamazsınız';
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

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === formData.categoryId);
  };

  const generateYearOptions = () => {
    const years = [];
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={isTablet ? "md" : "sm"}
      fullWidth
      fullScreen={isSmallMobile}
      PaperProps={{
        sx: {
          borderRadius: isSmallMobile ? 0 : 2,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          margin: isMobile && !isSmallMobile ? 2 : undefined,
          width: isMobile && !isSmallMobile ? 'calc(100vw - 32px)' : undefined,
          maxHeight: isMobile && !isSmallMobile ? 'calc(100vh - 32px)' : undefined,
          minHeight: isSmallMobile ? '100vh' : 'auto',
          // Enhanced touch scrolling for mobile
          overflowY: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2,
          backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {budget ? 'Bütçe Düzenle' : 'Yeni Bütçe Oluştur'}
        </Typography>
        <IconButton
          onClick={onClose}
          size={isMobile ? "medium" : "small"}
          sx={{ 
            color: 'text.secondary',
            minWidth: isMobile ? 44 : 'auto',
            minHeight: isMobile ? 44 : 'auto',
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pb: 0, px: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isSmallMobile ? 2 : isMobile ? 2.5 : 3, 
            pt: isSmallMobile ? 1 : isMobile ? 1.5 : 2 
          }}>
            {/* Category */}
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel id="budget-category-select-label">Kategori *</InputLabel>
              <Select
                labelId="budget-category-select-label"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
                label="Kategori *"
                sx={{
                  borderRadius: 2,
                  minHeight: isSmallMobile ? 60 : isMobile ? 56 : 'auto',
                  fontSize: isSmallMobile ? '1.1rem' : '1rem',
                  '& .MuiInputLabel-root': {
                    fontSize: isSmallMobile ? '1.1rem' : isMobile ? '1rem' : '0.875rem'
                  }
                }}
              >
                <MenuItem value={0}>
                  <Typography color="text.disabled">Kategori seçiniz</Typography>
                </MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && (
                <FormHelperText>{errors.categoryId}</FormHelperText>
              )}
            </FormControl>

            {/* Amount */}
            <TextField
              label="Bütçe Tutarı (₺) *"
              type="number"
              inputProps={{
                step: '0.01',
                min: '0',
                max: '10000000'
              }}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', Number(e.target.value))}
              placeholder="Bütçe tutarını girin"
              fullWidth
              error={!!errors.amount}
              helperText={errors.amount}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: isSmallMobile ? 60 : isMobile ? 56 : 'auto',
                  fontSize: isSmallMobile ? '1.1rem' : '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: isSmallMobile ? '1.1rem' : isMobile ? '1rem' : '0.875rem'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: isSmallMobile ? '0.85rem' : '0.75rem'
                }
              }}
            />

            {/* Month and Year */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth error={!!errors.month}>
                  <InputLabel id="budget-month-select-label">Ay *</InputLabel>
                  <Select
                    labelId="budget-month-select-label"
                    value={formData.month}
                    onChange={(e) => handleInputChange('month', Number(e.target.value))}
                    label="Ay *"
                    sx={{
                      borderRadius: 2,
                      minHeight: isSmallMobile ? 60 : isMobile ? 56 : 'auto',
                      fontSize: isSmallMobile ? '1.1rem' : '1rem',
                      '& .MuiInputLabel-root': {
                        fontSize: isSmallMobile ? '1.1rem' : isMobile ? '1rem' : '0.875rem'
                      }
                    }}
                  >
                    {MONTHS.map(month => (
                      <MenuItem key={month.value} value={month.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={16} />
                          {month.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.month && (
                    <FormHelperText>{errors.month}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth error={!!errors.year}>
                  <InputLabel id="budget-year-select-label">Yıl *</InputLabel>
                  <Select
                    labelId="budget-year-select-label"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', Number(e.target.value))}
                    label="Yıl *"
                    sx={{
                      borderRadius: 2,
                      minHeight: isSmallMobile ? 60 : isMobile ? 56 : 'auto',
                      fontSize: isSmallMobile ? '1.1rem' : '1rem',
                      '& .MuiInputLabel-root': {
                        fontSize: isSmallMobile ? '1.1rem' : isMobile ? '1rem' : '0.875rem'
                      }
                    }}
                  >
                    {generateYearOptions().map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.year && (
                    <FormHelperText>{errors.year}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            {/* Preview */}
            {formData.amount > 0 && formData.categoryId > 0 && (
              <Card 
                variant="outlined" 
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Önizleme:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Target 
                        size={16} 
                        color={theme.palette.primary.main} 
                        style={{ flexShrink: 0 }} 
                      />
                      <Box>
                        {getSelectedCategory() && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getSelectedCategory()?.color,
                                border: `1px solid ${theme.palette.divider}`,
                                flexShrink: 0
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getSelectedCategory()?.name}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={12} color={theme.palette.text.secondary} />
                          <Typography variant="caption" color="text.secondary">
                            {MONTHS.find(m => m.value === formData.month)?.label} {formData.year}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      {formatCurrency(formData.amount)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>

        
        <Divider />
        
        <DialogActions 
          sx={{ 
            p: isSmallMobile ? 1.5 : isMobile ? 2 : 3, 
            backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
            gap: isSmallMobile ? 1.5 : 1,
            flexDirection: isMobile ? 'column-reverse' : 'row',
            '& .MuiButton-root': {
              minHeight: isSmallMobile ? 52 : isMobile ? 48 : 'auto',
              fontSize: isSmallMobile ? '1.1rem' : isMobile ? '1rem' : '0.875rem',
              width: isMobile ? '100%' : 'auto',
              fontWeight: 600,
              // Enhanced touch feedback
              '&:active': {
                transform: 'scale(0.98)'
              }
            }
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              minWidth: isMobile ? 'auto' : 100
            }}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? undefined : <Check size={16} />}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              minWidth: isMobile ? 'auto' : 100,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            {loading ? 'Yükleniyor...' : (budget ? 'Güncelle' : 'Oluştur')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BudgetModal;