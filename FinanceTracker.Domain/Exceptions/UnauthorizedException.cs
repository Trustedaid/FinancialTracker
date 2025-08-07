namespace FinanceTracker.Domain.Exceptions;

public class UnauthorizedException : BaseException
{
    public UnauthorizedException(
        string reason = "Access denied", 
        string? technicalMessage = null,
        Dictionary<string, object>? context = null)
        : base("UNAUTHORIZED", reason, technicalMessage, null, context)
    {
    }
}