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
            throw new KeyNotFoundException("Kategori bulunamadı.");
        }

        // Check if category has associated transactions or budgets
        if (category.Transactions.Any())
        {
            throw new InvalidOperationException("Bu kategoriye ait işlemler bulunduğu için silinemez.");
        }

        if (category.Budgets.Any())
        {
            throw new InvalidOperationException("Bu kategoriye ait bütçeler bulunduğu için silinemez.");
        }

        // Cannot delete default categories
        if (category.IsDefault)
        {
            throw new InvalidOperationException("Varsayılan kategoriler silinemez.");
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