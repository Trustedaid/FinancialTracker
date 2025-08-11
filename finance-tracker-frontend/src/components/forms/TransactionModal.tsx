import React, { useState, useEffect } from 'react';
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
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
import type { TransactionDto, CreateTransactionDto, UpdateTransactionDto, CategoryDto, TransactionType } from '../../types/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: CreateTransactionDto | UpdateTransactionDto) => void;
  transaction?: TransactionDto;
  categories: CategoryDto[];
  loading?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction, 
  categories,
  loading = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:430px)');
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [formData, setFormData] = useState<CreateTransactionDto>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 2, // Default to expense
    categoryId: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.split('T')[0], // Convert to YYYY-MM-DD format
        type: transaction.type,
        categoryId: transaction.categoryId
      });
    } else {
      setFormData({
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 2, // Default to expense
        categoryId: categories.length > 0 ? categories[0].id : 0
      });
    }
    setErrors({});
  }, [transaction, categories, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Tutar 0\'dan büyük olmalıdır';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gereklidir';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Açıklama en az 3 karakter olmalıdır';
    }

    if (!formData.date) {
      newErrors.date = 'Tarih seçimi gereklidir';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (selectedDate < oneYearAgo || selectedDate > oneYearFromNow) {
        newErrors.date = 'Tarih son 1 yıl ile gelecek 1 yıl arasında olmalıdır';
      }
    }

    if (formData.categoryId <= 0) {
      newErrors.categoryId = 'Kategori seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert date to ISO string with current time
    const transactionData = {
      ...formData,
      date: new Date(formData.date + 'T12:00:00').toISOString()
    };

    onSave(transactionData);
  };

  const handleInputChange = (field: keyof CreateTransactionDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ ...prev, type }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
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
          {transaction ? 'İşlem Düzenle' : 'Yeni İşlem Ekle'}
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
            {/* Transaction Type */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                İşlem Türü *
              </Typography>
              <ToggleButtonGroup
                value={formData.type}
                exclusive
                onChange={(_, value) => value && handleTypeChange(value)}
                fullWidth
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 1,
                  '& .MuiToggleButton-root': {
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    py: isSmallMobile ? 2.5 : isMobile ? 2 : 1.5,
                    minHeight: isSmallMobile ? 52 : isMobile ? 48 : 'auto',
                    fontSize: isSmallMobile ? '1rem' : isMobile ? '0.95rem' : '0.875rem',
                    // Enhanced touch target
                    '&:active': {
                      transform: 'scale(0.98)'
                    }
                  }
                }}
              >
                <ToggleButton 
                  value={1}
                  sx={{ 
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light',
                      color: theme.palette.mode === 'dark' ? 'success.contrastText' : 'success.main',
                      borderColor: 'success.main',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light'
                      }
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <TrendingUp size={16} style={{ marginRight: 8 }} />
                  Gelir
                </ToggleButton>
                <ToggleButton 
                  value={2}
                  sx={{ 
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light',
                      color: theme.palette.mode === 'dark' ? 'error.contrastText' : 'error.main',
                      borderColor: 'error.main',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'
                      }
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <TrendingDown size={16} style={{ marginRight: 8 }} />
                  Gider
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Amount */}
            <TextField
              label="Tutar (₺) *"
              type="number"
              inputProps={{
                step: '0.01',
                min: '0'
              }}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', Number(e.target.value))}
              placeholder="İşlem tutarını girin"
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

            {/* Description */}
            <TextField
              label="Açıklama *"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="İşlem açıklaması"
              fullWidth
              error={!!errors.description}
              helperText={errors.description}
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

            {/* Date */}
            <TextField
              label="Tarih *"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              fullWidth
              error={!!errors.date}
              helperText={errors.date}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
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

            {/* Category */}
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel id="category-select-label">Kategori *</InputLabel>
              <Select
                labelId="category-select-label"
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
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && (
                <FormHelperText>{errors.categoryId}</FormHelperText>
              )}
            </FormControl>

            {/* Preview */}
            {formData.amount > 0 && formData.description && (
              <Card 
                variant="outlined" 
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Önizleme:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formData.type === 1 ? (
                        <TrendingUp 
                          size={16} 
                          color={theme.palette.success.main} 
                          style={{ marginRight: 8 }} 
                        />
                      ) : (
                        <TrendingDown 
                          size={16} 
                          color={theme.palette.error.main} 
                          style={{ marginRight: 8 }} 
                        />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formData.description}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: formData.type === 1 ? 'success.main' : 'error.main'
                      }}
                    >
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(formData.amount)}
                    </Typography>
                  </Box>
                  {formData.date && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {new Date(formData.date).toLocaleDateString('tr-TR')}
                    </Typography>
                  )}
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
            {loading ? 'Yükleniyor...' : (transaction ? 'Güncelle' : 'Ekle')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionModal;