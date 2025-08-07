using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Transactions.Commands;

public record UpdateTransactionCommand(int Id, UpdateTransactionDto TransactionDto, int UserId) : IRequest<TransactionDto>;

public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, TransactionDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateTransactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransactionDto> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId, cancellationToken);

        if (transaction == null)
        {
            throw new NotFoundException("Transaction", request.Id);
        }

        // Verify that the new category belongs to the user
        var newCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.TransactionDto.CategoryId && c.UserId == request.UserId, 
                                cancellationToken);

        if (newCategory == null)
        {
            throw new NotFoundException("Category", request.TransactionDto.CategoryId);
        }

        // Store old values for budget update
        var oldAmount = transaction.Amount;
        var oldType = transaction.Type;
        var oldCategoryId = transaction.CategoryId;
        var oldDate = transaction.Date;

        // Update transaction properties
        transaction.Amount = request.TransactionDto.Amount;
        transaction.Description = request.TransactionDto.Description;
        transaction.Date = request.TransactionDto.Date;
        transaction.Type = request.TransactionDto.Type;
        transaction.CategoryId = request.TransactionDto.CategoryId;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Update budget spent amounts
        await UpdateBudgetsForTransactionChange(oldAmount, oldType, oldCategoryId, oldDate,
                                               request.TransactionDto.Amount, request.TransactionDto.Type,
                                               request.TransactionDto.CategoryId, request.TransactionDto.Date,
                                               request.UserId, cancellationToken);

        return new TransactionDto
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Description = transaction.Description,
            Date = transaction.Date,
            Type = transaction.Type,
            CategoryId = transaction.CategoryId,
            CategoryName = newCategory.Name,
            CategoryColor = newCategory.Color,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt
        };
    }

    private async Task UpdateBudgetsForTransactionChange(
        decimal oldAmount, TransactionType oldType, int oldCategoryId, DateTime oldDate,
        decimal newAmount, TransactionType newType, int newCategoryId, DateTime newDate,
        int userId, CancellationToken cancellationToken)
    {
        // Revert old expense from budget
        if (oldType == TransactionType.Expense)
        {
            await UpdateBudgetSpentAmount(oldCategoryId, userId, oldDate, -oldAmount, cancellationToken);
        }

        // Add new expense to budget
        if (newType == TransactionType.Expense)
        {
            await UpdateBudgetSpentAmount(newCategoryId, userId, newDate, newAmount, cancellationToken);
        }
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