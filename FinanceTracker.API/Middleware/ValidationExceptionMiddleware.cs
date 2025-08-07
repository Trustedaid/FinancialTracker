using FluentValidation;
using System.Net;
using System.Text.Json;
using FinanceTracker.Domain.Exceptions;

namespace FinanceTracker.API.Middleware;

public class ValidationExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ValidationExceptionMiddleware> _logger;

    public ValidationExceptionMiddleware(RequestDelegate next, ILogger<ValidationExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error occurred: {Errors}", string.Join(", ", ex.Errors.Select(e => $"{e.PropertyName}: {e.ErrorMessage}")));
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (BaseException ex)
        {
            _logger.LogWarning(ex, "Business logic error occurred: {ErrorCode} - {UserMessage}", ex.ErrorCode, ex.UserMessage);
            await HandleBaseExceptionAsync(context, ex);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt from {RemoteIpAddress}", context.Connection.RemoteIpAddress);
            await HandleUnauthorizedExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            var correlationId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "An unhandled exception occurred. CorrelationId: {CorrelationId} | Path: {Path} | Method: {Method} | User: {User}", 
                correlationId, context.Request.Path, context.Request.Method, context.User?.Identity?.Name ?? "Anonymous");
            await HandleGenericExceptionAsync(context, ex, correlationId);
        }
    }

    private static async Task HandleValidationExceptionAsync(HttpContext context, ValidationException exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

        var errors = exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        var response = new
        {
            type = "validation_error",
            title = "Validation Error",
            status = 400,
            detail = "One or more validation errors occurred.",
            errors = errors,
            timestamp = DateTime.UtcNow,
            traceId = context.TraceIdentifier
        };

        var jsonResponse = JsonSerializer.Serialize(response, GetJsonOptions());
        await context.Response.WriteAsync(jsonResponse);
    }

    private static async Task HandleBaseExceptionAsync(HttpContext context, BaseException exception)
    {
        context.Response.ContentType = "application/json";
        
        context.Response.StatusCode = exception switch
        {
            NotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedException => (int)HttpStatusCode.Unauthorized,
            ConflictException => (int)HttpStatusCode.Conflict,
            BusinessRuleViolationException => (int)HttpStatusCode.BadRequest,
            RateLimitException rateLimitEx => AddRateLimitHeaders(context, rateLimitEx),
            ExternalServiceException => (int)HttpStatusCode.ServiceUnavailable,
            _ => (int)HttpStatusCode.BadRequest
        };

        var response = new
        {
            type = exception.ErrorCode.ToLower(),
            title = GetErrorTitle(exception),
            status = context.Response.StatusCode,
            detail = exception.UserMessage,
            context = exception.Context,
            timestamp = DateTime.UtcNow,
            traceId = context.TraceIdentifier
        };

        var jsonResponse = JsonSerializer.Serialize(response, GetJsonOptions());
        await context.Response.WriteAsync(jsonResponse);
    }

    private static async Task HandleUnauthorizedExceptionAsync(HttpContext context, UnauthorizedAccessException exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;

        var response = new
        {
            type = "unauthorized",
            title = "Unauthorized",
            status = 401,
            detail = "You are not authorized to access this resource.",
            timestamp = DateTime.UtcNow,
            traceId = context.TraceIdentifier
        };

        var jsonResponse = JsonSerializer.Serialize(response, GetJsonOptions());
        await context.Response.WriteAsync(jsonResponse);
    }

    private static async Task HandleGenericExceptionAsync(HttpContext context, Exception exception, string correlationId)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception switch
        {
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            TimeoutException => (int)HttpStatusCode.RequestTimeout,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var response = new
        {
            type = "server_error",
            title = "Internal Server Error",
            status = context.Response.StatusCode,
            detail = context.Response.StatusCode == 500 
                ? "An unexpected error occurred. Please try again later." 
                : exception.Message,
            correlationId = correlationId,
            timestamp = DateTime.UtcNow,
            traceId = context.TraceIdentifier
        };

        var jsonResponse = JsonSerializer.Serialize(response, GetJsonOptions());
        await context.Response.WriteAsync(jsonResponse);
    }

    private static int AddRateLimitHeaders(HttpContext context, RateLimitException rateLimitException)
    {
        context.Response.Headers.Add("Retry-After", rateLimitException.RetryAfterSeconds.ToString());
        context.Response.Headers.Add("X-RateLimit-Limit", "100");
        context.Response.Headers.Add("X-RateLimit-Remaining", "0");
        context.Response.Headers.Add("X-RateLimit-Reset", DateTimeOffset.UtcNow.AddSeconds(rateLimitException.RetryAfterSeconds).ToUnixTimeSeconds().ToString());
        return (int)HttpStatusCode.TooManyRequests;
    }

    private static string GetErrorTitle(BaseException exception) => exception switch
    {
        NotFoundException => "Resource Not Found",
        UnauthorizedException => "Unauthorized Access",
        ConflictException => "Conflict",
        BusinessRuleViolationException => "Business Rule Violation",
        RateLimitException => "Rate Limit Exceeded",
        ExternalServiceException => "Service Unavailable",
        _ => "Bad Request"
    };

    private static JsonSerializerOptions GetJsonOptions() => new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
}