using FinanceTracker.Application.Features.Categories.DTOs;
using FinanceTracker.Domain.Exceptions;
using FinanceTracker.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Application.Features.Categories.Commands;

public record UpdateCategoryCommand(int Id, UpdateCategoryDto CategoryDto, int UserId) : IRequest<CategoryDto>;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.UserId == request.UserId, cancellationToken);

        if (category == null)
        {
            throw new NotFoundException("Category", request.Id);
        }

        // Check if another category with same name already exists for this user
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && 
                                    c.Id != request.Id &&
                                    c.Name.ToLower() == request.CategoryDto.Name.ToLower(), 
                                    cancellationToken);

        if (existingCategory != null)
        {
            throw new ConflictException("Category", "name already exists");
        }

        // Update category properties
        category.Name = request.CategoryDto.Name;
        category.Description = request.CategoryDto.Description;
        category.Color = request.CategoryDto.Color;
        category.UpdatedAt = DateTime.UtcNow;

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