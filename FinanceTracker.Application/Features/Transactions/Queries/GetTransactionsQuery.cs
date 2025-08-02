using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Queries;

public record GetTransactionsQuery(TransactionFilterDto Filter, int UserId) : IRequest<PaginatedTransactionsDto>;

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, PaginatedTransactionsDto>
{
    private readonly IApplicationDbContext _context;

    public GetTransactionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedTransactionsDto> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == request.UserId);

        // Apply filters
        if (request.Filter.Type.HasValue)
        {
            query = query.Where(t => t.Type == request.Filter.Type.Value);
        }

        if (request.Filter.CategoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == request.Filter.CategoryId.Value);
        }

        if (request.Filter.StartDate.HasValue)
        {
            query = query.Where(t => t.Date >= request.Filter.StartDate.Value);
        }

        if (request.Filter.EndDate.HasValue)
        {
            query = query.Where(t => t.Date <= request.Filter.EndDate.Value);
        }

        // Get total count for pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var transactions = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((request.Filter.Page - 1) * request.Filter.PageSize)
            .Take(request.Filter.PageSize)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                Date = t.Date,
                Type = t.Type,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryColor = t.Category.Color,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling((double)totalCount / request.Filter.PageSize);

        return new PaginatedTransactionsDto
        {
            Transactions = transactions,
            TotalCount = totalCount,
            Page = request.Filter.Page,
            PageSize = request.Filter.PageSize,
            TotalPages = totalPages
        };
    }
}