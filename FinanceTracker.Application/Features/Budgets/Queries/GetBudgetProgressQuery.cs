using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Budgets.Queries;

public record GetBudgetProgressQuery(int Year, int Month, int UserId) : IRequest<List<BudgetProgressDto>>;

public class GetBudgetProgressQueryHandler : IRequestHandler<GetBudgetProgressQuery, List<BudgetProgressDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBudgetProgressQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BudgetProgressDto>> Handle(GetBudgetProgressQuery request, CancellationToken cancellationToken)
    {
        // Validate input parameters
        if (request.Month < 1 || request.Month > 12)
        {
            throw new BusinessRuleViolationException("INVALID_MONTH", "Month must be between 1 and 12");
        }

        if (request.Year < 1900 || request.Year > DateTime.Now.Year + 10)
        {
            throw new BusinessRuleViolationException("INVALID_YEAR", $"Year must be between 1900 and {DateTime.Now.Year + 10}");
        }

        var startDate = new DateTime(request.Year, request.Month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        // Get budgets for the specified month
        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == request.UserId &&
                       b.Month == request.Month &&
                       b.Year == request.Year)
            .ToListAsync(cancellationToken);

        var budgetProgress = new List<BudgetProgressDto>();

        foreach (var budget in budgets)
        {
            // Calculate spent amount for this category in this month
            var spentAmount = await _context.Transactions
                .Where(t => t.UserId == request.UserId &&
                           t.CategoryId == budget.CategoryId &&
                           t.Type == TransactionType.Expense &&
                           t.Date >= startDate && 
                           t.Date <= endDate)
                .SumAsync(t => t.Amount, cancellationToken);

            var remainingAmount = budget.Amount - spentAmount;
            var progressPercentage = budget.Amount > 0 ? Math.Round((spentAmount / budget.Amount) * 100, 2) : 0;
            var isOverBudget = spentAmount > budget.Amount;

            budgetProgress.Add(new BudgetProgressDto
            {
                BudgetId = budget.Id,
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                CategoryColor = budget.Category.Color,
                BudgetAmount = budget.Amount,
                SpentAmount = spentAmount,
                RemainingAmount = remainingAmount,
                ProgressPercentage = progressPercentage,
                IsOverBudget = isOverBudget,
                Month = request.Month,
                Year = request.Year
            });
        }

        return budgetProgress.OrderByDescending(b => b.ProgressPercentage).ToList();
    }
}