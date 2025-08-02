using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Application.Common.Validators;
using FluentValidation;

namespace FinanceTracker.Application.Features.Auth.Validators;

public class LoginUserDtoValidator : AbstractValidator<LoginUserDto>
{
    public LoginUserDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi gereklidir.")
            .Must(EmailValidator.IsValidEmail).WithMessage("Geçerli bir e-posta adresi giriniz.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre gereklidir.");
    }
}