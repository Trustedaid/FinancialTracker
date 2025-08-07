namespace FinanceTracker.Domain.Exceptions;

public abstract class BaseException : Exception
{
    public string ErrorCode { get; }
    public string UserMessage { get; }
    public Dictionary<string, object> Context { get; }

    protected BaseException(
        string errorCode, 
        string userMessage, 
        string? technicalMessage = null, 
        Exception? innerException = null,
        Dictionary<string, object>? context = null) 
        : base(technicalMessage ?? userMessage, innerException)
    {
        ErrorCode = errorCode;
        UserMessage = userMessage;
        Context = context ?? new Dictionary<string, object>();
    }
}