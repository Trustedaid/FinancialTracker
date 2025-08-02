using FinanceTracker.Application.Features.Budgets.DTOs;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Budgets.Queries;

public record GetBudgetsQuery(BudgetFilterDto Filter, int UserId) : IRequest<List<BudgetDto>>;

public class GetBudgetsQueryHandler : IRequestHandler<GetBudgetsQuery, List<BudgetDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBudgetsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BudgetDto>> Handle(GetBudgetsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == request.UserId);

        // Apply filters
        if (request.Filter.CategoryId.HasValue)
        {
            query = query.Where(b => b.CategoryId == request.Filter.CategoryId.Value);
        }

        if (request.Filter.Month.HasValue)
        {
            query = query.Where(b => b.Month == request.Filter.Month.Value);
        }

        if (request.Filter.Year.HasValue)
        {
            query = query.Where(b => b.Year == request.Filter.Year.Value);
        }

        var budgets = await query
            .OrderByDescending(b => b.Year)
            .ThenByDescending(b => b.Month)
            .ThenBy(b => b.Category.Name)
            .Select(b => new BudgetDto
            {
                Id = b.Id,
                Amount = b.Amount,
                SpentAmount = b.SpentAmount,
                RemainingAmount = b.RemainingAmount,
                PercentageUsed = b.PercentageUsed,
                Month = b.Month,
                Year = b.Year,
                CategoryId = b.CategoryId,
                CategoryName = b.Category.Name,
                CategoryColor = b.Category.Color,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return budgets;
    }
}