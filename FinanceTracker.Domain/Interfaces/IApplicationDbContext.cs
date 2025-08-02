using FinanceTracker.Domain.Entities;

namespace FinanceTracker.Domain.Interfaces;

public interface IApplicationDbContext
{
    IQueryable<User> Users { get; }
    IQueryable<Transaction> Transactions { get; }
    IQueryable<Category> Categories { get; }
    IQueryable<Budget> Budgets { get; }
    
    void AddUser(User user);
    void AddTransaction(Transaction transaction);
    void AddCategory(Category category);
    void AddBudget(Budget budget);
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}