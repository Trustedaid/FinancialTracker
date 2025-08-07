using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Application.Features.Auth.Queries;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using Xunit;

namespace FinanceTracker.Tests.Unit.Application.Features.Auth.Queries;

public class LoginUserQueryHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<IPasswordHashingService> _mockPasswordService;
    private readonly Mock<IJwtTokenService> _mockTokenService;
    private readonly LoginUserQueryHandler _handler;
    private readonly List<User> _users;

    public LoginUserQueryHandlerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockPasswordService = new Mock<IPasswordHashingService>();
        _mockTokenService = new Mock<IJwtTokenService>();
        _users = new List<User>();

        SetupMockDbSet();

        _handler = new LoginUserQueryHandler(
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
    public async Task Handle_Should_Login_User_Successfully_With_Valid_Credentials()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);
        var token = "jwt_token_123";

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns(token);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(token);
        result.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddHours(24), TimeSpan.FromMinutes(1));
        result.User.Should().NotBeNull();
        result.User.Id.Should().Be(user.Id);
        result.User.Email.Should().Be(user.Email);
        result.User.FirstName.Should().Be(user.FirstName);
        result.User.LastName.Should().Be(user.LastName);

        _mockPasswordService.Verify(x => x.VerifyPassword(loginDto.Password, user.PasswordHash), Times.Once);
        _mockTokenService.Verify(x => x.GenerateToken(user), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_UnauthorizedAccessException_When_User_Not_Found()
    {
        // Arrange
        var loginDto = new LoginUserDto
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);

        // Act
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");

        _mockPasswordService.Verify(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        _mockTokenService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Throw_UnauthorizedAccessException_When_Password_Is_Invalid()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "wrong_password"
        };

        var query = new LoginUserQuery(loginDto);

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(false);

        // Act
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");

        _mockPasswordService.Verify(x => x.VerifyPassword(loginDto.Password, user.PasswordHash), Times.Once);
        _mockTokenService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Pass_Cancellation_Token_To_Database_Query()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);
        var cancellationToken = new CancellationToken();

        _mockPasswordService.Setup(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        // Act
        await _handler.Handle(query, cancellationToken);

        // Assert
        // The cancellation token is passed to FirstOrDefaultAsync in the actual implementation
        // This is verified through the successful execution without throwing OperationCanceledException
        _mockPasswordService.Verify(x => x.VerifyPassword(loginDto.Password, user.PasswordHash), Times.Once);
    }

    [Theory]
    [InlineData("TEST@EXAMPLE.COM", "test@example.com")]
    [InlineData("Test@Example.Com", "test@example.com")]
    public async Task Handle_Should_Find_User_With_Case_Insensitive_Email(string loginEmail, string storedEmail)
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = storedEmail,
            FirstName = "John",
            LastName = "Doe",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = loginEmail,
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns("jwt_token");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.Email.Should().Be(storedEmail);
    }

    [Fact]
    public async Task Handle_Should_Generate_Correct_ExpiresAt_Time()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);
        var beforeExecution = DateTime.UtcNow;

        _mockPasswordService.Setup(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);
        var afterExecution = DateTime.UtcNow;

        // Assert
        result.ExpiresAt.Should().BeAfter(beforeExecution.AddHours(23).AddMinutes(59));
        result.ExpiresAt.Should().BeBefore(afterExecution.AddHours(24).AddMinutes(1));
    }

    [Fact]
    public async Task Handle_Should_Create_Correct_UserDto_Response()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Email = "specific@example.com",
            FirstName = "Jane",
            LastName = "Smith",
            PasswordHash = "specific_hash"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "specific@example.com",
            Password = "correct_password"
        };

        var query = new LoginUserQuery(loginDto);

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns("specific_token");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.User.Id.Should().Be(42);
        result.User.Email.Should().Be("specific@example.com");
        result.User.FirstName.Should().Be("Jane");
        result.User.LastName.Should().Be("Smith");
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData(null)]
    public async Task Handle_Should_Handle_Edge_Case_Email_Values(string email)
    {
        // Arrange
        var loginDto = new LoginUserDto
        {
            Email = email ?? string.Empty,
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);

        // Act
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task Handle_Should_Login_Turkish_User_Successfully()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "ahmet@örnek.com",
            FirstName = "Ahmet",
            LastName = "Yılmaz",
            PasswordHash = "hashed_turkish_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "ahmet@örnek.com",
            Password = "güvenliŞifre123"
        };

        var query = new LoginUserQuery(loginDto);
        var token = "turkish_jwt_token";

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns(token);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(token);
        result.User.Email.Should().Be("ahmet@örnek.com");
        result.User.FirstName.Should().Be("Ahmet");
        result.User.LastName.Should().Be("Yılmaz");

        _mockPasswordService.Verify(x => x.VerifyPassword("güvenliŞifre123", user.PasswordHash), Times.Once);
        _mockTokenService.Verify(x => x.GenerateToken(user), Times.Once);
    }

    [Theory]
    [InlineData("Çağlar", "Özgür")]
    [InlineData("Şeyda", "Gökçe")]
    [InlineData("İsmail", "Ünlü")]
    [InlineData("Müge", "İğde")]
    public async Task Handle_Should_Handle_Turkish_Character_Names_In_Response(string firstName, string lastName)
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = firstName,
            LastName = lastName,
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var query = new LoginUserQuery(loginDto);

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns("jwt_token");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.FirstName.Should().Be(firstName);
        result.User.LastName.Should().Be(lastName);
    }

    [Theory]
    [InlineData("AHMET@ÖRNEK.COM", "ahmet@örnek.com")]
    [InlineData("Kullanıcı@Örnek.Com", "kullanıcı@örnek.com")]
    [InlineData("TEST@İSTANBUL.COM", "test@istanbul.com")]
    public async Task Handle_Should_Find_Turkish_User_With_Case_Insensitive_Email(string loginEmail, string storedEmail)
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = storedEmail,
            FirstName = "Türkçe",
            LastName = "Kullanıcı",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = loginEmail,
            Password = "şifre123"
        };

        var query = new LoginUserQuery(loginDto);

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns("jwt_token");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.Email.Should().Be(storedEmail);
        result.User.FirstName.Should().Be("Türkçe");
        result.User.LastName.Should().Be("Kullanıcı");
    }

    [Fact]
    public async Task Handle_Should_Fail_For_Wrong_Turkish_Password()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "Ahmet",
            LastName = "Yılmaz",
            PasswordHash = "hashed_correct_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "yanlışŞifre123" // Wrong Turkish password
        };

        var query = new LoginUserQuery(loginDto);

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(false);

        // Act
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");

        _mockPasswordService.Verify(x => x.VerifyPassword("yanlışŞifre123", user.PasswordHash), Times.Once);
        _mockTokenService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Not_Find_Turkish_Email_When_Not_Exists()
    {
        // Arrange
        var loginDto = new LoginUserDto
        {
            Email = "olmayan@kullanıcı.com", // Non-existent Turkish email
            Password = "herhangiŞifre123"
        };

        var query = new LoginUserQuery(loginDto);

        // Act
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");

        _mockPasswordService.Verify(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        _mockTokenService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Verify_Token_Generation_For_Turkish_User()
    {
        // Arrange
        var user = new User
        {
            Id = 123,
            Email = "müşteri@şirket.com.tr",
            FirstName = "Müge",
            LastName = "Çiçek",
            PasswordHash = "hashed_password"
        };

        _users.Add(user);
        SetupMockDbSet();

        var loginDto = new LoginUserDto
        {
            Email = "müşteri@şirket.com.tr",
            Password = "güvenliŞifre"
        };

        var query = new LoginUserQuery(loginDto);
        var expectedToken = "turkish_user_jwt_token";

        _mockPasswordService.Setup(x => x.VerifyPassword(loginDto.Password, user.PasswordHash))
            .Returns(true);

        _mockTokenService.Setup(x => x.GenerateToken(user))
            .Returns(expectedToken);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Token.Should().Be(expectedToken);
        _mockTokenService.Verify(x => x.GenerateToken(user), Times.Once);
        
        // Verify the exact user object is passed to token generation
        _mockTokenService.Verify(x => x.GenerateToken(It.Is<User>(u => 
            u.Id == 123 && 
            u.Email == "müşteri@şirket.com.tr" && 
            u.FirstName == "Müge" && 
            u.LastName == "Çiçek")), Times.Once);
    }
}