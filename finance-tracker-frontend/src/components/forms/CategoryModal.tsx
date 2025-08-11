import React, { useState, useEffect } from 'react';
import { X, Check, Palette } from 'lucide-react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  useTheme,
  FormHelperText,
  useMediaQuery
} from '@mui/material';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../types/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CreateCategoryDto | UpdateCategoryDto) => void;
  category?: CategoryDto;
  loading?: boolean;
}

const PREDEFINED_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
  '#DC2626', // Red-600
  '#EA580C', // Orange-600
  '#CA8A04', // Yellow-600
  '#16A34A', // Green-600
  '#0891B2', // Cyan-600
  '#2563EB', // Blue-600
  '#7C3AED', // Purple-600
  '#DB2777', // Pink-600
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  loading = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:430px)');
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    color: PREDEFINED_COLORS[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: PREDEFINED_COLORS[0]
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kategori adı en az 2 karakter olmalıdır';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Kategori adı en fazla 50 karakter olmalıdır';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Açıklama en fazla 200 karakter olmalıdır';
    }

    if (!formData.color) {
      newErrors.color = 'Renk seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      color: formData.color
    };

    onSave(categoryData);
  };

  const handleInputChange = (field: keyof CreateCategoryDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
          {category ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
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
            {/* Category Name */}
            <TextField
              label="Kategori Adı *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Kategori adını girin"
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              variant="outlined"
              inputProps={{ maxLength: 50 }}
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
              label="Açıklama (İsteğe bağlı)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Kategori açıklaması"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description || `${formData.description?.length || 0}/200 karakter`}
              variant="outlined"
              inputProps={{ maxLength: 200 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
            />

            {/* Color Selection */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                <Palette size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                Renk Seçimi *
              </Typography>
              
              {/* Predefined Colors */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Önceden tanımlanmış renkler:
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(6, 1fr)', 
                  gap: 1,
                  '@media (max-width: 600px)': {
                    gridTemplateColumns: 'repeat(4, 1fr)'
                  }
                }}>
                  {PREDEFINED_COLORS.map((color) => (
                    <Box
                      key={color}
                      component="button"
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      sx={{
                        width: isSmallMobile ? 40 : isMobile ? 36 : 32,
                        height: isSmallMobile ? 40 : isMobile ? 36 : 32,
                        borderRadius: '50%',
                        border: formData.color === color 
                          ? `3px solid ${theme.palette.primary.main}` 
                          : `2px solid ${theme.palette.divider}`,
                        backgroundColor: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: formData.color === color ? 2 : 1,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2,
                          borderColor: theme.palette.primary.main
                        }
                      }}
                      title={color}
                    />
                  ))}
                </Box>
              </Box>

              {/* Custom Color */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Özel renk:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box
                    component="input"
                    type="color"
                    value={formData.color}
                    onChange={(e: any) => handleInputChange('color', e.target.value)}
                    sx={{
                      width: isSmallMobile ? 56 : 48,
                      height: isSmallMobile ? 56 : 48,
                      borderRadius: '50%',
                      border: `2px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  />
                  <TextField
                    value={formData.color.toUpperCase()}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="#000000"
                    size="small"
                    inputProps={{ 
                      pattern: '^#[0-9A-Fa-f]{6}$',
                      maxLength: 7,
                      style: { fontFamily: 'monospace' }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </Box>
              
              {errors.color && (
                <FormHelperText error sx={{ mt: 1 }}>{errors.color}</FormHelperText>
              )}
            </Box>

            {/* Preview */}
            {formData.name && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: formData.color,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formData.name}
                    </Typography>
                  </Box>
                  {formData.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', ml: 3 }}>
                      {formData.description}
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
            {loading ? 'Yükleniyor...' : (category ? 'Güncelle' : 'Ekle')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryModal;