using FinanceTracker.Application.Features.Transactions.Commands;
using FinanceTracker.Application.Features.Transactions.DTOs;
using FinanceTracker.Application.Features.Transactions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TransactionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("Geçersiz kullanıcı kimliği.");
        }
        return userId;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedTransactionsDto>> GetTransactions([FromQuery] TransactionFilterDto filter)
    {
        var userId = GetCurrentUserId();
        var query = new GetTransactionsQuery(filter, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetTransaction(int id)
    {
        var userId = GetCurrentUserId();
        var query = new GetTransactionByIdQuery(id, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction([FromBody] CreateTransactionDto createTransactionDto)
    {
        var userId = GetCurrentUserId();
        var command = new CreateTransactionCommand(createTransactionDto, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTransaction), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(int id, [FromBody] UpdateTransactionDto updateTransactionDto)
    {
        var userId = GetCurrentUserId();
        var command = new UpdateTransactionCommand(id, updateTransactionDto, userId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransaction(int id)
    {
        var userId = GetCurrentUserId();
        var command = new DeleteTransactionCommand(id, userId);
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("monthly-summary")]
    public async Task<ActionResult<MonthlySummaryDto>> GetMonthlySummary([FromQuery] int year, [FromQuery] int month)
    {
        var userId = GetCurrentUserId();
        var query = new GetMonthlySummaryQuery(year, month, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("monthly-trends")]
    public async Task<ActionResult<List<MonthlyTrendDto>>> GetMonthlyTrends([FromQuery] int monthsBack = 6)
    {
        var userId = GetCurrentUserId();
        var query = new GetMonthlyTrendsQuery(monthsBack, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("category-spending")]
    public async Task<ActionResult<List<CategorySpendingDto>>> GetCategorySpending([FromQuery] int year, [FromQuery] int month)
    {
        var userId = GetCurrentUserId();
        var query = new GetCategorySpendingQuery(year, month, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}