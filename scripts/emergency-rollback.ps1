
# LaunchDarkly Emergency Rollback
# Project: StreamWave
# Flag: new-player-experience
# Environment: Interview Demo
#
# Usage:
#   .\scripts\emergency-rollback.ps1
#
# Security:
#   The trigger URL is requested at runtime.
#   Never commit the trigger URL to GitHub.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StreamWave Emergency Rollback" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will turn OFF the new-player-experience flag."
Write-Host "The legacy player should become active for all users."
Write-Host ""

$triggerUrl = Read-Host "Paste your private LaunchDarkly trigger URL"

if ([string]::IsNullOrWhiteSpace($triggerUrl)) {
    Write-Error "No trigger URL provided. Rollback cancelled."
    exit 1
}

# Basic URL validation before sending the request.
$parsedUrl = $null
if (
    -not [Uri]::TryCreate(
        $triggerUrl,
        [UriKind]::Absolute,
        [ref]$parsedUrl
    ) -or
    $parsedUrl.Scheme -ne "https" -or
    $parsedUrl.Host -ne "app.launchdarkly.com" -or
    -not $parsedUrl.AbsolutePath.StartsWith("/webhook/triggers/")
) {
    Remove-Variable triggerUrl -ErrorAction SilentlyContinue
    Write-Error "The URL does not look like a valid LaunchDarkly trigger URL."
    exit 1
}

try {
    $confirmation = Read-Host "Type ROLLBACK to confirm"

    if ($confirmation -cne "ROLLBACK") {
        Write-Host "Rollback cancelled." -ForegroundColor Yellow
        exit 0
    }

    Write-Host ""
    Write-Host "Invoking LaunchDarkly trigger..." -ForegroundColor Yellow

    $response = Invoke-WebRequest `
        -Method POST `
        -Uri $triggerUrl `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "Trigger request completed." -ForegroundColor Green
    Write-Host "HTTP status: $([int]$response.StatusCode)"
    Write-Host ""
    Write-Host "Verify the following manually:" -ForegroundColor Cyan
    Write-Host "  1. LaunchDarkly flag is OFF."
    Write-Host "  2. StreamWave displays the legacy player."
    Write-Host "  3. The browser did not need a refresh."
}
catch {
    Write-Host ""
    Write-Error "Rollback request failed: $($_.Exception.Message)"
    exit 1
}
finally {
    Remove-Variable triggerUrl -ErrorAction SilentlyContinue
    Remove-Variable parsedUrl -ErrorAction SilentlyContinue
}
