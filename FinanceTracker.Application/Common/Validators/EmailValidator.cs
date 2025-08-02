using System.Text.RegularExpressions;

namespace FinanceTracker.Application.Common.Validators;

public static class EmailValidator
{
    // Standard email regex - ASCII characters only (proper email standard)
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        // Length validation
        if (email.Length > 255)
            return false;

        // Basic structure validation
        var atIndex = email.LastIndexOf('@');
        if (atIndex <= 0 || atIndex == email.Length - 1)
            return false;

        // Check for consecutive dots
        if (email.Contains(".."))
            return false;

        // Local part shouldn't start or end with dot
        var localPart = email.Substring(0, atIndex);
        if (localPart.StartsWith('.') || localPart.EndsWith('.'))
            return false;

        var domain = email.Substring(atIndex + 1);
        
        // Domain validation - must have at least one dot
        if (!domain.Contains('.'))
            return false;

        // Domain shouldn't start or end with dot or dash
        if (domain.StartsWith('.') || domain.EndsWith('.') || 
            domain.StartsWith('-') || domain.EndsWith('-'))
            return false;

        // Check for valid TLD (at least 2 characters)
        var lastDotIndex = domain.LastIndexOf('.');
        if (lastDotIndex == -1 || domain.Length - lastDotIndex - 1 < 2)
            return false;

        // Use regex for final validation
        return EmailRegex.IsMatch(email);
    }
}