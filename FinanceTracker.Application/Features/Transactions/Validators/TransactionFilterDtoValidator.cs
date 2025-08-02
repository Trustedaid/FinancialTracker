using FinanceTracker.Application.Features.Transactions.DTOs;
using FluentValidation;

namespace FinanceTracker.Application.Features.Transactions.Validators;

public class TransactionFilterDtoValidator : AbstractValidator<TransactionFilterDto>
{
    public TransactionFilterDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Sayfa numarası 1'den büyük olmalıdır.");

        RuleFor(x => x.PageSize)
            .GreaterThan(0)
            .WithMessage("Sayfa boyutu 1'den büyük olmalıdır.")
            .LessThanOrEqualTo(1000)
            .WithMessage("Sayfa boyutu en fazla 1000 olabilir.");

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Geçerli bir işlem türü seçiniz.")
            .When(x => x.Type.HasValue);

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .WithMessage("Geçerli bir kategori ID'si giriniz.")
            .When(x => x.CategoryId.HasValue);

        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("Başlangıç tarihi bitiş tarihinden büyük olamaz.")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Bitiş tarihi başlangıç tarihinden küçük olamaz.")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);
    }
}