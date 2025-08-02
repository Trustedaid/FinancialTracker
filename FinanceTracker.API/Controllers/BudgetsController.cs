using FinanceTracker.Application.Features.Budgets.Commands;
using FinanceTracker.Application.Features.Budgets.DTOs;
using FinanceTracker.Application.Features.Budgets.Queries;
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
        try
        {
            var userId = GetCurrentUserId();
            var query = new GetBudgetsQuery(filter, userId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Bir hata oluştu. Lütfen tekrar deneyiniz." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var query = new GetBudgetByIdQuery(id, userId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Bir hata oluştu. Lütfen tekrar deneyiniz." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetDto createBudgetDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var command = new CreateBudgetCommand(createBudgetDto, userId);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetBudget), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Bir hata oluştu. Lütfen tekrar deneyiniz." });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(int id, [FromBody] UpdateBudgetDto updateBudgetDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var command = new UpdateBudgetCommand(id, updateBudgetDto, userId);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Bir hata oluştu. Lütfen tekrar deneyiniz." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBudget(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var command = new DeleteBudgetCommand(id, userId);
            await _mediator.Send(command);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Bir hata oluştu. Lütfen tekrar deneyiniz." });
        }
    }
}