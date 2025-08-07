using System.Collections.Concurrent;
using FinanceTracker.Domain.Exceptions;

namespace FinanceTracker.API.Middleware;

public class CircuitBreakerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CircuitBreakerMiddleware> _logger;
    private static readonly ConcurrentDictionary<string, CircuitBreakerState> CircuitBreakers = new();
    
    private const int FailureThreshold = 5;
    private const int TimeoutSeconds = 30;

    public CircuitBreakerMiddleware(RequestDelegate next, ILogger<CircuitBreakerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = GetEndpointKey(context);
        var circuitBreaker = CircuitBreakers.GetOrAdd(endpoint, _ => new CircuitBreakerState());

        if (circuitBreaker.State == CircuitState.Open)
        {
            if (DateTime.UtcNow < circuitBreaker.NextAttempt)
            {
                _logger.LogWarning("Circuit breaker is OPEN for endpoint {Endpoint}. Rejecting request.", endpoint);
                throw new ExternalServiceException("API", "Service temporarily unavailable due to repeated failures. Please try again later.");
            }
            
            circuitBreaker.State = CircuitState.HalfOpen;
            _logger.LogInformation("Circuit breaker transitioning to HALF-OPEN for endpoint {Endpoint}", endpoint);
        }

        try
        {
            await _next(context);
            
            if (circuitBreaker.State == CircuitState.HalfOpen)
            {
                circuitBreaker.Reset();
                _logger.LogInformation("Circuit breaker reset to CLOSED for endpoint {Endpoint}", endpoint);
            }
        }
        catch (Exception ex)
        {
            circuitBreaker.RecordFailure();
            
            if (circuitBreaker.FailureCount >= FailureThreshold)
            {
                circuitBreaker.Trip();
                _logger.LogWarning("Circuit breaker OPENED for endpoint {Endpoint} after {FailureCount} failures", endpoint, circuitBreaker.FailureCount);
            }
            
            throw;
        }
    }

    private static string GetEndpointKey(HttpContext context)
    {
        return $"{context.Request.Method}:{context.Request.Path}";
    }

    private class CircuitBreakerState
    {
        public CircuitState State { get; set; } = CircuitState.Closed;
        public int FailureCount { get; private set; }
        public DateTime NextAttempt { get; private set; }

        public void RecordFailure()
        {
            FailureCount++;
        }

        public void Reset()
        {
            FailureCount = 0;
            State = CircuitState.Closed;
        }

        public void Trip()
        {
            State = CircuitState.Open;
            NextAttempt = DateTime.UtcNow.AddSeconds(TimeoutSeconds);
        }
    }

    private enum CircuitState
    {
        Closed,
        Open,
        HalfOpen
    }
}