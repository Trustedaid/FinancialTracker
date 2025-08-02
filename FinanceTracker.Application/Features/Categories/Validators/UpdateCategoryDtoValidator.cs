using FinanceTracker.Application.Features.Categories.DTOs;
using FluentValidation;
using System.Text.RegularExpressions;

namespace FinanceTracker.Application.Features.Categories.Validators;

public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Kategori adı gereklidir.")
            .MaximumLength(100)
            .WithMessage("Kategori adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Açıklama en fazla 500 karakter olabilir.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Color)
            .NotEmpty()
            .WithMessage("Renk kodu gereklidir.")
            .Must(BeValidHexColor)
            .WithMessage("Geçerli bir hex renk kodu giriniz (örn: #FF0000).");
    }

    private static bool BeValidHexColor(string color)
    {
        if (string.IsNullOrEmpty(color))
            return false;

        return Regex.IsMatch(color, @"^#[0-9A-Fa-f]{6}$");
    }
}