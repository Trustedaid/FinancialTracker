using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public class Transaction : BaseEntity
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TransactionType Type { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
}

public enum TransactionType
{
    Income = 1,
    Expense = 2
}