using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Commands;

public record DeleteTransactionCommand(int Id, int UserId) : IRequest<bool>;

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteTransactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId, cancellationToken);

        if (transaction == null)
        {
            throw new NotFoundException("Transaction", request.Id);
        }

        // Store values for budget update before deletion
        var amount = transaction.Amount;
        var type = transaction.Type;
        var categoryId = transaction.CategoryId;
        var date = transaction.Date;

        // Use Entity Framework's change tracking to mark for deletion
        var dbContext = _context as DbContext;
        if (dbContext != null)
        {
            dbContext.Entry(transaction).State = EntityState.Deleted;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Update budget spent amount if it was an expense
        if (type == TransactionType.Expense)
        {
            await UpdateBudgetSpentAmount(categoryId, request.UserId, date, -amount, cancellationToken);
        }

        return true;
    }

    private async Task UpdateBudgetSpentAmount(int categoryId, int userId, DateTime transactionDate, 
                                             decimal amount, CancellationToken cancellationToken)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.CategoryId == categoryId && 
                                    b.UserId == userId &&
                                    b.Month == transactionDate.Month &&
                                    b.Year == transactionDate.Year, 
                                    cancellationToken);

        if (budget != null)
        {
            budget.SpentAmount += amount;
            budget.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}