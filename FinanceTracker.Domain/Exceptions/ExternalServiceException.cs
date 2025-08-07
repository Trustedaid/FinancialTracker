namespace FinanceTracker.Domain.Exceptions;

public class ExternalServiceException : BaseException
{
    public string ServiceName { get; }

    public ExternalServiceException(
        string serviceName,
        string userMessage = "External service temporarily unavailable",
        string? technicalMessage = null,
        Exception? innerException = null,
        Dictionary<string, object>? context = null)
        : base(
            "EXTERNAL_SERVICE_ERROR", 
            userMessage, 
            technicalMessage, 
            innerException,
            context ?? new Dictionary<string, object> { { "ServiceName", serviceName } })
    {
        ServiceName = serviceName;
    }
}