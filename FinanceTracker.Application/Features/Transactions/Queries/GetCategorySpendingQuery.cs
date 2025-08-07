using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Queries;

public record GetCategorySpendingQuery(int Year, int Month, int UserId) : IRequest<List<CategorySpendingDto>>;

public class GetCategorySpendingQueryHandler : IRequestHandler<GetCategorySpendingQuery, List<CategorySpendingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategorySpendingQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategorySpendingDto>> Handle(GetCategorySpendingQuery request, CancellationToken cancellationToken)
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

        // Get expense transactions grouped by category
        var categorySpending = await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == request.UserId &&
                       t.Type == TransactionType.Expense &&
                       t.Date >= startDate && 
                       t.Date <= endDate)
            .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Category.Color })
            .Select(g => new CategorySpendingDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                CategoryColor = g.Key.Color,
                TotalAmount = g.Sum(t => t.Amount),
                TransactionCount = g.Count(),
                Percentage = 0 // Will be calculated after getting total
            })
            .ToListAsync(cancellationToken);

        // Calculate percentages
        var totalSpending = categorySpending.Sum(c => c.TotalAmount);
        if (totalSpending > 0)
        {
            foreach (var category in categorySpending)
            {
                category.Percentage = Math.Round((category.TotalAmount / totalSpending) * 100, 2);
            }
        }

        return categorySpending.OrderByDescending(c => c.TotalAmount).ToList();
    }
}