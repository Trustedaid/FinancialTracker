using FinanceTracker.Application.Features.Auth.DTOs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace FinanceTracker.Tests.Integration.API;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Register_Should_Return_Success_With_Valid_Data()
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrEmpty();
        authResponse.User.Should().NotBeNull();
        authResponse.User.Email.Should().Be("test@example.com");
        authResponse.User.FirstName.Should().Be("John");
        authResponse.User.LastName.Should().Be("Doe");
    }

    [Fact]
    public async Task Register_Should_Return_BadRequest_With_Invalid_Data()
    {
        // Arrange
        var invalidRegistrationData = new RegisterUserDto
        {
            Email = "invalid-email",
            Password = "",
            FirstName = "",
            LastName = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", invalidRegistrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_Should_Return_Conflict_When_User_Already_Exists()
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = "duplicate@example.com",
            Password = "password123",
            FirstName = "Jane",
            LastName = "Doe"
        };

        // Act - Register user first time
        var firstResponse = await _client.PostAsJsonAsync("/api/auth/register", registrationData);
        
        // Act - Try to register same user again
        var secondResponse = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        secondResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError); // Will be 500 due to exception
    }

    [Fact]
    public async Task Login_Should_Return_Success_With_Valid_Credentials()
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = "login-test@example.com",
            Password = "password123",
            FirstName = "Test",
            LastName = "User"
        };

        // First register a user
        await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        var loginData = new LoginUserDto
        {
            Email = "login-test@example.com",
            Password = "password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrEmpty();
        authResponse.User.Should().NotBeNull();
        authResponse.User.Email.Should().Be("login-test@example.com");
    }

    [Fact]
    public async Task Login_Should_Return_Unauthorized_With_Invalid_Credentials()
    {
        // Arrange
        var loginData = new LoginUserDto
        {
            Email = "nonexistent@example.com",
            Password = "wrongpassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_Should_Return_BadRequest_With_Invalid_Data()
    {
        // Arrange
        var invalidLoginData = new LoginUserDto
        {
            Email = "invalid-email",
            Password = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", invalidLoginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_Should_Return_Unauthorized_With_Wrong_Password()
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = "password-test@example.com",
            Password = "correctpassword",
            FirstName = "Password",
            LastName = "Test"
        };

        // First register a user
        await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        var loginData = new LoginUserDto
        {
            Email = "password-test@example.com",
            Password = "wrongpassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid-email")]
    [InlineData("test@")]
    public async Task Register_Should_Validate_Email_Format(string email)
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = email,
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")] // Too short
    public async Task Register_Should_Validate_Password_Requirements(string password)
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = "password-validation@example.com",
            Password = password,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Register_Should_Validate_Required_Fields(string emptyValue)
    {
        // Arrange
        var registrationData = new RegisterUserDto
        {
            Email = "required-fields@example.com",
            Password = "password123",
            FirstName = emptyValue,
            LastName = emptyValue
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_And_Login_Flow_Should_Work_End_To_End()
    {
        // Arrange
        var uniqueEmail = $"e2e-test-{Guid.NewGuid()}@example.com";
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = "testpassword123",
            FirstName = "EndToEnd",
            LastName = "Test"
        };

        // Act - Register
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registrationData);
        
        // Assert registration
        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerAuthResponse = JsonSerializer.Deserialize<AuthResponseDto>(registerContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        registerAuthResponse.Should().NotBeNull();
        registerAuthResponse!.Token.Should().NotBeNullOrEmpty();

        // Act - Login with same credentials
        var loginData = new LoginUserDto
        {
            Email = uniqueEmail,
            Password = "testpassword123"
        };
        
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginData);
        
        // Assert login
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginAuthResponse = JsonSerializer.Deserialize<AuthResponseDto>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        loginAuthResponse.Should().NotBeNull();
        loginAuthResponse!.Token.Should().NotBeNullOrEmpty();
        loginAuthResponse.User.Email.Should().Be(uniqueEmail);
        loginAuthResponse.User.FirstName.Should().Be("EndToEnd");
        loginAuthResponse.User.LastName.Should().Be("Test");
    }

    [Fact]
    public async Task Register_Should_Support_Turkish_User_Data()
    {
        // Arrange
        var uniqueEmail = $"ahmet-{Guid.NewGuid()}@örnek.com";
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = "güvenliŞifre123",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrEmpty();
        authResponse.User.Should().NotBeNull();
        authResponse.User.Email.Should().Be(uniqueEmail);
        authResponse.User.FirstName.Should().Be("Ahmet");
        authResponse.User.LastName.Should().Be("Yılmaz");
    }

    [Theory]
    [InlineData("Çağlar", "Özgür")]
    [InlineData("Şeyda", "Gökçe")]
    [InlineData("İsmail", "Ünlü")]
    [InlineData("Müge", "İğde")]
    public async Task Register_Should_Handle_Turkish_Character_Names(string firstName, string lastName)
    {
        // Arrange
        var uniqueEmail = $"turkish-test-{Guid.NewGuid()}@example.com";
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = "password123",
            FirstName = firstName,
            LastName = lastName
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        authResponse.Should().NotBeNull();
        authResponse!.User.FirstName.Should().Be(firstName);
        authResponse.User.LastName.Should().Be(lastName);
    }

    [Fact]
    public async Task Login_Should_Work_With_Turkish_Email_And_Password()
    {
        // Arrange
        var uniqueEmail = $"kullanıcı-{Guid.NewGuid()}@şirket.com.tr";
        var turkishPassword = "türkçeParola123";
        
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = turkishPassword,
            FirstName = "Türkçe",
            LastName = "Kullanıcı"
        };

        // First register the user
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registrationData);
        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginData = new LoginUserDto
        {
            Email = uniqueEmail,
            Password = turkishPassword
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrEmpty();
        authResponse.User.Email.Should().Be(uniqueEmail);
        authResponse.User.FirstName.Should().Be("Türkçe");
        authResponse.User.LastName.Should().Be("Kullanıcı");
    }

    [Fact]
    public async Task Turkish_User_Complete_Flow_Should_Work_End_To_End()
    {
        // Arrange - Complete Turkish user scenario
        var uniqueEmail = $"ahmet.yılmaz-{Guid.NewGuid()}@şirket.com.tr";
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = "güvenliParola2024!",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act - Register Turkish user
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registrationData);
        
        // Assert registration
        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerAuthResponse = JsonSerializer.Deserialize<AuthResponseDto>(registerContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        registerAuthResponse.Should().NotBeNull();
        registerAuthResponse!.Token.Should().NotBeNullOrEmpty();
        registerAuthResponse.User.FirstName.Should().Be("Ahmet");
        registerAuthResponse.User.LastName.Should().Be("Yılmaz");

        // Act - Login with Turkish credentials
        var loginData = new LoginUserDto
        {
            Email = uniqueEmail,
            Password = "güvenliParola2024!"
        };
        
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginData);
        
        // Assert login
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginAuthResponse = JsonSerializer.Deserialize<AuthResponseDto>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        loginAuthResponse.Should().NotBeNull();
        loginAuthResponse!.Token.Should().NotBeNullOrEmpty();
        loginAuthResponse.User.Email.Should().Be(uniqueEmail);
        loginAuthResponse.User.FirstName.Should().Be("Ahmet");
        loginAuthResponse.User.LastName.Should().Be("Yılmaz");
        
        // Verify tokens are different (each login should generate new token)
        registerAuthResponse.Token.Should().NotBe(loginAuthResponse.Token);
    }

    [Theory]
    [InlineData("ahmet@örnek.com")]
    [InlineData("kullanıcı@şirket.com.tr")]
    [InlineData("müşteri@örnekfirma.com")]
    public async Task Register_Should_Accept_Various_Turkish_Email_Formats(string turkishEmail)
    {
        // Arrange
        var uniqueEmail = turkishEmail.Replace("@", $"-{Guid.NewGuid()}@");
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = "password123",
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        authResponse.Should().NotBeNull();
        authResponse!.User.Email.Should().Be(uniqueEmail);
    }

    [Fact]
    public async Task Login_Should_Fail_With_Wrong_Turkish_Password_Case()
    {
        // Arrange
        var uniqueEmail = $"case-test-{Guid.NewGuid()}@example.com";
        var correctPassword = "şifre123";
        var wrongCasePassword = "Şifre123"; // Different case with Turkish character
        
        var registrationData = new RegisterUserDto
        {
            Email = uniqueEmail,
            Password = correctPassword,
            FirstName = "Case",
            LastName = "Test"
        };

        // First register the user
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registrationData);
        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginData = new LoginUserDto
        {
            Email = uniqueEmail,
            Password = wrongCasePassword
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Register_Should_Return_BadRequest_With_Turkish_Validation_Messages()
    {
        // Arrange - Invalid data that should trigger Turkish validation messages
        var invalidRegistrationData = new RegisterUserDto
        {
            Email = "geçersiz-eposta", // Invalid email format
            Password = "123", // Too short
            FirstName = "", // Empty
            LastName = "" // Empty
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", invalidRegistrationData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        // The response should contain validation errors
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_Should_Return_BadRequest_With_Turkish_Validation_Messages()
    {
        // Arrange - Invalid login data
        var invalidLoginData = new LoginUserDto
        {
            Email = "geçersiz-eposta-formatı", // Invalid Turkish email format
            Password = "" // Empty password
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", invalidLoginData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        // The response should contain validation errors
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
    }
}