using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Application.Features.Auth.Validators;
using FluentAssertions;
using Xunit;

namespace FinanceTracker.Tests.Unit.Application.Features.Auth.Validators;

public class LoginUserDtoValidatorTests
{
    private readonly LoginUserDtoValidator _validator;

    public LoginUserDtoValidatorTests()
    {
        _validator = new LoginUserDtoValidator();
    }

    [Fact]
    public void Validator_Should_Pass_With_Valid_LoginUserDto()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    #region Email Validation Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validator_Should_Fail_When_Email_Is_Empty_Or_Null(string email)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = email ?? string.Empty,
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi gereklidir.");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("test@")]
    [InlineData("@example.com")]
    [InlineData("test.example.com")]
    [InlineData("test@.com")]
    [InlineData("test@com")]
    [InlineData("test@@example.com")]
    [InlineData("test@example..com")]
    public void Validator_Should_Fail_When_Email_Format_Is_Invalid(string email)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = email,
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "Geçerli bir e-posta adresi giriniz.");
    }

    [Theory]
    [InlineData("test@example.com")]
    [InlineData("user.name@domain.co.uk")]
    [InlineData("user+tag@example.org")]
    [InlineData("123@456.com")]
    [InlineData("test.email.with+symbol@example.com")]
    [InlineData("user@sub.domain.example.com")]
    public void Validator_Should_Pass_With_Valid_Email_Formats(string email)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = email,
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Email));
    }

    #endregion

    #region Password Validation Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validator_Should_Fail_When_Password_Is_Empty_Or_Null(string password)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = password ?? string.Empty
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Password) && 
                                           e.ErrorMessage == "Şifre gereklidir.");
    }

    [Theory]
    [InlineData("1")]
    [InlineData("12")]
    [InlineData("123")]
    [InlineData("password")]
    [InlineData("VeryLongPasswordThatMightBeUsedBySomeone")]
    public void Validator_Should_Pass_With_Any_Non_Empty_Password(string password)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = password
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Password));
    }

    #endregion

    #region Multiple Validation Errors Tests

    [Fact]
    public void Validator_Should_Return_Multiple_Errors_When_Both_Fields_Are_Invalid()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "invalid-email",
            Password = ""
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCount(2);
        
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "Geçerli bir e-posta adresi giriniz.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Password) && 
                                           e.ErrorMessage == "Şifre gereklidir.");
    }

    [Fact]
    public void Validator_Should_Return_All_Email_Errors_When_Email_Is_Empty()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "",
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        
        // Empty email should trigger the NotEmpty rule, and EmailAddress rule might not be evaluated
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi gereklidir.");
    }

    [Fact]
    public void Validator_Should_Handle_Both_Fields_Empty()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "",
            Password = ""
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCount(2);
        
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi gereklidir.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Password) && 
                                           e.ErrorMessage == "Şifre gereklidir.");
    }

    [Fact]
    public void Validator_Should_Handle_Null_Dto()
    {
        // Arrange
        LoginUserDto dto = null!;

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        // FluentValidation handles null objects by creating validation failures
    }

    #endregion

    #region Edge Cases Tests

    [Theory]
    [InlineData("a@b.c")] // Minimal valid email
    [InlineData("test@domain-with-hyphens.com")]
    [InlineData("user123@123domain.com")]
    public void Validator_Should_Handle_Edge_Case_Valid_Emails(string email)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = email,
            Password = "password"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Email));
    }

    [Fact]
    public void Validator_Should_Handle_Very_Long_Email()
    {
        // Arrange
        var longEmail = new string('a', 250) + "@test.com"; // Very long but might be valid format
        var dto = new LoginUserDto
        {
            Email = longEmail,
            Password = "password"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        // The validator should either pass (if email format is valid) or fail on format, not length
        // LoginUserDto validator doesn't have length restrictions like RegisterUserDto
        if (!result.IsValid)
        {
            result.Errors.Should().NotContain(e => e.ErrorMessage.Contains("karakter"));
        }
    }

    [Fact]
    public void Validator_Should_Handle_Very_Long_Password()
    {
        // Arrange
        var longPassword = new string('x', 1000); // Very long password
        var dto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = longPassword
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Password));
    }

    #endregion

    #region Turkish Error Messages Tests

    [Fact]
    public void Validator_Should_Return_Turkish_Error_Messages()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "",
            Password = ""
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        
        var emailError = result.Errors.FirstOrDefault(e => e.PropertyName == nameof(LoginUserDto.Email));
        var passwordError = result.Errors.FirstOrDefault(e => e.PropertyName == nameof(LoginUserDto.Password));
        
        emailError.Should().NotBeNull();
        emailError!.ErrorMessage.Should().Be("E-posta adresi gereklidir.");
        
        passwordError.Should().NotBeNull();
        passwordError!.ErrorMessage.Should().Be("Şifre gereklidir.");
    }

    [Fact]
    public void Validator_Should_Return_Turkish_Email_Format_Error_Message()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "invalid-email-format",
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        
        var emailError = result.Errors.FirstOrDefault(e => e.PropertyName == nameof(LoginUserDto.Email));
        emailError.Should().NotBeNull();
        emailError!.ErrorMessage.Should().Be("Geçerli bir e-posta adresi giriniz.");
    }

    #endregion

    #region Case Sensitivity Tests

    [Theory]
    [InlineData("TEST@EXAMPLE.COM")]
    [InlineData("Test@Example.Com")]
    [InlineData("tEsT@eXaMpLe.CoM")]
    public void Validator_Should_Accept_Mixed_Case_Emails(string email)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = email,
            Password = "password123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Email));
    }

    #endregion

    #region Turkish Character Support Tests

    [Theory]
    [InlineData("ahmet@örnek.com")]
    [InlineData("kullanıcı@şirket.com.tr")]
    [InlineData("müşteri@örnekfirma.com")]
    [InlineData("test@türkiye.gov.tr")]
    [InlineData("çağlar@istanbul.com")]
    public void Validator_Should_Support_Turkish_Emails(string turkishEmail)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = turkishEmail,
            Password = "şifre123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Email));
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("güvenliŞifre")]
    [InlineData("şifre123")]
    [InlineData("parolaİçerikli")]
    [InlineData("türkçeKarakter")]
    [InlineData("çok-güvenli-parola")]
    [InlineData("özel*şifre+123")]
    public void Validator_Should_Support_Turkish_Characters_In_Passwords(string turkishPassword)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = turkishPassword
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Password));
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("AHMET@ÖRNEK.COM")]
    [InlineData("Kullanıcı@Şirket.Com.Tr")]
    [InlineData("MÜŞTERI@ÖRNEKFIRMA.COM")]
    public void Validator_Should_Accept_Mixed_Case_Turkish_Emails(string turkishEmail)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = turkishEmail,
            Password = "şifre123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Email));
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validator_Should_Pass_With_Complete_Turkish_Login()
    {
        // Arrange - Complete valid Turkish user login
        var dto = new LoginUserDto
        {
            Email = "ahmet.yılmaz@şirket.com.tr",
            Password = "güvenliParola123"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validator_Should_Return_Turkish_Error_Messages_For_Turkish_Context()
    {
        // Arrange - Invalid Turkish context
        var dto = new LoginUserDto
        {
            Email = "geçersiz-eposta-formatı", // Invalid Turkish email format
            Password = "" // Empty password
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCount(2);
        
        // Verify Turkish error messages
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "Geçerli bir e-posta adresi giriniz.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Password) && 
                                           e.ErrorMessage == "Şifre gereklidir.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validator_Should_Return_Turkish_Email_Required_Message(string email)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = email ?? string.Empty,
            Password = "validPassword"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi gereklidir.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validator_Should_Return_Turkish_Password_Required_Message(string password)
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "valid@example.com",
            Password = password ?? string.Empty
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginUserDto.Password) && 
                                           e.ErrorMessage == "Şifre gereklidir.");
    }

    [Fact]
    public void Validator_Should_Handle_Special_Turkish_Domain_Extensions()
    {
        // Arrange - Test various Turkish domain extensions
        var validEmails = new[]
        {
            "test@example.com.tr",
            "user@firma.org.tr",
            "admin@site.net.tr",
            "contact@gov.tr",
            "info@bel.tr"
        };

        foreach (var email in validEmails)
        {
            var dto = new LoginUserDto
            {
                Email = email,
                Password = "testPassword"
            };

            // Act
            var result = _validator.Validate(dto);

            // Assert
            result.Errors.Should().NotContain(e => e.PropertyName == nameof(LoginUserDto.Email), 
                $"Email {email} should be valid");
        }
    }

    #endregion
}