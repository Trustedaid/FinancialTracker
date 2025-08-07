using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Application.Features.Auth.Validators;
using FluentAssertions;
using Xunit;

namespace FinanceTracker.Tests.Unit.Application.Features.Auth.Validators;

public class RegisterUserDtoValidatorTests
{
    private readonly RegisterUserDtoValidator _validator;

    public RegisterUserDtoValidatorTests()
    {
        _validator = new RegisterUserDtoValidator();
    }

    [Fact]
    public void Validator_Should_Pass_With_Valid_RegisterUserDto()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
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
        var dto = new RegisterUserDto
        {
            Email = email ?? string.Empty,
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi gereklidir.");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("test@")]
    [InlineData("@example.com")]
    [InlineData("test.example.com")]
    [InlineData("test@.com")]
    [InlineData("test@com")]
    public void Validator_Should_Fail_When_Email_Format_Is_Invalid(string email)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = email,
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Email) && 
                                           e.ErrorMessage == "Geçerli bir e-posta adresi giriniz.");
    }

    [Fact]
    public void Validator_Should_Fail_When_Email_Exceeds_Maximum_Length()
    {
        // Arrange
        var longEmail = new string('a', 250) + "@test.com"; // 259 characters total
        var dto = new RegisterUserDto
        {
            Email = longEmail,
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi en fazla 255 karakter olabilir.");
    }

    [Theory]
    [InlineData("test@example.com")]
    [InlineData("user.name@domain.co.uk")]
    [InlineData("user+tag@example.org")]
    [InlineData("123@456.com")]
    public void Validator_Should_Pass_With_Valid_Email_Formats(string email)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = email,
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.Email));
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
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = password ?? string.Empty,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Password) && 
                                           e.ErrorMessage == "Şifre gereklidir.");
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("a")]
    [InlineData("abc")]
    public void Validator_Should_Fail_When_Password_Is_Too_Short(string password)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = password,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Password) && 
                                           e.ErrorMessage == "Şifre en az 6 karakter olmalıdır.");
    }

    [Fact]
    public void Validator_Should_Fail_When_Password_Exceeds_Maximum_Length()
    {
        // Arrange
        var longPassword = new string('a', 101); // 101 characters
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = longPassword,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Password) && 
                                           e.ErrorMessage == "Şifre en fazla 100 karakter olabilir.");
    }

    [Theory]
    [InlineData("123456")]
    [InlineData("password")]
    [InlineData("SecurePassword123!")]
    public void Validator_Should_Pass_With_Valid_Password_Lengths(string password)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = password,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.Password));
    }

    [Fact]
    public void Validator_Should_Pass_With_Maximum_Length_Password()
    {
        // Arrange
        var maxLengthPassword = new string('x', 100); // 100 characters - maximum allowed
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = maxLengthPassword,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.Password));
    }

    #endregion

    #region FirstName Validation Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validator_Should_Fail_When_FirstName_Is_Empty_Or_Null(string firstName)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = firstName ?? string.Empty,
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.FirstName) && 
                                           e.ErrorMessage == "Ad gereklidir.");
    }

    [Fact]
    public void Validator_Should_Fail_When_FirstName_Exceeds_Maximum_Length()
    {
        // Arrange
        var longFirstName = new string('A', 101); // 101 characters
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = longFirstName,
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.FirstName) && 
                                           e.ErrorMessage == "Ad en fazla 100 karakter olabilir.");
    }

    [Theory]
    [InlineData("John")]
    [InlineData("Mehmet")]
    [InlineData("José")]
    [InlineData("J")]
    public void Validator_Should_Pass_With_Valid_FirstNames(string firstName)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = firstName,
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.FirstName));
    }

    [Fact]
    public void Validator_Should_Pass_With_Maximum_Length_FirstName()
    {
        // Arrange
        var maxLengthFirstName = new string('A', 100); // 100 characters - maximum allowed
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = maxLengthFirstName,
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.FirstName));
    }

    #endregion

    #region LastName Validation Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validator_Should_Fail_When_LastName_Is_Empty_Or_Null(string lastName)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = lastName ?? string.Empty
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.LastName) && 
                                           e.ErrorMessage == "Soyad gereklidir.");
    }

    [Fact]
    public void Validator_Should_Fail_When_LastName_Exceeds_Maximum_Length()
    {
        // Arrange
        var longLastName = new string('B', 101); // 101 characters
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = longLastName
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.LastName) && 
                                           e.ErrorMessage == "Soyad en fazla 100 karakter olabilir.");
    }

    [Theory]
    [InlineData("Doe")]
    [InlineData("Yılmaz")]
    [InlineData("García")]
    [InlineData("O'Connor")]
    [InlineData("D")]
    public void Validator_Should_Pass_With_Valid_LastNames(string lastName)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = lastName
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.LastName));
    }

    [Fact]
    public void Validator_Should_Pass_With_Maximum_Length_LastName()
    {
        // Arrange
        var maxLengthLastName = new string('B', 100); // 100 characters - maximum allowed
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = "John",
            LastName = maxLengthLastName
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.LastName));
    }

    #endregion

    #region Multiple Validation Errors Tests

    [Fact]
    public void Validator_Should_Return_Multiple_Errors_When_Multiple_Fields_Are_Invalid()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "invalid-email",
            Password = "123", // Too short
            FirstName = "", // Empty
            LastName = new string('X', 101) // Too long
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCount(4);
        
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Email) && 
                                           e.ErrorMessage == "Geçerli bir e-posta adresi giriniz.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Password) && 
                                           e.ErrorMessage == "Şifre en az 6 karakter olmalıdır.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.FirstName) && 
                                           e.ErrorMessage == "Ad gereklidir.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.LastName) && 
                                           e.ErrorMessage == "Soyad en fazla 100 karakter olabilir.");
    }

    [Fact]
    public void Validator_Should_Return_All_Email_Errors_When_Email_Is_Empty()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "",
            Password = "password123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        
        // Empty email should trigger the NotEmpty rule, and EmailAddress rule might not be evaluated
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Email) && 
                                           e.ErrorMessage == "E-posta adresi gereklidir.");
    }

    #endregion

    #region Turkish Character Support Tests

    [Theory]
    [InlineData("Çağlar")]
    [InlineData("Gülay")]
    [InlineData("Ömer")]
    [InlineData("Ümit")]
    [InlineData("İsmail")]
    [InlineData("Şenay")]
    public void Validator_Should_Support_Turkish_Characters_In_Names(string name)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = name,
            LastName = name
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.FirstName));
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.LastName));
    }

    [Theory]
    [InlineData("ahmet@örnek.com")]
    [InlineData("kullanıcı@şirket.com.tr")]
    [InlineData("müşteri@örnekfirma.com")]
    [InlineData("test@türkiye.gov.tr")]
    public void Validator_Should_Support_Turkish_Emails(string turkishEmail)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = turkishEmail,
            Password = "güvenliŞifre123",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.Email));
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("güvenliŞifre")]
    [InlineData("şifre123")]
    [InlineData("parolaİçerikli")]
    [InlineData("türkçeKarakter")]
    public void Validator_Should_Support_Turkish_Characters_In_Passwords(string turkishPassword)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = turkishPassword,
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.Password));
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validator_Should_Return_Turkish_Error_Messages_For_Complete_Turkish_User()
    {
        // Arrange - All fields invalid with Turkish context
        var dto = new RegisterUserDto
        {
            Email = "geçersiz-eposta", // Invalid email format
            Password = "123", // Too short
            FirstName = "", // Empty
            LastName = new string('Ç', 101) // Too long Turkish character
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().HaveCount(4);
        
        // Verify all Turkish error messages
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Email) && 
                                           e.ErrorMessage == "Geçerli bir e-posta adresi giriniz.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.Password) && 
                                           e.ErrorMessage == "Şifre en az 6 karakter olmalıdır.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.FirstName) && 
                                           e.ErrorMessage == "Ad gereklidir.");
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterUserDto.LastName) && 
                                           e.ErrorMessage == "Soyad en fazla 100 karakter olabilir.");
    }

    [Fact]
    public void Validator_Should_Pass_With_Complete_Turkish_User_Registration()
    {
        // Arrange - Complete valid Turkish user registration
        var dto = new RegisterUserDto
        {
            Email = "ahmet.yılmaz@şirket.com.tr",
            Password = "güvenliParola123",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData("Ahmet-Can", "Yılmaz-Özkan")] // Hyphenated names
    [InlineData("Elif Su", "Kaya Demir")] // Names with spaces
    [InlineData("Özge'nin", "D'Angelo")] // Names with apostrophes
    public void Validator_Should_Support_Complex_Turkish_Name_Formats(string firstName, string lastName)
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            Email = "test@example.com",
            Password = "password123",
            FirstName = firstName,
            LastName = lastName
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.FirstName));
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(RegisterUserDto.LastName));
    }

    #endregion
}