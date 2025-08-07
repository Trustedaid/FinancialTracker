using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Common;
using FluentAssertions;

namespace FinanceTracker.Tests.Unit.Domain.Entities;

public class BudgetTests
{
    [Fact]
    public void Budget_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var budget = new Budget();

        // Assert
        budget.Amount.Should().Be(0);
        budget.SpentAmount.Should().Be(0);
        budget.Month.Should().Be(0);
        budget.Year.Should().Be(0);
        budget.UserId.Should().Be(0);
        budget.CategoryId.Should().Be(0);
        budget.User.Should().BeNull();
        budget.Category.Should().BeNull();
        budget.Id.Should().Be(0); // From BaseEntity
        budget.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        budget.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData(1000.00)]
    [InlineData(0)]
    [InlineData(999999.99)]
    [InlineData(0.01)]
    public void Budget_Should_Set_Amount_Correctly(decimal amount)
    {
        // Arrange
        var budget = new Budget();

        // Act
        budget.Amount = amount;

        // Assert
        budget.Amount.Should().Be(amount);
    }

    [Theory]
    [InlineData(500.50)]
    [InlineData(0)]
    [InlineData(1000.00)]
    public void Budget_Should_Set_SpentAmount_Correctly(decimal spentAmount)
    {
        // Arrange
        var budget = new Budget();

        // Act
        budget.SpentAmount = spentAmount;

        // Assert
        budget.SpentAmount.Should().Be(spentAmount);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(6)]
    [InlineData(12)]
    public void Budget_Should_Set_Month_Correctly(int month)
    {
        // Arrange
        var budget = new Budget();

        // Act
        budget.Month = month;

        // Assert
        budget.Month.Should().Be(month);
    }

    [Theory]
    [InlineData(2024)]
    [InlineData(2023)]
    [InlineData(2025)]
    public void Budget_Should_Set_Year_Correctly(int year)
    {
        // Arrange
        var budget = new Budget();

        // Act
        budget.Year = year;

        // Assert
        budget.Year.Should().Be(year);
    }

    [Fact]
    public void Budget_Should_Set_Foreign_Keys_Correctly()
    {
        // Arrange
        var budget = new Budget();
        var userId = 123;
        var categoryId = 456;

        // Act
        budget.UserId = userId;
        budget.CategoryId = categoryId;

        // Assert
        budget.UserId.Should().Be(userId);
        budget.CategoryId.Should().Be(categoryId);
    }

    [Fact]
    public void Budget_Should_Set_Navigation_Properties_Correctly()
    {
        // Arrange
        var budget = new Budget();
        var user = new User { Id = 123, Email = "test@example.com" };
        var category = new Category { Id = 456, Name = "Food" };

        // Act
        budget.User = user;
        budget.Category = category;

        // Assert
        budget.User.Should().Be(user);
        budget.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(1000, 300, 700)]
    [InlineData(500, 500, 0)]
    [InlineData(1000, 0, 1000)]
    [InlineData(100, 150, -50)] // Over budget scenario
    public void Budget_RemainingAmount_Should_Calculate_Correctly(decimal amount, decimal spentAmount, decimal expectedRemaining)
    {
        // Arrange
        var budget = new Budget
        {
            Amount = amount,
            SpentAmount = spentAmount
        };

        // Act
        var remainingAmount = budget.RemainingAmount;

        // Assert
        remainingAmount.Should().Be(expectedRemaining);
    }

    [Theory]
    [InlineData(1000, 300, 30)]
    [InlineData(500, 500, 100)]
    [InlineData(1000, 0, 0)]
    [InlineData(100, 150, 150)] // Over budget scenario
    [InlineData(0, 100, 0)] // Division by zero scenario
    public void Budget_PercentageUsed_Should_Calculate_Correctly(decimal amount, decimal spentAmount, decimal expectedPercentage)
    {
        // Arrange
        var budget = new Budget
        {
            Amount = amount,
            SpentAmount = spentAmount
        };

        // Act
        var percentageUsed = budget.PercentageUsed;

        // Assert
        percentageUsed.Should().Be(expectedPercentage);
    }

    [Fact]
    public void Budget_Should_Handle_Zero_Amount_Without_Exception()
    {
        // Arrange
        var budget = new Budget
        {
            Amount = 0,
            SpentAmount = 100
        };

        // Act & Assert
        budget.PercentageUsed.Should().Be(0);
        budget.RemainingAmount.Should().Be(-100);
    }

    [Fact]
    public void Budget_Should_Create_Complete_Budget()
    {
        // Arrange & Act
        var budget = new Budget
        {
            Amount = 1500.00m,
            SpentAmount = 750.25m,
            Month = 3,
            Year = 2024,
            UserId = 1,
            CategoryId = 2
        };

        // Assert
        budget.Amount.Should().Be(1500.00m);
        budget.SpentAmount.Should().Be(750.25m);
        budget.Month.Should().Be(3);
        budget.Year.Should().Be(2024);
        budget.UserId.Should().Be(1);
        budget.CategoryId.Should().Be(2);
        budget.RemainingAmount.Should().Be(749.75m);
        budget.PercentageUsed.Should().BeApproximately(50.02m, 0.01m);
    }

    [Fact]
    public void Budget_Should_Handle_Negative_SpentAmount()
    {
        // Arrange
        var budget = new Budget
        {
            Amount = 1000,
            SpentAmount = -100 // This might represent a refund or correction
        };

        // Act & Assert
        budget.RemainingAmount.Should().Be(1100);
        budget.PercentageUsed.Should().Be(-10);
    }

    [Fact]
    public void Budget_Calculated_Properties_Should_Update_When_Values_Change()
    {
        // Arrange
        var budget = new Budget
        {
            Amount = 1000,
            SpentAmount = 200
        };

        // Act - First check
        budget.RemainingAmount.Should().Be(800);
        budget.PercentageUsed.Should().Be(20);

        // Act - Update values
        budget.SpentAmount = 600;

        // Assert - Values should update
        budget.RemainingAmount.Should().Be(400);
        budget.PercentageUsed.Should().Be(60);
    }

    [Fact]
    public void Budget_Should_Inherit_From_BaseEntity()
    {
        // Arrange & Act
        var budget = new Budget();

        // Assert
        budget.Should().BeAssignableTo<BaseEntity>();
        budget.Id.Should().Be(0);
        budget.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        budget.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData(1, 2024, "Ocak 2024")]
    [InlineData(6, 2024, "Haziran 2024")]
    [InlineData(12, 2024, "Aralık 2024")]
    public void Budget_Should_Handle_Turkish_Month_Context(int month, int year, string contextDescription)
    {
        // Arrange & Act
        var budget = new Budget
        {
            Month = month,
            Year = year,
            Amount = 1000
        };

        // Assert
        budget.Month.Should().Be(month);
        budget.Year.Should().Be(year);
        // Context check - this would be useful for Turkish month names in UI
        budget.Should().NotBeNull($"Budget should be valid for {contextDescription}");
    }

    [Theory]
    [InlineData(0, 1)] // Invalid month
    [InlineData(13, 1)] // Invalid month
    [InlineData(-1, 1)] // Invalid month
    public void Budget_Should_Allow_Invalid_Month_Values_For_Database_Flexibility(int invalidMonth, int year)
    {
        // Arrange & Act
        var budget = new Budget
        {
            Month = invalidMonth,
            Year = year,
            Amount = 1000
        };

        // Assert - Domain should allow invalid values (validation happens at application layer)
        budget.Month.Should().Be(invalidMonth);
        budget.Year.Should().Be(year);
    }

    [Fact]
    public void Budget_Should_Handle_Large_Turkish_Lira_Amounts()
    {
        // Arrange & Act
        var budget = new Budget
        {
            Amount = 99999999.99m, // Large Turkish Lira amount
            SpentAmount = 1500.50m,
            Month = 3,
            Year = 2024
        };

        // Assert
        budget.Amount.Should().Be(99999999.99m);
        budget.SpentAmount.Should().Be(1500.50m);
        budget.RemainingAmount.Should().Be(99998499.49m);
        budget.PercentageUsed.Should().BeApproximately(0.00150m, 0.00001m); // Very small percentage
    }

    [Fact]
    public void Budget_Should_Handle_Precision_With_Turkish_Kurus()
    {
        // Arrange - Turkish currency has kuruş (1/100 of a lira)
        var budget = new Budget
        {
            Amount = 1000.99m, // 1000 lira and 99 kuruş
            SpentAmount = 500.45m // 500 lira and 45 kuruş
        };

        // Act & Assert
        budget.RemainingAmount.Should().Be(500.54m); // 500 lira and 54 kuruş
        budget.PercentageUsed.Should().BeApproximately(49.99m, 0.01m);
    }

    [Fact]
    public void Budget_Should_Support_Turkish_Category_Context()
    {
        // Arrange
        var budget = new Budget();
        var turkishCategory = new Category
        {
            Name = "Market",
            Description = "Günlük alışveriş harcamaları",
            Color = "#FF5722"
        };
        var turkishUser = new User
        {
            FirstName = "Ahmet",
            LastName = "Yılmaz",
            Email = "ahmet@example.com"
        };

        // Act
        budget.Category = turkishCategory;
        budget.User = turkishUser;
        budget.Amount = 2500.00m;
        budget.Month = 4; // Nisan
        budget.Year = 2024;

        // Assert
        budget.Category?.Name.Should().Be("Market");
        budget.User?.FirstName.Should().Be("Ahmet");
        budget.Amount.Should().Be(2500.00m);
    }

    [Theory]
    [InlineData(1000, 1000, 100)] // Exactly at budget
    [InlineData(1000, 1200, 120)] // Over budget
    [InlineData(1000, 0, 0)] // No spending
    [InlineData(1000, 250, 25)] // Quarter spent
    public void Budget_PercentageUsed_Should_Handle_Common_Turkish_Budget_Scenarios(decimal amount, decimal spent, decimal expectedPercentage)
    {
        // Arrange
        var budget = new Budget
        {
            Amount = amount,
            SpentAmount = spent
        };

        // Act & Assert
        budget.PercentageUsed.Should().Be(expectedPercentage);
    }

    [Fact]
    public void Budget_Should_Allow_Setting_Navigation_Properties_To_Null()
    {
        // Arrange
        var budget = new Budget
        {
            User = new User { Email = "test@test.com" },
            Category = new Category { Name = "Test" }
        };

        // Act
        budget.User = null!;
        budget.Category = null!;

        // Assert
        budget.User.Should().BeNull();
        budget.Category.Should().BeNull();
    }

    [Fact]
    public void Budget_Should_Handle_Decimal_Edge_Cases()
    {
        // Arrange & Act
        var budget = new Budget
        {
            Amount = decimal.MaxValue,
            SpentAmount = decimal.MinValue
        };

        // Assert
        budget.Amount.Should().Be(decimal.MaxValue);
        budget.SpentAmount.Should().Be(decimal.MinValue);
        // RemainingAmount calculation should not throw
        var remaining = budget.RemainingAmount;
        // Note: decimal.MaxValue - decimal.MinValue causes overflow, so we test that no exception is thrown
        Action act = () => { var _ = budget.RemainingAmount; };
        act.Should().NotThrow();
    }
}