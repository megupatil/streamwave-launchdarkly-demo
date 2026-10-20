
# -----------------------------------------------------------------------------
# LaunchDarkly Emergency Rollback
# Project: StreamWave
# Flag: new-player-experience
# Environment: Interview Demo
#
# Purpose:
# Invoke a preconfigured LaunchDarkly Generic trigger to turn OFF the feature
# flag, allowing the application to return to the legacy player experience.
#
# Usage:
#   .\scripts\emergency-rollback.ps1
#
# Reviewer setup:
# 1. Create a Generic trigger in the correct LaunchDarkly project/environment.
# 2. Configure the trigger action to turn OFF `new-player-experience`.
# 3. Verify the trigger configuration before running this script.
#
# Security:
# - The trigger URL is requested at runtime and is not hardcoded in this file.
# - Treat the trigger URL as a secret bearer URL; anyone possessing it may be
#   able to invoke its configured action.
# - Never commit the trigger URL to GitHub or expose it in screenshots or logs.
# - This script invokes the trigger; verify the resulting flag state separately.
# -----------------------------------------------------------------------------

# Stop execution when a PowerShell command encounters a terminating error.
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StreamWave Emergency Rollback" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will turn OFF the new-player-experience flag."
Write-Host "The legacy player should become active for all users."
Write-Host ""

# Request the private trigger URL only when the operator runs the script.
# Do not replace this prompt with a hardcoded URL.
$triggerUrl = Read-Host "Paste your private LaunchDarkly trigger URL"

# Refuse to continue when the operator has not supplied a URL.
if ([string]::IsNullOrWhiteSpace($triggerUrl)) {
    Write-Error "No trigger URL provided. Rollback cancelled."
    exit 1
}

# Validate the URL before sending any request.
# This checks the expected HTTPS scheme, host, and Generic trigger path.
# It is a basic safeguard, not a substitute for verifying the trigger in
# LaunchDarkly or protecting the URL as a secret.
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
    # Remove the supplied URL from the current PowerShell session before exit.
    Remove-Variable triggerUrl -ErrorAction SilentlyContinue
    Write-Error "The URL does not look like a valid LaunchDarkly trigger URL."
    exit 1
}

try {
    # Require an explicit confirmation to reduce accidental trigger execution.
    # The comparison is case-sensitive: the operator must type ROLLBACK exactly.
    $confirmation = Read-Host "Type ROLLBACK to confirm"

    if ($confirmation -cne "ROLLBACK") {
        Write-Host "Rollback cancelled." -ForegroundColor Yellow
        exit 0
    }

    Write-Host ""
    Write-Host "Invoking LaunchDarkly trigger..." -ForegroundColor Yellow

    # Send the POST request that invokes the configured Generic trigger.
    # The actual flag action is defined in LaunchDarkly, not in this script.
    $response = Invoke-WebRequest `
        -Method POST `
        -Uri $triggerUrl `
        -ErrorAction Stop

    # A successful HTTP response confirms that the request completed at the
    # HTTP level. It does not, by itself, prove the flag is OFF or that the UI
    # has updated. The operator must verify both manually.
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
    # Report the request failure and return a non-zero exit code so the
    # operator can identify that the rollback request did not complete.
    Write-Host ""
    Write-Error "Rollback request failed: $($_.Exception.Message)"
    exit 1
}
finally {
    # Remove sensitive URL data and temporary validation state from the session.
    # This reduces accidental reuse but cannot erase shell history, memory
    # snapshots, or copies the operator may have made elsewhere.
    Remove-Variable triggerUrl -ErrorAction SilentlyContinue
    Remove-Variable parsedUrl -ErrorAction SilentlyContinue
}
