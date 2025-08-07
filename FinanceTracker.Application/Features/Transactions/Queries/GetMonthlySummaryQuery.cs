using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Queries;

public record GetMonthlySummaryQuery(int Year, int Month, int UserId) : IRequest<MonthlySummaryDto>;

public class GetMonthlySummaryQueryHandler : IRequestHandler<GetMonthlySummaryQuery, MonthlySummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetMonthlySummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MonthlySummaryDto> Handle(GetMonthlySummaryQuery request, CancellationToken cancellationToken)
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

        // Calculate start and end dates for the month
        var startDate = new DateTime(request.Year, request.Month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        // Query transactions for the specified month and user
        var monthTransactions = await _context.Transactions
            .Where(t => t.UserId == request.UserId &&
                       t.Date >= startDate && 
                       t.Date <= endDate)
            .ToListAsync(cancellationToken);

        // Calculate totals
        var totalIncome = monthTransactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var totalExpense = monthTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        var balance = totalIncome - totalExpense;

        return new MonthlySummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            Balance = balance,
            Month = request.Month,
            Year = request.Year
        };
    }
}