using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Domain.Entities;
using FluentValidation;

namespace FinanceTracker.Application.Features.Transactions.Validators;

public class CreateTransactionDtoValidator : AbstractValidator<CreateTransactionDto>
{
    public CreateTransactionDtoValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Tutar sıfırdan büyük olmalıdır.")
            .LessThanOrEqualTo(999999999.99m)
            .WithMessage("Tutar çok yüksek.")
            .ScalePrecision(2, 18)
            .WithMessage("Tutar en fazla 2 ondalık basamak içerebilir.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Açıklama gereklidir.")
            .MaximumLength(500)
            .WithMessage("Açıklama en fazla 500 karakter olabilir.");

        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("Tarih gereklidir.")
            .LessThanOrEqualTo(DateTime.Now.AddDays(1))
            .WithMessage("Gelecek tarihlerde işlem oluşturulamaz.");

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Geçerli bir işlem türü seçiniz.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .WithMessage("Geçerli bir kategori seçiniz.");
    }
}