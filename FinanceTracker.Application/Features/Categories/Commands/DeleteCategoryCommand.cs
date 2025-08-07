using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Categories.Commands;

public record DeleteCategoryCommand(int Id, int UserId) : IRequest<bool>;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .Include(c => c.Transactions)
            .Include(c => c.Budgets)
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.UserId == request.UserId, cancellationToken);

        if (category == null)
        {
            throw new NotFoundException("Category", request.Id);
        }

        // Check if category has associated transactions or budgets
        if (category.Transactions.Any())
        {
            throw new BusinessRuleViolationException("CATEGORY_HAS_TRANSACTIONS", "Category cannot be deleted because it has associated transactions");
        }

        if (category.Budgets.Any())
        {
            throw new BusinessRuleViolationException("CATEGORY_HAS_BUDGETS", "Category cannot be deleted because it has associated budgets");
        }

        // Cannot delete default categories
        if (category.IsDefault)
        {
            throw new BusinessRuleViolationException("DEFAULT_CATEGORY_READONLY", "Default categories cannot be deleted");
        }

        // Use Entity Framework's change tracking to mark for deletion
        var dbContext = _context as DbContext;
        if (dbContext != null)
        {
            dbContext.Entry(category).State = EntityState.Deleted;
        }
        
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}