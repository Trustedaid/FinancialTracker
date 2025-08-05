using FinanceTracker.Domain.Entities;
using FinanceTracker.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace FinanceTracker.Tests.Unit.Infrastructure.Services;

public class JwtTokenServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<IConfigurationSection> _mockJwtSection;
    private readonly JwtTokenService _service;

    public JwtTokenServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        _mockJwtSection = new Mock<IConfigurationSection>();
        
        SetupConfiguration();
        
        _service = new JwtTokenService(_mockConfiguration.Object);
    }

    private void SetupConfiguration()
    {
        _mockJwtSection.Setup(x => x["SecretKey"]).Returns("ThisIsAVeryLongSecretKeyThatMeetsTheMinimumRequirements123456789");
        _mockJwtSection.Setup(x => x["Issuer"]).Returns("FinanceTracker");
        _mockJwtSection.Setup(x => x["Audience"]).Returns("FinanceTrackerClients");
        _mockJwtSection.Setup(x => x["ExpirationHours"]).Returns("24");

        _mockConfiguration.Setup(x => x.GetSection("JwtSettings")).Returns(_mockJwtSection.Object);
    }

    [Fact]
    public void GenerateToken_Should_Return_Valid_JWT_Token()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        // Verify it's a valid JWT format (3 parts separated by dots)
        var parts = token.Split('.');
        parts.Should().HaveCount(3);
    }

    [Fact]
    public void GenerateToken_Should_Create_Token_With_Correct_Claims()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Email = "specific@example.com",
            FirstName = "Jane",
            LastName = "Smith"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);

        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "42");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "specific@example.com");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == "Jane");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == "Smith");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Jti);
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Iat);
    }

    [Fact]
    public void GenerateToken_Should_Set_Correct_Issuer_And_Audience()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);

        jsonToken.Issuer.Should().Be("FinanceTracker");
        jsonToken.Audiences.Should().Contain("FinanceTrackerClients");
    }

    [Fact]
    public void GenerateToken_Should_Set_Correct_Expiration_Time()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        var beforeGeneration = DateTime.UtcNow;

        // Act
        var token = _service.GenerateToken(user);
        var afterGeneration = DateTime.UtcNow;

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);

        jsonToken.ValidTo.Should().BeAfter(beforeGeneration.AddHours(23).AddMinutes(59));
        jsonToken.ValidTo.Should().BeBefore(afterGeneration.AddHours(24).AddMinutes(1));
    }

    [Fact]
    public void GenerateToken_Should_Generate_Unique_Tokens_For_Same_User()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var token1 = _service.GenerateToken(user);
        var token2 = _service.GenerateToken(user);

        // Assert
        token1.Should().NotBe(token2); // JTI (JWT ID) should make each token unique
    }

    [Fact]
    public void GenerateToken_Should_Handle_Different_User_IDs()
    {
        // Arrange
        var user1 = new User { Id = 1, Email = "user1@example.com", FirstName = "User", LastName = "One" };
        var user2 = new User { Id = 999, Email = "user2@example.com", FirstName = "User", LastName = "Two" };

        // Act
        var token1 = _service.GenerateToken(user1);
        var token2 = _service.GenerateToken(user2);

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken1 = tokenHandler.ReadJwtToken(token1);
        var jsonToken2 = tokenHandler.ReadJwtToken(token2);

        var subClaim1 = jsonToken1.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
        var subClaim2 = jsonToken2.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);

        subClaim1?.Value.Should().Be("1");
        subClaim2?.Value.Should().Be("999");
    }

    [Fact]
    public void GenerateToken_Should_Handle_Special_Characters_In_User_Data()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test+special@domain.co.uk",
            FirstName = "José",
            LastName = "García-López"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "test+special@domain.co.uk");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == "José");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == "García-López");
    }

    [Fact]
    public void GenerateToken_Should_Handle_Turkish_Characters()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "Çağlar",
            LastName = "Öztürk"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == "Çağlar");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == "Öztürk");
    }

    [Fact]
    public void GenerateToken_Should_Use_Custom_Expiration_Hours_When_Configured()
    {
        // Arrange
        _mockJwtSection.Setup(x => x["ExpirationHours"]).Returns("48");
        var service = new JwtTokenService(_mockConfiguration.Object);
        
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        var beforeGeneration = DateTime.UtcNow;

        // Act
        var token = service.GenerateToken(user);
        var afterGeneration = DateTime.UtcNow;

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);

        jsonToken.ValidTo.Should().BeAfter(beforeGeneration.AddHours(47).AddMinutes(59));
        jsonToken.ValidTo.Should().BeBefore(afterGeneration.AddHours(48).AddMinutes(1));
    }

    [Fact]
    public void GenerateToken_Should_Use_Default_Expiration_When_Config_Is_Null()
    {
        // Arrange
        _mockJwtSection.Setup(x => x["ExpirationHours"]).Returns((string)null!);
        var service = new JwtTokenService(_mockConfiguration.Object);
        
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        var beforeGeneration = DateTime.UtcNow;

        // Act
        var token = service.GenerateToken(user);
        var afterGeneration = DateTime.UtcNow;

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);

        // Should default to 24 hours
        jsonToken.ValidTo.Should().BeAfter(beforeGeneration.AddHours(23).AddMinutes(59));
        jsonToken.ValidTo.Should().BeBefore(afterGeneration.AddHours(24).AddMinutes(1));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void GenerateToken_Should_Handle_Empty_User_Data(string emptyValue)
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = emptyValue ?? string.Empty,
            FirstName = emptyValue ?? string.Empty,
            LastName = emptyValue ?? string.Empty
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "1");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == (emptyValue ?? string.Empty));
    }

    [Fact]
    public void GenerateToken_Should_Include_IAT_Claim_With_Current_Timestamp()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        var beforeGeneration = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // Act
        var token = _service.GenerateToken(user);
        var afterGeneration = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        var iatClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Iat);
        iatClaim.Should().NotBeNull();
        
        var iatValue = long.Parse(iatClaim!.Value);
        iatValue.Should().BeGreaterThanOrEqualTo(beforeGeneration);
        iatValue.Should().BeLessThanOrEqualTo(afterGeneration);
    }

    [Fact]
    public void GenerateToken_Should_Include_JTI_Claim_With_Unique_Value()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var token1 = _service.GenerateToken(user);
        var token2 = _service.GenerateToken(user);

        // Assert
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken1 = tokenHandler.ReadJwtToken(token1);
        var jsonToken2 = tokenHandler.ReadJwtToken(token2);
        
        var jtiClaim1 = jsonToken1.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);
        var jtiClaim2 = jsonToken2.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);
        
        jtiClaim1.Should().NotBeNull();
        jtiClaim2.Should().NotBeNull();
        jtiClaim1!.Value.Should().NotBe(jtiClaim2!.Value);
        
        // JTI should be a valid GUID
        Guid.TryParse(jtiClaim1.Value, out _).Should().BeTrue();
        Guid.TryParse(jtiClaim2.Value, out _).Should().BeTrue();
    }

    [Fact]
    public void GenerateToken_Should_Throw_Exception_When_Configuration_Is_Missing()
    {
        // Arrange
        var mockConfig = new Mock<IConfiguration>();
        var mockSection = new Mock<IConfigurationSection>();
        
        mockSection.Setup(x => x["SecretKey"]).Returns((string)null!);
        mockConfig.Setup(x => x.GetSection("JwtSettings")).Returns(mockSection.Object);
        
        var service = new JwtTokenService(mockConfig.Object);
        var user = new User { Id = 1, Email = "test@example.com", FirstName = "John", LastName = "Doe" };

        // Act
        var act = () => service.GenerateToken(user);

        // Assert
        act.Should().Throw<ArgumentNullException>();
    }

    [Theory]
    [InlineData("ahmet@örnek.com")]
    [InlineData("kullanıcı@şirket.com.tr")]
    [InlineData("müşteri@örnekfirma.com")]
    [InlineData("çağlar@istanbul.com")]
    public void GenerateToken_Should_Handle_Turkish_Email_Addresses(string turkishEmail)
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = turkishEmail,
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == turkishEmail);
    }

    [Theory]
    [InlineData("Çağlar", "Özgür")]
    [InlineData("Şeyda", "Gökçe")]
    [InlineData("İsmail", "Ünlü")]
    [InlineData("Müge", "İğde")]
    [InlineData("Gülşah", "Büyüköztürk")]
    public void GenerateToken_Should_Handle_Complex_Turkish_Names(string firstName, string lastName)
    {
        // Arrange
        var user = new User
        {
            Id = 123,
            Email = "test@example.com",
            FirstName = firstName,
            LastName = lastName
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == firstName);
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == lastName);
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "123");
    }

    [Fact]
    public void GenerateToken_Should_Handle_Complete_Turkish_User_Data()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Email = "ahmet.yılmaz@şirket.com.tr",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        // Verify all Turkish-specific claims
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "42");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "ahmet.yılmaz@şirket.com.tr");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == "Ahmet");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == "Yılmaz");
        
        // Verify standard JWT claims are still present
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Jti);
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Iat);
        
        // Verify issuer and audience
        jsonToken.Issuer.Should().Be("FinanceTracker");
        jsonToken.Audiences.Should().Contain("FinanceTrackerClients");
    }

    [Fact]
    public void GenerateToken_Should_Preserve_Turkish_Character_Encoding()
    {
        // Arrange - Test various Turkish characters
        var user = new User
        {
            Id = 1,
            Email = "özel@türkçe.com",
            FirstName = "Çiğdem",
            LastName = "Ğüzelyıldız"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        // Verify that Turkish characters are preserved exactly
        var emailClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email);
        var firstNameClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.GivenName);
        var lastNameClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.FamilyName);
        
        emailClaim?.Value.Should().Be("özel@türkçe.com");
        firstNameClaim?.Value.Should().Be("Çiğdem");
        lastNameClaim?.Value.Should().Be("Ğüzelyıldız");
        
        // Verify no character corruption occurred
        firstNameClaim?.Value.Should().Contain("Ç");
        firstNameClaim?.Value.Should().Contain("ğ");
        lastNameClaim?.Value.Should().Contain("Ğ");
        lastNameClaim?.Value.Should().Contain("ü");
        lastNameClaim?.Value.Should().Contain("ı");
        emailClaim?.Value.Should().Contain("ö");
        emailClaim?.Value.Should().Contain("ü");
        emailClaim?.Value.Should().Contain("ç");
    }

    [Fact]
    public void GenerateToken_Should_Handle_Maximum_Length_Turkish_Names()
    {
        // Arrange - Test with long Turkish names (common in Turkish culture)
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "Muhammed-Emin-Abdullah",
            LastName = "Büyüköztürk-Kılıçdaroğlu"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == "Muhammed-Emin-Abdullah");
        jsonToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == "Büyüköztürk-Kılıçdaroğlu");
    }
}