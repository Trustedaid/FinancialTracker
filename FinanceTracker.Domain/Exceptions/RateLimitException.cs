namespace FinanceTracker.Domain.Exceptions;

public class RateLimitException : BaseException
{
    public int RetryAfterSeconds { get; }

    public RateLimitException(int retryAfterSeconds = 60)
        : base(
            "RATE_LIMIT_EXCEEDED", 
            "Too many requests. Please try again later.", 
            $"Rate limit exceeded. Retry after {retryAfterSeconds} seconds",
            null,
            new Dictionary<string, object> { { "RetryAfterSeconds", retryAfterSeconds } })
    {
        RetryAfterSeconds = retryAfterSeconds;
    }
}