namespace FinanceTracker.Domain.Exceptions;

public class ConflictException : BaseException
{
    public ConflictException(
        string resource,
        string reason,
        string? technicalMessage = null,
        Dictionary<string, object>? context = null)
        : base(
            "CONFLICT", 
            $"Conflict with {resource}: {reason}", 
            technicalMessage,
            null,
            context ?? new Dictionary<string, object> { { "Resource", resource }, { "Reason", reason } })
    {
    }
}