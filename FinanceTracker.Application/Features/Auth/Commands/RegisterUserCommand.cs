using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace FinanceTracker.Application.Features.Auth.Commands;

public record RegisterUserCommand(RegisterUserDto RegisterDto) : IRequest<AuthResponseDto>;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHashingService _passwordService;
    private readonly IJwtTokenService _tokenService;

    public RegisterUserCommandHandler(
        IApplicationDbContext context, 
        IPasswordHashingService passwordService,
        IJwtTokenService tokenService)
    {
        _context = context;
        _passwordService = passwordService;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Check if user already exists (case-insensitive)
        var normalizedEmail = request.RegisterDto.Email.ToLower();
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, 
                                 cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        // Create new user
        var user = new User
        {
            Email = request.RegisterDto.Email,
            FirstName = request.RegisterDto.FirstName,
            LastName = request.RegisterDto.LastName,
            PasswordHash = _passwordService.HashPassword(request.RegisterDto.Password)
        };

        _context.AddUser(user);
        await _context.SaveChangesAsync(cancellationToken);

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