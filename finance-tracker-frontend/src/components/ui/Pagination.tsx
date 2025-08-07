import React from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button, IconButton } from '@mui/material';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100],
  showInfo = true,
  className
}) => {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={clsx(
      'flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200',
      className
    )}>
      {/* Info and Page Size Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {showInfo && (
          <div className="text-sm text-gray-700">
            <span className="font-medium">
              {totalItems > 0 ? `${startItem}-${endItem}` : '0'} of {totalItems}
            </span>
            <span className="hidden sm:inline ml-1">results</span>
          </div>
        )}
        
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm text-gray-700 font-medium">
              Show:
            </label>
            <select
              id="page-size"
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            startIcon={<ChevronLeft size={16} />}
            sx={{ 
              textTransform: 'none',
              borderColor: 'grey.200',
              '&:hover': {
                borderColor: 'primary.300',
                backgroundColor: 'primary.50',
                color: 'primary.700'
              }
            }}
          >
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-1 mx-2">
            {pageNumbers.map((pageNumber, index) => {
              if (pageNumber === '...') {
                return (
                  <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                    <MoreHorizontal size={16} />
                  </span>
                );
              }

              const page = pageNumber as number;
              const isActive = page === currentPage;

              return (
                <IconButton
                  key={page}
                  onClick={() => onPageChange(page)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    backgroundColor: isActive ? 'primary.600' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    boxShadow: isActive ? 2 : 0,
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.700' : 'grey.100',
                      color: isActive ? 'white' : 'text.primary'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {page}
                </IconButton>
              );
            })}
          </div>

          {/* Mobile Page Info */}
          <div className="sm:hidden flex items-center px-3 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          {/* Next Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            endIcon={<ChevronRight size={16} />}
            sx={{ 
              textTransform: 'none',
              borderColor: 'grey.200',
              '&:hover': {
                borderColor: 'primary.300',
                backgroundColor: 'primary.50',
                color: 'primary.700'
              }
            }}
          >
            <span className="hidden sm:inline">Next</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export { Pagination };