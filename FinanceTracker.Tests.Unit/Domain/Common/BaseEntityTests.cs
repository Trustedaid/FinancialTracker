using FinanceTracker.Domain.Common;
using FluentAssertions;
using Xunit;

namespace FinanceTracker.Tests.Unit.Domain.Common;

// Create a concrete implementation for testing
public class TestEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}

public class BaseEntityTests
{
    [Fact]
    public void BaseEntity_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        entity.Id.Should().Be(0);
        entity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void BaseEntity_Should_Set_Id_Correctly()
    {
        // Arrange
        var entity = new TestEntity();
        var testId = 123;

        // Act
        entity.Id = testId;

        // Assert
        entity.Id.Should().Be(testId);
    }

    [Fact]
    public void BaseEntity_Should_Set_CreatedAt_Correctly()
    {
        // Arrange
        var entity = new TestEntity();
        var testDate = new DateTime(2024, 1, 15, 10, 30, 0);

        // Act
        entity.CreatedAt = testDate;

        // Assert
        entity.CreatedAt.Should().Be(testDate);
    }

    [Fact]
    public void BaseEntity_Should_Set_UpdatedAt_Correctly()
    {
        // Arrange
        var entity = new TestEntity();
        var testDate = new DateTime(2024, 1, 16, 11, 45, 0);

        // Act
        entity.UpdatedAt = testDate;

        // Assert
        entity.UpdatedAt.Should().Be(testDate);
    }

    [Fact]
    public void BaseEntity_Should_Allow_UpdatedAt_To_Be_Null()
    {
        // Arrange
        var entity = new TestEntity
        {
            UpdatedAt = new DateTime(2024, 1, 15)
        };

        // Act
        entity.UpdatedAt = null;

        // Assert
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void BaseEntity_Should_Handle_DateTime_Min_And_Max_Values()
    {
        // Arrange
        var entity = new TestEntity();

        // Act
        entity.CreatedAt = DateTime.MinValue;
        entity.UpdatedAt = DateTime.MaxValue;

        // Assert
        entity.CreatedAt.Should().Be(DateTime.MinValue);
        entity.UpdatedAt.Should().Be(DateTime.MaxValue);
    }

    [Fact]
    public void BaseEntity_Should_Support_Inheritance()
    {
        // Arrange & Act
        var entity = new TestEntity
        {
            Id = 1,
            Name = "Test Entity",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow.AddHours(1)
        };

        // Assert
        entity.Should().BeAssignableTo<BaseEntity>();
        entity.Id.Should().Be(1);
        entity.Name.Should().Be("Test Entity");
        entity.CreatedAt.Should().NotBe(default(DateTime));
        entity.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void BaseEntity_CreatedAt_Should_Default_To_UtcNow_When_Initialized()
    {
        // Arrange
        var beforeCreation = DateTime.UtcNow.AddSeconds(-1);
        
        // Act
        var entity = new TestEntity();
        var afterCreation = DateTime.UtcNow.AddSeconds(1);

        // Assert
        // Note: Default value is set to DateTime.UtcNow in the property initializer
        // This test verifies that it has a reasonable default behavior
        entity.CreatedAt.Should().BeBefore(afterCreation);
        entity.CreatedAt.Should().BeAfter(beforeCreation);
        entity.CreatedAt.Should().NotBe(default(DateTime));
    }
}