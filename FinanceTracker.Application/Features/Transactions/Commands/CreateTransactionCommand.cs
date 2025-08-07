using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Commands;

public record CreateTransactionCommand(CreateTransactionDto TransactionDto, int UserId) : IRequest<TransactionDto>;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly IApplicationDbContext _context;

    public CreateTransactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        // Verify that the category belongs to the user
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.TransactionDto.CategoryId && c.UserId == request.UserId, 
                                cancellationToken);

        if (category == null)
        {
            throw new NotFoundException("Category", request.TransactionDto.CategoryId);
        }

        var transaction = new Transaction
        {
            Amount = request.TransactionDto.Amount,
            Description = request.TransactionDto.Description,
            Date = request.TransactionDto.Date,
            Type = request.TransactionDto.Type,
            UserId = request.UserId,
            CategoryId = request.TransactionDto.CategoryId
        };

        _context.AddTransaction(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        // Update budget spent amount if it's an expense
        if (request.TransactionDto.Type == TransactionType.Expense)
        {
            await UpdateBudgetSpentAmount(request.TransactionDto.CategoryId, request.UserId, 
                                        request.TransactionDto.Date, request.TransactionDto.Amount, cancellationToken);
        }

        return new TransactionDto
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Description = transaction.Description,
            Date = transaction.Date,
            Type = transaction.Type,
            CategoryId = transaction.CategoryId,
            CategoryName = category.Name,
            CategoryColor = category.Color,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt
        };
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