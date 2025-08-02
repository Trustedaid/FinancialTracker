using FinanceTracker.Application.Features.Budgets.DTOs;
using FluentValidation;

namespace FinanceTracker.Application.Features.Budgets.Validators;

public class BudgetFilterDtoValidator : AbstractValidator<BudgetFilterDto>
{
    public BudgetFilterDtoValidator()
    {
        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .WithMessage("Geçerli bir kategori ID'si giriniz.")
            .When(x => x.CategoryId.HasValue);

        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12)
            .WithMessage("Ay 1 ile 12 arasında olmalıdır.")
            .When(x => x.Month.HasValue);

        RuleFor(x => x.Year)
            .GreaterThanOrEqualTo(2000)
            .WithMessage("Yıl 2000'den büyük olmalıdır.")
            .LessThanOrEqualTo(DateTime.Now.Year + 10)
            .WithMessage($"Yıl {DateTime.Now.Year + 10}'dan küçük olmalıdır.")
            .When(x => x.Year.HasValue);
    }
}