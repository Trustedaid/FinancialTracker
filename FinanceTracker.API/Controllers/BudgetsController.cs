using FinanceTracker.Application.Features.Budgets.Commands;
using FinanceTracker.Application.Features.Budgets.DTOs;
using FinanceTracker.Application.Features.Budgets.Queries;
using FinanceTracker.Application.Features.Transactions.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BudgetsController(IMediator mediator)
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
    public async Task<ActionResult<List<BudgetDto>>> GetBudgets([FromQuery] BudgetFilterDto filter)
    {
        var userId = GetCurrentUserId();
        var query = new GetBudgetsQuery(filter, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(int id)
    {
        var userId = GetCurrentUserId();
        var query = new GetBudgetByIdQuery(id, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetDto createBudgetDto)
    {
        var userId = GetCurrentUserId();
        var command = new CreateBudgetCommand(createBudgetDto, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetBudget), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(int id, [FromBody] UpdateBudgetDto updateBudgetDto)
    {
        var userId = GetCurrentUserId();
        var command = new UpdateBudgetCommand(id, updateBudgetDto, userId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBudget(int id)
    {
        var userId = GetCurrentUserId();
        var command = new DeleteBudgetCommand(id, userId);
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("progress")]
    public async Task<ActionResult<List<BudgetProgressDto>>> GetBudgetProgress([FromQuery] int year, [FromQuery] int month)
    {
        var userId = GetCurrentUserId();
        var query = new GetBudgetProgressQuery(year, month, userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}