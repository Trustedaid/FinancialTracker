using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Common;
using FluentAssertions;

namespace FinanceTracker.Tests.Unit.Domain.Entities;

public class UserTests
{
    [Fact]
    public void User_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.Email.Should().Be(string.Empty);
        user.PasswordHash.Should().Be(string.Empty);
        user.FirstName.Should().Be(string.Empty);
        user.LastName.Should().Be(string.Empty);
        user.Transactions.Should().NotBeNull().And.BeEmpty();
        user.Budgets.Should().NotBeNull().And.BeEmpty();
        user.Categories.Should().NotBeNull().And.BeEmpty();
        user.Id.Should().Be(0); // From BaseEntity
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        user.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void User_Should_Set_Properties_Correctly()
    {
        // Arrange
        var user = new User();
        var testEmail = "test@example.com";
        var testFirstName = "John";
        var testLastName = "Doe";
        var testPasswordHash = "hashedpassword123";

        // Act
        user.Email = testEmail;
        user.FirstName = testFirstName;
        user.LastName = testLastName;
        user.PasswordHash = testPasswordHash;

        // Assert
        user.Email.Should().Be(testEmail);
        user.FirstName.Should().Be(testFirstName);
        user.LastName.Should().Be(testLastName);
        user.PasswordHash.Should().Be(testPasswordHash);
    }

    [Fact]
    public void User_Should_Allow_Navigation_Properties_To_Be_Set()
    {
        // Arrange
        var user = new User();
        var transaction = new Transaction();
        var budget = new Budget();
        var category = new Category();

        // Act
        user.Transactions.Add(transaction);
        user.Budgets.Add(budget);
        user.Categories.Add(category);

        // Assert
        user.Transactions.Should().HaveCount(1).And.Contain(transaction);
        user.Budgets.Should().HaveCount(1).And.Contain(budget);
        user.Categories.Should().HaveCount(1).And.Contain(category);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void User_Should_Handle_Empty_Or_Null_Email(string email)
    {
        // Arrange
        var user = new User();

        // Act
        user.Email = email ?? string.Empty;

        // Assert
        user.Email.Should().Be(email ?? string.Empty);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void User_Should_Handle_Empty_Or_Null_Names(string name)
    {
        // Arrange
        var user = new User();

        // Act
        user.FirstName = name ?? string.Empty;
        user.LastName = name ?? string.Empty;

        // Assert
        user.FirstName.Should().Be(name ?? string.Empty);
        user.LastName.Should().Be(name ?? string.Empty);
    }

    [Fact]
    public void User_Should_Inherit_From_BaseEntity()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.Should().BeAssignableTo<BaseEntity>();
        user.Id.Should().Be(0);
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        user.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void User_Should_Handle_Turkish_Characters_In_Names()
    {
        // Arrange
        var user = new User();
        const string turkishFirstName = "Çağlar";
        const string turkishLastName = "Özgür";

        // Act
        user.FirstName = turkishFirstName;
        user.LastName = turkishLastName;

        // Assert
        user.FirstName.Should().Be(turkishFirstName);
        user.LastName.Should().Be(turkishLastName);
    }

    [Theory]
    [InlineData("test@example.com")]
    [InlineData("very.long.email.address.that.should.still.work@example.com")]
    [InlineData("user+tag@example.co.uk")]
    [InlineData("simple@test.org")]
    [InlineData("türkçe@örnek.com")]
    public void User_Should_Accept_Various_Email_Values(string email)
    {
        // Arrange
        var user = new User();

        // Act
        user.Email = email;

        // Assert
        user.Email.Should().Be(email);
    }

    [Fact]
    public void User_Navigation_Properties_Should_Support_Multiple_Items()
    {
        // Arrange
        var user = new User();
        var transactions = new List<Transaction>
        {
            new() { Description = "Income", Amount = 1000, Type = TransactionType.Income, Date = DateTime.UtcNow },
            new() { Description = "Expense", Amount = 200, Type = TransactionType.Expense, Date = DateTime.UtcNow }
        };
        var budgets = new List<Budget>
        {
            new() { Amount = 500, Month = 1, Year = 2024 },
            new() { Amount = 600, Month = 2, Year = 2024 }
        };
        var categories = new List<Category>
        {
            new() { Name = "Gelir", Color = "#00FF00" },
            new() { Name = "Gider", Color = "#FF0000" }
        };

        // Act
        foreach (var transaction in transactions)
            user.Transactions.Add(transaction);
        
        foreach (var budget in budgets)
            user.Budgets.Add(budget);
            
        foreach (var category in categories)
            user.Categories.Add(category);

        // Assert
        user.Transactions.Should().HaveCount(2);
        user.Budgets.Should().HaveCount(2);
        user.Categories.Should().HaveCount(2);
        user.Transactions.Should().Contain(t => t.Description == "Income");
        user.Transactions.Should().Contain(t => t.Description == "Expense");
        user.Budgets.Should().Contain(b => b.Amount == 500);
        user.Categories.Should().Contain(c => c.Name == "Gelir");
    }

    [Fact]
    public void User_Should_Allow_Clearing_Navigation_Properties()
    {
        // Arrange
        var user = new User();
        user.Transactions.Add(new Transaction { Amount = 100, Description = "Test", Date = DateTime.UtcNow, Type = TransactionType.Income });
        user.Budgets.Add(new Budget { Amount = 200, Month = 1, Year = 2024 });
        user.Categories.Add(new Category { Name = "Test", Color = "#FF0000" });

        // Act
        user.Transactions.Clear();
        user.Budgets.Clear();
        user.Categories.Clear();

        // Assert
        user.Transactions.Should().BeEmpty();
        user.Budgets.Should().BeEmpty();
        user.Categories.Should().BeEmpty();
    }

    [Fact]
    public void User_PasswordHash_Should_Be_Settable()
    {
        // Arrange
        var user = new User();
        const string hashedPassword = "$2a$11$abcdefghijklmnopqrstuvwxyz123456789";

        // Act
        user.PasswordHash = hashedPassword;

        // Assert
        user.PasswordHash.Should().Be(hashedPassword);
        user.PasswordHash.Should().NotBeEmpty();
    }
}