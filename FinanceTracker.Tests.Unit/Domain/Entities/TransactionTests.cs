using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Common;
using FluentAssertions;

namespace FinanceTracker.Tests.Unit.Domain.Entities;

public class TransactionTests
{
    [Fact]
    public void Transaction_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var transaction = new Transaction();

        // Assert
        transaction.Amount.Should().Be(0);
        transaction.Description.Should().Be(string.Empty);
        transaction.Date.Should().Be(default(DateTime));
        transaction.Type.Should().Be(default(TransactionType));
        transaction.UserId.Should().Be(0);
        transaction.CategoryId.Should().Be(0);
        transaction.User.Should().BeNull();
        transaction.Category.Should().BeNull();
        transaction.Id.Should().Be(0); // From BaseEntity
        transaction.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        transaction.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData(100.50)]
    [InlineData(0)]
    [InlineData(-50.25)]
    [InlineData(999999.99)]
    public void Transaction_Should_Set_Amount_Correctly(decimal amount)
    {
        // Arrange
        var transaction = new Transaction();

        // Act
        transaction.Amount = amount;

        // Assert
        transaction.Amount.Should().Be(amount);
    }

    [Theory]
    [InlineData("Grocery shopping")]
    [InlineData("Salary payment")]
    [InlineData("")]
    [InlineData("Very long description that contains multiple words and should be handled properly")]
    public void Transaction_Should_Set_Description_Correctly(string description)
    {
        // Arrange
        var transaction = new Transaction();

        // Act
        transaction.Description = description;

        // Assert
        transaction.Description.Should().Be(description);
    }

    [Fact]
    public void Transaction_Should_Set_Date_Correctly()
    {
        // Arrange
        var transaction = new Transaction();
        var testDate = new DateTime(2024, 1, 15, 14, 30, 0);

        // Act
        transaction.Date = testDate;

        // Assert
        transaction.Date.Should().Be(testDate);
    }

    [Theory]
    [InlineData(TransactionType.Income)]
    [InlineData(TransactionType.Expense)]
    public void Transaction_Should_Set_Type_Correctly(TransactionType type)
    {
        // Arrange
        var transaction = new Transaction();

        // Act
        transaction.Type = type;

        // Assert
        transaction.Type.Should().Be(type);
    }

    [Fact]
    public void Transaction_Should_Set_Foreign_Keys_Correctly()
    {
        // Arrange
        var transaction = new Transaction();
        var userId = 123;
        var categoryId = 456;

        // Act
        transaction.UserId = userId;
        transaction.CategoryId = categoryId;

        // Assert
        transaction.UserId.Should().Be(userId);
        transaction.CategoryId.Should().Be(categoryId);
    }

    [Fact]
    public void Transaction_Should_Set_Navigation_Properties_Correctly()
    {
        // Arrange
        var transaction = new Transaction();
        var user = new User { Id = 123, Email = "test@example.com" };
        var category = new Category { Id = 456, Name = "Food" };

        // Act
        transaction.User = user;
        transaction.Category = category;

        // Assert
        transaction.User.Should().Be(user);
        transaction.Category.Should().Be(category);
    }

    [Fact]
    public void Transaction_Should_Create_Complete_Transaction()
    {
        // Arrange & Act
        var transaction = new Transaction
        {
            Amount = 150.75m,
            Description = "Monthly groceries",
            Date = DateTime.Today,
            Type = TransactionType.Expense,
            UserId = 1,
            CategoryId = 2
        };

        // Assert
        transaction.Amount.Should().Be(150.75m);
        transaction.Description.Should().Be("Monthly groceries");
        transaction.Date.Should().Be(DateTime.Today);
        transaction.Type.Should().Be(TransactionType.Expense);
        transaction.UserId.Should().Be(1);
        transaction.CategoryId.Should().Be(2);
    }

    [Fact]
    public void Transaction_Should_Inherit_From_BaseEntity()
    {
        // Arrange & Act
        var transaction = new Transaction();

        // Assert
        transaction.Should().BeAssignableTo<BaseEntity>();
        transaction.Id.Should().Be(0);
        transaction.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        transaction.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData("Market alışverişi")]
    [InlineData("Maaş ödemesi")]
    [InlineData("Elektrik faturası")]
    [InlineData("Çiğköfte aldım")]
    [InlineData("İş yemeği - müşteriyle görüşme")]
    public void Transaction_Should_Handle_Turkish_Descriptions(string turkishDescription)
    {
        // Arrange
        var transaction = new Transaction();

        // Act
        transaction.Description = turkishDescription;

        // Assert
        transaction.Description.Should().Be(turkishDescription);
    }

    [Theory]
    [InlineData(0.01)]
    [InlineData(0.50)]
    [InlineData(0.99)]
    [InlineData(1000000.00)]
    [InlineData(9999999.99)]
    public void Transaction_Should_Handle_Edge_Case_Amounts(decimal amount)
    {
        // Arrange
        var transaction = new Transaction();

        // Act
        transaction.Amount = amount;

        // Assert
        transaction.Amount.Should().Be(amount);
    }

    [Fact]
    public void Transaction_Should_Handle_Future_And_Past_Dates()
    {
        // Arrange
        var transaction = new Transaction();
        var pastDate = DateTime.UtcNow.AddYears(-5);
        var futureDate = DateTime.UtcNow.AddYears(1);

        // Act & Assert - Past date
        transaction.Date = pastDate;
        transaction.Date.Should().Be(pastDate);

        // Act & Assert - Future date
        transaction.Date = futureDate;
        transaction.Date.Should().Be(futureDate);
    }

    [Fact]
    public void Transaction_Should_Allow_Null_Navigation_Properties_Initially()
    {
        // Arrange & Act
        var transaction = new Transaction();

        // Assert
        transaction.User.Should().BeNull();
        transaction.Category.Should().BeNull();
    }

    [Fact]
    public void Transaction_Navigation_Properties_Should_Be_Settable_To_Null()
    {
        // Arrange
        var transaction = new Transaction
        {
            User = new User { Email = "test@test.com" },
            Category = new Category { Name = "Test" }
        };

        // Act
        transaction.User = null!;
        transaction.Category = null!;

        // Assert
        transaction.User.Should().BeNull();
        transaction.Category.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData("\t")]
    [InlineData("\n")]
    public void Transaction_Should_Handle_Whitespace_Descriptions(string description)
    {
        // Arrange
        var transaction = new Transaction();

        // Act
        transaction.Description = description;

        // Assert
        transaction.Description.Should().Be(description);
    }
}

public class TransactionTypeTests
{
    [Fact]
    public void TransactionType_Should_Have_Correct_Values()
    {
        // Assert
        ((int)TransactionType.Income).Should().Be(1);
        ((int)TransactionType.Expense).Should().Be(2);
    }

    [Fact]
    public void TransactionType_Should_Have_Only_Two_Values()
    {
        // Act
        var values = Enum.GetValues<TransactionType>();

        // Assert
        values.Should().HaveCount(2);
        values.Should().Contain(TransactionType.Income);
        values.Should().Contain(TransactionType.Expense);
    }
}