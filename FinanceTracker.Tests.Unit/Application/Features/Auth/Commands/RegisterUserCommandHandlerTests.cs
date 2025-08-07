using FinanceTracker.Application.Features.Auth.Commands;
using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using Xunit;

namespace FinanceTracker.Tests.Unit.Application.Features.Auth.Commands;

public class RegisterUserCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<IPasswordHashingService> _mockPasswordService;
    private readonly Mock<IJwtTokenService> _mockTokenService;
    private readonly RegisterUserCommandHandler _handler;
    private readonly List<User> _users;

    public RegisterUserCommandHandlerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockPasswordService = new Mock<IPasswordHashingService>();
        _mockTokenService = new Mock<IJwtTokenService>();
        _users = new List<User>();

        SetupMockDbSet();

        _handler = new RegisterUserCommandHandler(
            _mockContext.Object,
            _mockPasswordService.Object,
            _mockTokenService.Object);
    }

    private void SetupMockDbSet()
    {
        var mockUserDbSet = _users.AsQueryable().BuildMockDbSet();
        _mockContext.Setup(x => x.Users).Returns(mockUserDbSet.Object);
    }

    [Fact]
    public async Task Handle_Should_Register_New_User_Successfully()
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var command = new RegisterUserCommand(registerDto);
        var hashedPassword = "hashed_password_123";
        var token = "jwt_token_123";

        _mockPasswordService.Setup(x => x.HashPassword(registerDto.Password))
            .Returns(hashedPassword);

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(token);

        _mockContext.Setup(x => x.AddUser(It.IsAny<User>()));
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(token);
        result.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddHours(24), TimeSpan.FromMinutes(1));
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(registerDto.Email);
        result.User.FirstName.Should().Be(registerDto.FirstName);
        result.User.LastName.Should().Be(registerDto.LastName);

        _mockPasswordService.Verify(x => x.HashPassword(registerDto.Password), Times.Once);
        _mockTokenService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Once);
        _mockContext.Verify(x => x.AddUser(It.IsAny<User>()), Times.Once);
        _mockContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_InvalidOperationException_When_User_Already_Exists()
    {
        // Arrange
        var existingUser = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "Existing",
            LastName = "User"
        };

        _users.Add(existingUser);
        SetupMockDbSet();

        var registerDto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var command = new RegisterUserCommand(registerDto);

        // Act
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("User with this email already exists.");

        _mockPasswordService.Verify(x => x.HashPassword(It.IsAny<string>()), Times.Never);
        _mockTokenService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _mockContext.Verify(x => x.AddUser(It.IsAny<User>()), Times.Never);
        _mockContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Create_User_With_Correct_Properties()
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "newuser@example.com",
            Password = "securepassword",
            FirstName = "Jane",
            LastName = "Smith"
        };

        var command = new RegisterUserCommand(registerDto);
        var hashedPassword = "hashed_secure_password";
        var token = "new_jwt_token";

        User capturedUser = null!;

        _mockPasswordService.Setup(x => x.HashPassword(registerDto.Password))
            .Returns(hashedPassword);

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(token);

        _mockContext.Setup(x => x.AddUser(It.IsAny<User>()))
            .Callback<User>(user => capturedUser = user);

        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedUser.Should().NotBeNull();
        capturedUser.Email.Should().Be(registerDto.Email);
        capturedUser.FirstName.Should().Be(registerDto.FirstName);
        capturedUser.LastName.Should().Be(registerDto.LastName);
        capturedUser.PasswordHash.Should().Be(hashedPassword);
    }

    [Fact]
    public async Task Handle_Should_Pass_Cancellation_Token_To_Database_Operations()
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var command = new RegisterUserCommand(registerDto);
        var cancellationToken = new CancellationToken();

        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        _mockContext.Setup(x => x.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        await _handler.Handle(command, cancellationToken);

        // Assert
        _mockContext.Verify(x => x.SaveChangesAsync(cancellationToken), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData(null)]
    public async Task Handle_Should_Handle_Edge_Case_Email_Values(string email)
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = email ?? string.Empty,
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var command = new RegisterUserCommand(registerDto);

        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.Email.Should().Be(email ?? string.Empty);
    }

    [Fact]
    public async Task Handle_Should_Generate_Correct_ExpiresAt_Time()
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var command = new RegisterUserCommand(registerDto);
        var beforeExecution = DateTime.UtcNow;

        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterExecution = DateTime.UtcNow;

        // Assert
        result.ExpiresAt.Should().BeAfter(beforeExecution.AddHours(23).AddMinutes(59));
        result.ExpiresAt.Should().BeBefore(afterExecution.AddHours(24).AddMinutes(1));
    }

    [Fact]
    public async Task Handle_Should_Register_Turkish_User_Successfully()
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "ahmet@örnek.com",
            Password = "güvenliŞifre123",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        var command = new RegisterUserCommand(registerDto);
        var hashedPassword = "hashed_turkish_password";
        var token = "turkish_jwt_token";

        User capturedUser = null!;

        _mockPasswordService.Setup(x => x.HashPassword(registerDto.Password))
            .Returns(hashedPassword);

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(token);

        _mockContext.Setup(x => x.AddUser(It.IsAny<User>()))
            .Callback<User>(user => capturedUser = user);

        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(token);
        result.User.Email.Should().Be("ahmet@örnek.com");
        result.User.FirstName.Should().Be("Ahmet");
        result.User.LastName.Should().Be("Yılmaz");

        // Verify captured user has Turkish characters preserved
        capturedUser.Should().NotBeNull();
        capturedUser.Email.Should().Be("ahmet@örnek.com");
        capturedUser.FirstName.Should().Be("Ahmet");
        capturedUser.LastName.Should().Be("Yılmaz");
        capturedUser.PasswordHash.Should().Be(hashedPassword);

        _mockPasswordService.Verify(x => x.HashPassword("güvenliŞifre123"), Times.Once);
    }

    [Theory]
    [InlineData("Çağlar", "Özgür")]
    [InlineData("Şeyda", "Gökçe")]
    [InlineData("İsmail", "Ünlü")]
    [InlineData("Müge", "İğde")]
    public async Task Handle_Should_Handle_Turkish_Character_Names(string firstName, string lastName)
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = firstName,
            LastName = lastName
        };

        var command = new RegisterUserCommand(registerDto);

        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.FirstName.Should().Be(firstName);
        result.User.LastName.Should().Be(lastName);
    }

    [Fact]
    public async Task Handle_Should_Throw_Exception_For_Duplicate_Turkish_Email()
    {
        // Arrange
        var existingUser = new User
        {
            Id = 1,
            Email = "kullanıcı@örnek.com",
            FirstName = "Existing",
            LastName = "User"
        };

        _users.Add(existingUser);
        SetupMockDbSet();

        var registerDto = new RegisterUserDto
        {
            Email = "kullanıcı@örnek.com", // Same Turkish email
            Password = "şifre123",
            FirstName = "Yeni",
            LastName = "Kullanıcı"
        };

        var command = new RegisterUserCommand(registerDto);

        // Act
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("User with this email already exists.");
    }

    [Fact]
    public async Task Handle_Should_Set_User_Id_In_AuthResponse()
    {
        // Arrange
        var registerDto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var command = new RegisterUserCommand(registerDto);
        User capturedUser = null!;

        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        _mockContext.Setup(x => x.AddUser(It.IsAny<User>()))
            .Callback<User>(user => 
            {
                user.Id = 42; // Simulate database assigning ID
                capturedUser = user;
            });

        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.User.Id.Should().Be(42);
        capturedUser.Id.Should().Be(42);
    }
}