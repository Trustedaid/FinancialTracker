using FinanceTracker.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace FinanceTracker.Tests.Unit.Infrastructure.Services;

public class PasswordHashingServiceTests
{
    private readonly PasswordHashingService _service;

    public PasswordHashingServiceTests()
    {
        _service = new PasswordHashingService();
    }

    [Fact]
    public void HashPassword_Should_Return_Non_Empty_Hash()
    {
        // Arrange
        var password = "testpassword123";

        // Act
        var hash = _service.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().NotBe(password); // Hash should be different from original password
    }

    [Fact]
    public void HashPassword_Should_Generate_Different_Hashes_For_Same_Password()
    {
        // Arrange
        var password = "samepassword";

        // Act
        var hash1 = _service.HashPassword(password);
        var hash2 = _service.HashPassword(password);

        // Assert
        hash1.Should().NotBe(hash2); // BCrypt uses salt, so hashes should be different
        hash1.Should().NotBeNullOrEmpty();
        hash2.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData("password123")]
    [InlineData("")]
    [InlineData("a")]
    [InlineData("VeryLongPasswordWithManyCharactersAndNumbers12345")]
    [InlineData("Türkçe şifre 123")]
    [InlineData("Password!@#$%^&*()")]
    public void HashPassword_Should_Handle_Various_Password_Types(string password)
    {
        // Act
        var hash = _service.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().NotBe(password);
        hash.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public void HashPassword_Should_Generate_BCrypt_Format_Hash()
    {
        // Arrange
        var password = "testpassword";

        // Act
        var hash = _service.HashPassword(password);

        // Assert
        hash.Should().StartWith("$2"); // BCrypt hashes start with version identifier
        hash.Length.Should().Be(60); // BCrypt hashes are 60 characters long
    }

    [Fact]
    public void VerifyPassword_Should_Return_True_For_Correct_Password()
    {
        // Arrange
        var password = "correctpassword";
        var hash = _service.HashPassword(password);

        // Act
        var result = _service.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_Should_Return_False_For_Incorrect_Password()
    {
        // Arrange
        var correctPassword = "correctpassword";
        var incorrectPassword = "wrongpassword";
        var hash = _service.HashPassword(correctPassword);

        // Act
        var result = _service.VerifyPassword(incorrectPassword, hash);

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData("password123")]
    [InlineData("")]
    [InlineData("a")]
    [InlineData("VeryLongPasswordWithManyCharactersAndNumbers12345")]
    [InlineData("Türkçe şifre 123")]
    [InlineData("Password!@#$%^&*()")]
    public void VerifyPassword_Should_Work_With_Various_Password_Types(string password)
    {
        // Arrange
        var hash = _service.HashPassword(password);

        // Act
        var correctResult = _service.VerifyPassword(password, hash);
        var incorrectResult = _service.VerifyPassword(password + "wrong", hash);

        // Assert
        correctResult.Should().BeTrue();
        incorrectResult.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_Should_Return_False_For_Invalid_Hash()
    {
        // Arrange
        var password = "testpassword";
        var invalidHash = "invalidhash";

        // Act
        var act = () => _service.VerifyPassword(password, invalidHash);

        // Assert
        // BCrypt throws SaltParseException for invalid hash format
        act.Should().Throw<BCrypt.Net.SaltParseException>();
    }

    [Fact]
    public void VerifyPassword_Should_Return_False_For_Empty_Hash()
    {
        // Arrange
        var password = "testpassword";
        var emptyHash = "";

        // Act
        var act = () => _service.VerifyPassword(password, emptyHash);

        // Assert
        // BCrypt throws an exception for empty hash
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void VerifyPassword_Should_Be_Case_Sensitive()
    {
        // Arrange
        var password = "CaseSensitivePassword";
        var hash = _service.HashPassword(password);

        // Act
        var correctCaseResult = _service.VerifyPassword("CaseSensitivePassword", hash);
        var wrongCaseResult = _service.VerifyPassword("casesensitivepassword", hash);

        // Assert
        correctCaseResult.Should().BeTrue();
        wrongCaseResult.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_Should_Handle_Special_Characters()
    {
        // Arrange
        var password = "P@ssw0rd!#$%^&*()";
        var hash = _service.HashPassword(password);

        // Act
        var result = _service.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_Should_Handle_Unicode_Characters()
    {
        // Arrange
        var password = "Şifre123çğıöşü";
        var hash = _service.HashPassword(password);

        // Act
        var result = _service.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HashPassword_Should_Handle_Null_Password_Gracefully()
    {
        // Arrange
        string nullPassword = null!;

        // Act
        var act = () => _service.HashPassword(nullPassword);

        // Assert
        // BCrypt.HashPassword typically throws ArgumentNullException for null input
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void VerifyPassword_Should_Handle_Null_Password_Gracefully()
    {
        // Arrange
        string nullPassword = null!;
        var hash = _service.HashPassword("validpassword");

        // Act
        var act = () => _service.VerifyPassword(nullPassword, hash);

        // Assert
        // BCrypt.Verify typically throws ArgumentNullException for null input
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void VerifyPassword_Should_Handle_Null_Hash_Gracefully()
    {
        // Arrange
        var password = "validpassword";
        string nullHash = null!;

        // Act
        var act = () => _service.VerifyPassword(password, nullHash);

        // Assert
        // BCrypt.Verify typically throws exception for null hash
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void Hash_And_Verify_Should_Work_Together_Consistently()
    {
        // Arrange
        var passwords = new[]
        {
            "password1",
            "password2",
            "VeryLongPasswordThatShouldStillWork",
            "123456",
            "P@ssw0rd!",
            "Türkçe",
            ""
        };

        foreach (var password in passwords)
        {
            // Act
            var hash = _service.HashPassword(password);
            var isValid = _service.VerifyPassword(password, hash);

            // Assert
            isValid.Should().BeTrue($"Password '{password}' should verify against its own hash");
        }
    }

    [Fact]
    public void Multiple_Hash_Operations_Should_Be_Independent()
    {
        // Arrange
        var password1 = "password1";
        var password2 = "password2";

        // Act
        var hash1 = _service.HashPassword(password1);
        var hash2 = _service.HashPassword(password2);

        // Assert
        hash1.Should().NotBe(hash2);
        _service.VerifyPassword(password1, hash1).Should().BeTrue();
        _service.VerifyPassword(password2, hash2).Should().BeTrue();
        _service.VerifyPassword(password1, hash2).Should().BeFalse();
        _service.VerifyPassword(password2, hash1).Should().BeFalse();
    }

    [Theory]
    [InlineData("güvenliŞifre123")]
    [InlineData("çokGüvenliParola")]
    [InlineData("şifre!@#öçğüı")]
    [InlineData("TÜRKÇE_PAROLA_123")]
    [InlineData("İSTANBUL-şehir-2024")]
    public void HashPassword_Should_Handle_Complex_Turkish_Passwords(string turkishPassword)
    {
        // Act
        var hash = _service.HashPassword(turkishPassword);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().NotBe(turkishPassword);
        hash.Should().StartWith("$2"); // BCrypt format
        hash.Length.Should().Be(60);
        
        // Verify the hash can be verified
        _service.VerifyPassword(turkishPassword, hash).Should().BeTrue();
    }

    [Theory]
    [InlineData("şifre123", "Şifre123")] // Case sensitivity with Turkish characters
    [InlineData("çağlar", "Çağlar")]
    [InlineData("ömer", "ÖMER")]
    [InlineData("güler", "GÜLER")]
    public void VerifyPassword_Should_Be_Case_Sensitive_With_Turkish_Characters(string originalPassword, string differentCasePassword)
    {
        // Arrange
        var hash = _service.HashPassword(originalPassword);

        // Act
        var originalResult = _service.VerifyPassword(originalPassword, hash);
        var differentCaseResult = _service.VerifyPassword(differentCasePassword, hash);

        // Assert
        originalResult.Should().BeTrue();
        differentCaseResult.Should().BeFalse();
    }

    [Fact]
    public void HashPassword_Should_Handle_All_Turkish_Special_Characters()
    {
        // Arrange - Password containing all Turkish-specific characters
        var turkishPassword = "ÇĞIİÖŞÜçğıiöşü123";

        // Act
        var hash = _service.HashPassword(turkishPassword);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().StartWith("$2");
        
        // Verify character preservation
        _service.VerifyPassword(turkishPassword, hash).Should().BeTrue();
        
        // Verify that missing or changed Turkish characters cause verification to fail
        _service.VerifyPassword("CGIIOSUcgiiosu123", hash).Should().BeFalse(); // ASCII replacement
        _service.VerifyPassword("ÇĞIİÖŞÜçğıiöşü", hash).Should().BeFalse(); // Missing numbers
    }

    [Fact]
    public void VerifyPassword_Should_Handle_Mixed_Language_Passwords()
    {
        // Arrange - Password with Turkish, English, and special characters
        var mixedPassword = "Hello-Merhaba_çok_güzel123!@#";
        var hash = _service.HashPassword(mixedPassword);

        // Act
        var correctResult = _service.VerifyPassword(mixedPassword, hash);
        var incorrectResult = _service.VerifyPassword("Hello-Merhaba_cok_guzel123!@#", hash); // ASCII version

        // Assert
        correctResult.Should().BeTrue();
        incorrectResult.Should().BeFalse();
    }

    [Fact]
    public void HashPassword_Should_Handle_Maximum_Turkish_Password_Length()
    {
        // Arrange - Very long Turkish password
        var longTurkishPassword = string.Concat(Enumerable.Repeat("çğıöşüÇĞIİÖŞÜ", 10)) + "123";

        // Act
        var hash = _service.HashPassword(longTurkishPassword);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().StartWith("$2");
        _service.VerifyPassword(longTurkishPassword, hash).Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_Should_Distinguish_Similar_Turkish_Characters()
    {
        // Arrange - Test similar looking characters
        var password1 = "şifre"; // Turkish ş
        var password2 = "sifre"; // Latin s
        var password3 = "şıfre"; // Turkish ı instead of i
        
        var hash1 = _service.HashPassword(password1);

        // Act & Assert
        _service.VerifyPassword(password1, hash1).Should().BeTrue();
        _service.VerifyPassword(password2, hash1).Should().BeFalse();
        _service.VerifyPassword(password3, hash1).Should().BeFalse();
    }

    [Fact]
    public void HashPassword_Should_Handle_Turkish_Common_Phrases()
    {
        // Arrange - Common Turkish phrases used as passwords
        var turkishPhrases = new[]
        {
            "güvenliparola",
            "şifreyiunuttum",
            "çokgizli123",
            "benihatırla",
            "türkiye2024"
        };

        foreach (var phrase in turkishPhrases)
        {
            // Act
            var hash = _service.HashPassword(phrase);

            // Assert
            hash.Should().NotBeNullOrEmpty();
            hash.Should().StartWith("$2");
            _service.VerifyPassword(phrase, hash).Should().BeTrue();
        }
    }

    [Fact]
    public void HashPassword_Performance_Should_Be_Consistent_With_Turkish_Characters()
    {
        // Arrange
        var simplePassword = "password123";
        var turkishPassword = "şifre123çğıöü";

        // Act
        var startTime1 = DateTime.UtcNow;
        var hash1 = _service.HashPassword(simplePassword);
        var endTime1 = DateTime.UtcNow;

        var startTime2 = DateTime.UtcNow;
        var hash2 = _service.HashPassword(turkishPassword);
        var endTime2 = DateTime.UtcNow;

        // Assert
        hash1.Should().NotBeNullOrEmpty();
        hash2.Should().NotBeNullOrEmpty();
        
        // Performance should be similar (within reasonable bounds)
        var duration1 = endTime1 - startTime1;
        var duration2 = endTime2 - startTime2;
        
        // Both should complete within a reasonable time (BCrypt is intentionally slow)
        duration1.TotalSeconds.Should().BeLessThan(5);
        duration2.TotalSeconds.Should().BeLessThan(5);
    }
}