using FinanceTracker.Application.Features.Budgets.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Budgets.Commands;

public record UpdateBudgetCommand(int Id, UpdateBudgetDto BudgetDto, int UserId) : IRequest<BudgetDto>;

public class UpdateBudgetCommandHandler : IRequestHandler<UpdateBudgetCommand, BudgetDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateBudgetCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BudgetDto> Handle(UpdateBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == request.Id && b.UserId == request.UserId, cancellationToken);

        if (budget == null)
        {
            throw new NotFoundException("Budget", request.Id);
        }

        // Verify that the new category belongs to the user
        var newCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.BudgetDto.CategoryId && c.UserId == request.UserId, 
                                cancellationToken);

        if (newCategory == null)
        {
            throw new NotFoundException("Category", request.BudgetDto.CategoryId);
        }

        // Check if another budget exists for the new category/month/year combination
        var existingBudget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == request.UserId && 
                                    b.Id != request.Id &&
                                    b.CategoryId == request.BudgetDto.CategoryId &&
                                    b.Month == request.BudgetDto.Month &&
                                    b.Year == request.BudgetDto.Year, 
                                    cancellationToken);

        if (existingBudget != null)
        {
            throw new ConflictException("Budget", "category and period combination already exists");
        }

        // If category, month, or year changed, recalculate spent amount
        decimal spentAmount = budget.SpentAmount;
        if (budget.CategoryId != request.BudgetDto.CategoryId || 
            budget.Month != request.BudgetDto.Month || 
            budget.Year != request.BudgetDto.Year)
        {
            spentAmount = await CalculateSpentAmount(request.BudgetDto.CategoryId, request.UserId, 
                                                   request.BudgetDto.Month, request.BudgetDto.Year, cancellationToken);
        }

        // Update budget properties
        budget.Amount = request.BudgetDto.Amount;
        budget.SpentAmount = spentAmount;
        budget.Month = request.BudgetDto.Month;
        budget.Year = request.BudgetDto.Year;
        budget.CategoryId = request.BudgetDto.CategoryId;
        budget.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new BudgetDto
        {
            Id = budget.Id,
            Amount = budget.Amount,
            SpentAmount = budget.SpentAmount,
            RemainingAmount = budget.RemainingAmount,
            PercentageUsed = budget.PercentageUsed,
            Month = budget.Month,
            Year = budget.Year,
            CategoryId = budget.CategoryId,
            CategoryName = newCategory.Name,
            CategoryColor = newCategory.Color,
            CreatedAt = budget.CreatedAt,
            UpdatedAt = budget.UpdatedAt
        };
    }

    private async Task<decimal> CalculateSpentAmount(int categoryId, int userId, int month, int year, 
                                                   CancellationToken cancellationToken)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var spentAmount = await _context.Transactions
            .Where(t => t.UserId == userId && 
                       t.CategoryId == categoryId && 
                       t.Type == TransactionType.Expense &&
                       t.Date >= startDate && 
                       t.Date <= endDate)
            .SumAsync(t => t.Amount, cancellationToken);

        return spentAmount;
    }
}