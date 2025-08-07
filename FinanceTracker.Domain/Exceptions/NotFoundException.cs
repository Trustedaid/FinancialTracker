namespace FinanceTracker.Domain.Exceptions;

public class NotFoundException : BaseException
{
    public NotFoundException(string entityName, object identifier)
        : base(
            "NOT_FOUND", 
            $"{entityName} not found", 
            $"{entityName} with identifier '{identifier}' was not found",
            null,
            new Dictionary<string, object> 
            { 
                { "EntityName", entityName }, 
                { "Identifier", identifier } 
            })
    {
    }
}