using FinanceTracker.Application.Features.Auth.DTOs;
using FinanceTracker.Application.Common.Validators;
using FluentValidation;

namespace FinanceTracker.Application.Features.Auth.Validators;

public class LoginUserDtoValidator : AbstractValidator<LoginUserDto>
{
    public LoginUserDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi gereklidir.");

        RuleFor(x => x.Email)
            .Must(EmailValidator.IsValidEmail).WithMessage("Geçerli bir e-posta adresi giriniz.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre gereklidir.");
    }
}