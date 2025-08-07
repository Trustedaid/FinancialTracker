using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Queries;

public record GetMonthlyTrendsQuery(int MonthsBack, int UserId) : IRequest<List<MonthlyTrendDto>>;

public class GetMonthlyTrendsQueryHandler : IRequestHandler<GetMonthlyTrendsQuery, List<MonthlyTrendDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMonthlyTrendsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MonthlyTrendDto>> Handle(GetMonthlyTrendsQuery request, CancellationToken cancellationToken)
    {
        var monthsBack = Math.Max(1, Math.Min(24, request.MonthsBack)); // Limit between 1-24 months
        var endDate = DateTime.Now.Date;
        var startDate = endDate.AddMonths(-monthsBack).Date;

        var transactions = await _context.Transactions
            .Where(t => t.UserId == request.UserId &&
                       t.Date >= startDate && 
                       t.Date <= endDate)
            .ToListAsync(cancellationToken);

        var monthlyData = new List<MonthlyTrendDto>();
        var currentDate = startDate;

        while (currentDate <= endDate)
        {
            var monthStart = new DateTime(currentDate.Year, currentDate.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var monthTransactions = transactions.Where(t => t.Date >= monthStart && t.Date <= monthEnd);

            var income = monthTransactions
                .Where(t => t.Type == TransactionType.Income)
                .Sum(t => t.Amount);

            var expense = monthTransactions
                .Where(t => t.Type == TransactionType.Expense)
                .Sum(t => t.Amount);

            monthlyData.Add(new MonthlyTrendDto
            {
                Month = currentDate.Month,
                Year = currentDate.Year,
                Income = income,
                Expense = expense,
                Balance = income - expense
            });

            currentDate = currentDate.AddMonths(1);
        }

        return monthlyData.OrderBy(x => x.Year).ThenBy(x => x.Month).ToList();
    }
}