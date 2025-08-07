using FinanceTracker.Application.Features.Categories.DTOs;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Categories.Commands;

public record CreateCategoryCommand(CreateCategoryDto CategoryDto, int UserId) : IRequest<CategoryDto>;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Check if category with same name already exists for this user
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && 
                                    c.Name.ToLower() == request.CategoryDto.Name.ToLower(), 
                                    cancellationToken);

        if (existingCategory != null)
        {
            throw new ConflictException("Category", "name already exists");
        }

        var category = new Category
        {
            Name = request.CategoryDto.Name,
            Description = request.CategoryDto.Description,
            Color = request.CategoryDto.Color,
            UserId = request.UserId,
            IsDefault = false
        };

        _context.AddCategory(category);
        await _context.SaveChangesAsync(cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            Color = category.Color,
            IsDefault = category.IsDefault,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}