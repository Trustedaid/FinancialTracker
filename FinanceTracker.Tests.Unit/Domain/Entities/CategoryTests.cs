using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Common;
using FluentAssertions;

namespace FinanceTracker.Tests.Unit.Domain.Entities;

public class CategoryTests
{
    [Fact]
    public void Category_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var category = new Category();

        // Assert
        category.Name.Should().Be(string.Empty);
        category.Description.Should().BeNull();
        category.Color.Should().Be("#000000");
        category.IsDefault.Should().BeFalse();
        category.UserId.Should().Be(0);
        category.Transactions.Should().NotBeNull().And.BeEmpty();
        category.Budgets.Should().NotBeNull().And.BeEmpty();
        category.User.Should().BeNull();
        category.Id.Should().Be(0); // From BaseEntity
        category.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        category.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData("Food")]
    [InlineData("Transportation")]
    [InlineData("")]
    [InlineData("Very Long Category Name That Should Be Handled Properly")]
    public void Category_Should_Set_Name_Correctly(string name)
    {
        // Arrange
        var category = new Category();

        // Act
        category.Name = name;

        // Assert
        category.Name.Should().Be(name);
    }

    [Theory]
    [InlineData("Daily food expenses")]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("Very detailed description of what this category represents")]
    public void Category_Should_Set_Description_Correctly(string description)
    {
        // Arrange
        var category = new Category();

        // Act
        category.Description = description;

        // Assert
        category.Description.Should().Be(description);
    }

    [Theory]
    [InlineData("#FF0000")]
    [InlineData("#00FF00")]
    [InlineData("#0000FF")]
    [InlineData("#FFFFFF")]
    [InlineData("#000000")]
    [InlineData("red")]
    [InlineData("")]
    public void Category_Should_Set_Color_Correctly(string color)
    {
        // Arrange
        var category = new Category();

        // Act
        category.Color = color;

        // Assert
        category.Color.Should().Be(color);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Category_Should_Set_IsDefault_Correctly(bool isDefault)
    {
        // Arrange
        var category = new Category();

        // Act
        category.IsDefault = isDefault;

        // Assert
        category.IsDefault.Should().Be(isDefault);
    }

    [Fact]
    public void Category_Should_Set_UserId_Correctly()
    {
        // Arrange
        var category = new Category();
        var userId = 123;

        // Act
        category.UserId = userId;

        // Assert
        category.UserId.Should().Be(userId);
    }

    [Fact]
    public void Category_Should_Set_Navigation_Properties_Correctly()
    {
        // Arrange
        var category = new Category();
        var user = new User { Id = 123, Email = "test@example.com" };
        var transaction = new Transaction();
        var budget = new Budget();

        // Act
        category.User = user;
        category.Transactions.Add(transaction);
        category.Budgets.Add(budget);

        // Assert
        category.User.Should().Be(user);
        category.Transactions.Should().HaveCount(1).And.Contain(transaction);
        category.Budgets.Should().HaveCount(1).And.Contain(budget);
    }

    [Fact]
    public void Category_Should_Create_Complete_Category()
    {
        // Arrange & Act
        var category = new Category
        {
            Name = "Food & Dining",
            Description = "Expenses for meals and dining out",
            Color = "#FF5722",
            IsDefault = true,
            UserId = 1
        };

        // Assert
        category.Name.Should().Be("Food & Dining");
        category.Description.Should().Be("Expenses for meals and dining out");
        category.Color.Should().Be("#FF5722");
        category.IsDefault.Should().BeTrue();
        category.UserId.Should().Be(1);
    }

    [Fact]
    public void Category_Should_Handle_Multiple_Transactions()
    {
        // Arrange
        var category = new Category();
        var transaction1 = new Transaction { Description = "Grocery" };
        var transaction2 = new Transaction { Description = "Restaurant" };
        var transaction3 = new Transaction { Description = "Coffee" };

        // Act
        category.Transactions.Add(transaction1);
        category.Transactions.Add(transaction2);
        category.Transactions.Add(transaction3);

        // Assert
        category.Transactions.Should().HaveCount(3);
        category.Transactions.Should().Contain(new[] { transaction1, transaction2, transaction3 });
    }

    [Fact]
    public void Category_Should_Handle_Multiple_Budgets()
    {
        // Arrange
        var category = new Category();
        var budget1 = new Budget { Amount = 500 };
        var budget2 = new Budget { Amount = 600 };

        // Act
        category.Budgets.Add(budget1);
        category.Budgets.Add(budget2);

        // Assert
        category.Budgets.Should().HaveCount(2);
        category.Budgets.Should().Contain(new[] { budget1, budget2 });
    }

    [Fact]
    public void Category_Should_Inherit_From_BaseEntity()
    {
        // Arrange & Act
        var category = new Category();

        // Assert
        category.Should().BeAssignableTo<BaseEntity>();
        category.Id.Should().Be(0);
        category.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        category.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData("Yemek")]
    [InlineData("Ulaşım")]
    [InlineData("Sağlık")]
    [InlineData("Eğlence")]
    [InlineData("Fatura")]
    [InlineData("Maaş")]
    [InlineData("Yatırım")]
    [InlineData("Alışveriş")]
    public void Category_Should_Handle_Turkish_Category_Names(string turkishName)
    {
        // Arrange
        var category = new Category();

        // Act
        category.Name = turkishName;

        // Assert
        category.Name.Should().Be(turkishName);
    }

    [Theory]
    [InlineData("Günlük yemek harcamaları")]
    [InlineData("Toplu taşıma ve taksi ücretleri")]
    [InlineData("Doktor muayene ve ilaç masrafları")]
    [InlineData("Sinema, tiyatro ve konser biletleri")]
    public void Category_Should_Handle_Turkish_Descriptions(string turkishDescription)
    {
        // Arrange
        var category = new Category();

        // Act
        category.Description = turkishDescription;

        // Assert
        category.Description.Should().Be(turkishDescription);
    }

    [Fact]
    public void Category_Should_Support_Default_Turkish_Categories()
    {
        // Arrange & Act
        var incomeCategory = new Category
        {
            Name = "Maaş",
            Description = "Aylık maaş geliri",
            Color = "#4CAF50",
            IsDefault = true
        };

        var expenseCategory = new Category
        {
            Name = "Market",
            Description = "Günlük ihtiyaç alışverişi",
            Color = "#F44336",
            IsDefault = true
        };

        // Assert
        incomeCategory.Name.Should().Be("Maaş");
        incomeCategory.Description.Should().Be("Aylık maaş geliri");
        incomeCategory.IsDefault.Should().BeTrue();

        expenseCategory.Name.Should().Be("Market");
        expenseCategory.Description.Should().Be("Günlük ihtiyaç alışverişi");
        expenseCategory.IsDefault.Should().BeTrue();
    }

    [Theory]
    [InlineData("#FF5733")]
    [InlineData("#33FF57")]
    [InlineData("#3357FF")]
    [InlineData("#FFB533")]
    [InlineData("#B533FF")]
    public void Category_Should_Accept_Various_Hex_Colors(string hexColor)
    {
        // Arrange
        var category = new Category();

        // Act
        category.Color = hexColor;

        // Assert
        category.Color.Should().Be(hexColor);
    }

    [Fact]
    public void Category_Should_Allow_Clearing_Collections()
    {
        // Arrange
        var category = new Category();
        category.Transactions.Add(new Transaction { Description = "Test", Amount = 100, Date = DateTime.UtcNow, Type = TransactionType.Expense });
        category.Budgets.Add(new Budget { Amount = 200, Month = 1, Year = 2024 });

        // Act
        category.Transactions.Clear();
        category.Budgets.Clear();

        // Assert
        category.Transactions.Should().BeEmpty();
        category.Budgets.Should().BeEmpty();
    }

    [Fact]
    public void Category_Navigation_Properties_Should_Initialize_As_Empty_Collections()
    {
        // Arrange & Act
        var category = new Category();

        // Assert
        category.Transactions.Should().NotBeNull().And.BeOfType<List<Transaction>>();
        category.Budgets.Should().NotBeNull().And.BeOfType<List<Budget>>();
        category.Transactions.Should().BeEmpty();
        category.Budgets.Should().BeEmpty();
    }

    [Fact]
    public void Category_Should_Allow_Setting_User_Navigation_Property()
    {
        // Arrange
        var category = new Category();
        var user = new User
        {
            Id = 1,
            Email = "user@example.com",
            FirstName = "Ahmet",
            LastName = "Yılmaz"
        };

        // Act
        category.User = user;
        category.UserId = user.Id;

        // Assert
        category.User.Should().Be(user);
        category.UserId.Should().Be(user.Id);
    }
}