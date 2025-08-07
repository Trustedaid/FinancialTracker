using FinanceTracker.Application.Features.Budgets.DTOs;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Budgets.Queries;

public record GetBudgetByIdQuery(int Id, int UserId) : IRequest<BudgetDto>;

public class GetBudgetByIdQueryHandler : IRequestHandler<GetBudgetByIdQuery, BudgetDto>
{
    private readonly IApplicationDbContext _context;

    public GetBudgetByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BudgetDto> Handle(GetBudgetByIdQuery request, CancellationToken cancellationToken)
    {
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.Id == request.Id && b.UserId == request.UserId)
            .Select(b => new BudgetDto
            {
                Id = b.Id,
                Amount = b.Amount,
                SpentAmount = b.SpentAmount,
                RemainingAmount = b.Amount - b.SpentAmount,
                PercentageUsed = b.Amount > 0 ? (b.SpentAmount / b.Amount) * 100 : 0,
                Month = b.Month,
                Year = b.Year,
                CategoryId = b.CategoryId,
                CategoryName = b.Category.Name,
                CategoryColor = b.Category.Color,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (budget == null)
        {
            throw new KeyNotFoundException("Bütçe bulunamadı.");
        }

        return budget;
    }
}