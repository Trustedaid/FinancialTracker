using FinanceTracker.Application.Features.Budgets.DTOs;
using FluentValidation;

namespace FinanceTracker.Application.Features.Budgets.Validators;

public class UpdateBudgetDtoValidator : AbstractValidator<UpdateBudgetDto>
{
    public UpdateBudgetDtoValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Bütçe tutarı sıfırdan büyük olmalıdır.")
            .LessThanOrEqualTo(999999999.99m)
            .WithMessage("Bütçe tutarı çok yüksek.")
            .ScalePrecision(2, 18)
            .WithMessage("Bütçe tutarı en fazla 2 ondalık basamak içerebilir.");

        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12)
            .WithMessage("Ay 1 ile 12 arasında olmalıdır.");

        RuleFor(x => x.Year)
            .GreaterThanOrEqualTo(2000)
            .WithMessage("Yıl 2000'den büyük olmalıdır.")
            .LessThanOrEqualTo(DateTime.Now.Year + 10)
            .WithMessage($"Yıl {DateTime.Now.Year + 10}'dan küçük olmalıdır.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .WithMessage("Geçerli bir kategori seçiniz.");
    }
}