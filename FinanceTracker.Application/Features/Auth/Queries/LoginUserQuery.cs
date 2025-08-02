using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace FinanceTracker.Application.Features.Auth.Queries;

public record LoginUserQuery(LoginUserDto LoginDto) : IRequest<AuthResponseDto>;

public class LoginUserQueryHandler : IRequestHandler<LoginUserQuery, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHashingService _passwordService;
    private readonly IJwtTokenService _tokenService;

    public LoginUserQueryHandler(
        IApplicationDbContext context,
        IPasswordHashingService passwordService,
        IJwtTokenService tokenService)
    {
        _context = context;
        _passwordService = passwordService;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(LoginUserQuery request, CancellationToken cancellationToken)
    {
        // Find user by email (case-insensitive)
        var normalizedEmail = request.LoginDto.Email.ToLower();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, 
                                 cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Verify password
        if (!_passwordService.VerifyPassword(request.LoginDto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Generate token
        var token = _tokenService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            }
        };
    }
}