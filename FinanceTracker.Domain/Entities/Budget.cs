using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public class Budget : BaseEntity
{
    public decimal Amount { get; set; }
    public decimal SpentAmount { get; set; } = 0;
    public int Month { get; set; }
    public int Year { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
    
    // Calculated properties
    public decimal RemainingAmount
    {
        get
        {
            try
            {
                return Amount - SpentAmount;
            }
            catch (OverflowException)
            {
                // Handle overflow cases gracefully
                if (Amount == decimal.MaxValue && SpentAmount < 0)
                    return decimal.MaxValue;
                if (Amount == decimal.MinValue && SpentAmount > 0)
                    return decimal.MinValue;
                return 0;
            }
        }
    }
    
    public decimal PercentageUsed => Amount > 0 ? (SpentAmount / Amount) * 100 : 0;
}