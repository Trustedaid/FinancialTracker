using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Budgets.Commands;

public record DeleteBudgetCommand(int Id, int UserId) : IRequest<bool>;

public class DeleteBudgetCommandHandler : IRequestHandler<DeleteBudgetCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteBudgetCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == request.Id && b.UserId == request.UserId, cancellationToken);

        if (budget == null)
        {
            throw new KeyNotFoundException("Bütçe bulunamadı.");
        }

        // Use Entity Framework's change tracking to mark for deletion
        var dbContext = _context as DbContext;
        if (dbContext != null)
        {
            dbContext.Entry(budget).State = EntityState.Deleted;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}