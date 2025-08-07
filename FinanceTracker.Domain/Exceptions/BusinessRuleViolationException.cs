namespace FinanceTracker.Domain.Exceptions;

public class BusinessRuleViolationException : BaseException
{
    public BusinessRuleViolationException(
        string rule, 
        string userMessage, 
        string? technicalMessage = null,
        Dictionary<string, object>? context = null)
        : base($"BUSINESS_RULE_{rule.ToUpper()}", userMessage, technicalMessage, null, context)
    {
    }
}