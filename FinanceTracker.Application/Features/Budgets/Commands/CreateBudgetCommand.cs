using FinanceTracker.Application.Features.Budgets.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Budgets.Commands;

public record CreateBudgetCommand(CreateBudgetDto BudgetDto, int UserId) : IRequest<BudgetDto>;

public class CreateBudgetCommandHandler : IRequestHandler<CreateBudgetCommand, BudgetDto>
{
    private readonly IApplicationDbContext _context;

    public CreateBudgetCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BudgetDto> Handle(CreateBudgetCommand request, CancellationToken cancellationToken)
    {
        // Verify that the category belongs to the user
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.BudgetDto.CategoryId && c.UserId == request.UserId, 
                                cancellationToken);

        if (category == null)
        {
            throw new NotFoundException("Category", request.BudgetDto.CategoryId);
        }

        // Check if budget already exists for this category/month/year combination
        var existingBudget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == request.UserId && 
                                    b.CategoryId == request.BudgetDto.CategoryId &&
                                    b.Month == request.BudgetDto.Month &&
                                    b.Year == request.BudgetDto.Year, 
                                    cancellationToken);

        if (existingBudget != null)
        {
            throw new ConflictException("Budget", "category and period combination already exists");
        }

        // Calculate spent amount for the specified month/year
        var spentAmount = await CalculateSpentAmount(request.BudgetDto.CategoryId, request.UserId, 
                                                   request.BudgetDto.Month, request.BudgetDto.Year, cancellationToken);

        var budget = new Budget
        {
            Amount = request.BudgetDto.Amount,
            SpentAmount = spentAmount,
            Month = request.BudgetDto.Month,
            Year = request.BudgetDto.Year,
            UserId = request.UserId,
            CategoryId = request.BudgetDto.CategoryId
        };

        _context.AddBudget(budget);
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
            CategoryName = category.Name,
            CategoryColor = category.Color,
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