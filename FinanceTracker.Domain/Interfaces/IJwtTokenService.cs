using FinanceTracker.Domain.Entities;

namespace FinanceTracker.Domain.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}