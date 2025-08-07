using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Application.Features.Transactions.Queries;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Interfaces;
using MockQueryable.Moq;
using Moq;
using Xunit;

namespace FinanceTracker.Tests.Unit.Application.Features.Transactions.Queries;

public class GetMonthlySummaryQueryTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly GetMonthlySummaryQueryHandler _handler;

    public GetMonthlySummaryQueryTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _handler = new GetMonthlySummaryQueryHandler(_mockContext.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Monthly_Summary_With_Correct_Calculations()
    {
        // Arrange
        var userId = 1;
        var year = 2025;
        var month = 8;
        
        var transactions = new List<Transaction>
        {
            new() { Id = 1, UserId = userId, Amount = 1000, Type = TransactionType.Income, Date = new DateTime(2025, 8, 1) },
            new() { Id = 2, UserId = userId, Amount = 2000, Type = TransactionType.Income, Date = new DateTime(2025, 8, 15) },
            new() { Id = 3, UserId = userId, Amount = 500, Type = TransactionType.Expense, Date = new DateTime(2025, 8, 10) },
            new() { Id = 4, UserId = userId, Amount = 300, Type = TransactionType.Expense, Date = new DateTime(2025, 8, 20) },
            // Transaction from different month - should not be included
            new() { Id = 5, UserId = userId, Amount = 1000, Type = TransactionType.Income, Date = new DateTime(2025, 7, 1) },
            // Transaction from different user - should not be included
            new() { Id = 6, UserId = 2, Amount = 1000, Type = TransactionType.Income, Date = new DateTime(2025, 8, 1) }
        }.AsQueryable().BuildMockDbSet();

        _mockContext.Setup(x => x.Transactions).Returns(transactions.Object);

        var query = new GetMonthlySummaryQuery(year, month, userId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal(3000m, result.TotalIncome); // 1000 + 2000
        Assert.Equal(800m, result.TotalExpense); // 500 + 300
        Assert.Equal(2200m, result.Balance); // 3000 - 800
        Assert.Equal(month, result.Month);
        Assert.Equal(year, result.Year);
    }

    [Fact]
    public async Task Handle_Should_Return_Zero_Values_When_No_Transactions()
    {
        // Arrange
        var userId = 1;
        var year = 2025;
        var month = 8;
        
        var transactions = new List<Transaction>().AsQueryable().BuildMockDbSet();
        _mockContext.Setup(x => x.Transactions).Returns(transactions.Object);

        var query = new GetMonthlySummaryQuery(year, month, userId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal(0m, result.TotalIncome);
        Assert.Equal(0m, result.TotalExpense);
        Assert.Equal(0m, result.Balance);
        Assert.Equal(month, result.Month);
        Assert.Equal(year, result.Year);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(13)]
    [InlineData(-1)]
    public async Task Handle_Should_Throw_ArgumentException_For_Invalid_Month(int invalidMonth)
    {
        // Arrange
        var query = new GetMonthlySummaryQuery(2025, invalidMonth, 1);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(query, CancellationToken.None));
    }

    [Theory]
    [InlineData(1800)]
    [InlineData(2040)]
    public async Task Handle_Should_Throw_ArgumentException_For_Invalid_Year(int invalidYear)
    {
        // Arrange
        var query = new GetMonthlySummaryQuery(invalidYear, 8, 1);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_Should_Only_Include_Transactions_From_Specified_Month_And_Year()
    {
        // Arrange
        var userId = 1;
        var year = 2025;
        var month = 8;
        
        var transactions = new List<Transaction>
        {
            // August 2025 transactions - should be included
            new() { Id = 1, UserId = userId, Amount = 1000, Type = TransactionType.Income, Date = new DateTime(2025, 8, 1) },
            new() { Id = 2, UserId = userId, Amount = 500, Type = TransactionType.Expense, Date = new DateTime(2025, 8, 31) },
            
            // July 2025 transactions - should not be included
            new() { Id = 3, UserId = userId, Amount = 2000, Type = TransactionType.Income, Date = new DateTime(2025, 7, 31) },
            
            // September 2025 transactions - should not be included
            new() { Id = 4, UserId = userId, Amount = 800, Type = TransactionType.Expense, Date = new DateTime(2025, 9, 1) },
            
            // August 2024 transactions - should not be included
            new() { Id = 5, UserId = userId, Amount = 1500, Type = TransactionType.Income, Date = new DateTime(2024, 8, 15) }
        }.AsQueryable().BuildMockDbSet();

        _mockContext.Setup(x => x.Transactions).Returns(transactions.Object);

        var query = new GetMonthlySummaryQuery(year, month, userId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal(1000m, result.TotalIncome); // Only August 2025 income
        Assert.Equal(500m, result.TotalExpense); // Only August 2025 expense
        Assert.Equal(500m, result.Balance); // 1000 - 500
    }
}