# StreamWave — LaunchDarkly Feature Flag Demo

A React application demonstrating progressive feature releases, user targeting, real-time flag updates, and emergency rollback with the LaunchDarkly React SDK.

## Table of Contents

- [Overview](#overview)
- [Business Scenario](#business-scenario)
- [Capabilities](#capabilities)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [LaunchDarkly Configuration](#launchdarkly-configuration)
- [Demo Personas](#demo-personas)
- [Demonstration Scenarios](#demonstration-scenarios)
- [Emergency Rollback](#emergency-rollback)
- [Validation and Quality Checks](#validation-and-quality-checks)
- [Troubleshooting](#troubleshooting)
- [Security and Repository Hygiene](#security-and-repository-hygiene)
- [Project Structure](#project-structure)
- [Limitations](#limitations)
- [Customer Demonstration Narrative](#customer-demonstration-narrative)

## Overview

StreamWave is a frontend demonstration of how LaunchDarkly feature flags can help a team release a new experience gradually, target selected users, and disable a release without rebuilding or redeploying the frontend.

The demo uses a Boolean feature flag named `new-player-experience`. Internal QA and Premium customers can receive the new player experience, while Standard customers receive the legacy experience by default.

> **Scope:** This repository is an interview/demo application. It is not a production video-streaming service and does not implement video delivery, customer authentication, billing, or backend authorization.

## Business Scenario

StreamWave wants to introduce a redesigned playback experience without exposing every customer to a potentially problematic release.

The team wants to:

1. Validate the experience with an individually targeted internal QA user.
2. Expand access to Premium customers using a context attribute.
3. Keep users who do not match targeting on the legacy experience.
4. Respond to a release issue by turning the flag off without deploying new frontend code.

This project demonstrates that workflow using LaunchDarkly.

## Capabilities

- Boolean feature flag integration using the LaunchDarkly React SDK.
- Individual targeting by context key.
- Rule-based targeting using context attributes.
- Default behavior for contexts that do not match targeting rules.
- Interactive demo personas for QA, Premium, and Standard users.
- Streaming updates so flag changes can appear without a browser refresh.
- Emergency rollback using a LaunchDarkly Generic trigger.
- Local lint and production-build checks.
- Repeatable setup from a fresh Git clone or ZIP download.

## Technology Stack

- **React** — builds the user interface.
- **Vite** — scaffolds the initial project and provides the development server and production build tooling.
- **JavaScript** — application implementation.
- **`@launchdarkly/react-sdk`** — connects the React application to LaunchDarkly.
- **LaunchDarkly** — flag evaluation, targeting, and trigger configuration.
- **PowerShell** — runs the emergency rollback helper on Windows.
- **Git and GitHub** — source control and repository hosting.

## Architecture

1. `src/main.jsx` initializes the React application and LaunchDarkly provider.
2. The provider connects to the selected LaunchDarkly environment using the client-side ID configured in `.env.local`.
3. `src/App.jsx` evaluates the `new-player-experience` Boolean flag for the selected demo context.
4. LaunchDarkly targeting determines whether the new or legacy player experience is shown.
5. Streaming allows flag updates to reach the open application without a page reload.
6. The PowerShell rollback helper can invoke a configured LaunchDarkly Generic trigger to turn off the intended flag.

The browser application uses a **client-side ID**, not a server-side SDK key. The local environment file is intentionally not committed.

## Prerequisites

Before starting, ensure you have:

- Node.js and npm installed.
- Git installed if you plan to clone the repository.
- Access to a LaunchDarkly project and environment where you can configure the flag and targeting rules.
- The client-side ID for that LaunchDarkly environment.
- Windows PowerShell if you intend to run `scripts/emergency-rollback.ps1`.

Check your Node.js and npm installations:

```powershell
node --version
npm.cmd --version
git --version
```

The commands in this guide use `npm.cmd` for Windows PowerShell compatibility. If your environment runs `npm` normally, you can use `npm` instead.

## Quick Start

Follow these steps in order to run the application from a fresh clone or ZIP download.

### 1. Get the source code

**Option A — Clone the repository (recommended)**

```powershell
git clone https://github.com/megupatil/streamwave-launchdarkly-demo.git
Set-Location streamwave-launchdarkly-demo
```

**Option B — Download a ZIP**

1. Open the [StreamWave GitHub repository](https://github.com/megupatil/streamwave-launchdarkly-demo).
2. Select **Code → Download ZIP**.
3. Extract the ZIP.
4. Open PowerShell in the extracted project directory.

### 2. Confirm the project root

Run:

```powershell
Get-ChildItem
```

You should see `package.json`, `.env.example`, `src/`, and `scripts/`. If these files are not present, you may be in the parent directory rather than the project root. Change to the directory that contains `package.json` before continuing.

### 3. Install dependencies

From the project root, run:

```powershell
npm.cmd ci
```

`npm.cmd ci` installs the dependency versions recorded in `package-lock.json`. If the repository does not include a lockfile, use `npm.cmd install` instead.

### 4. Configure the LaunchDarkly client-side ID

Create your local environment file from the checked-in example:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace the placeholder with the client-side ID for the LaunchDarkly project and environment you will use.

The expected variable name in this project is:

```dotenv
VITE_LD_CLIENT_SIDE_ID=your-launchdarkly-client-side-id
```

Do not leave the placeholder value in place. Do not substitute a server-side SDK key or access token.

**Important:** Vite loads environment variables when the development server starts. If you change `.env.local` while the server is running, stop and restart the server.

### 5. Start the application

```powershell
npm.cmd run dev
```

Open the local URL printed by Vite, typically:

`http://localhost:5173/`

Keep the terminal running while you use the application.

### 6. Configure LaunchDarkly

Before testing targeting, configure the flag as described in [LaunchDarkly Configuration](#launchdarkly-configuration) below. Ensure that the app's client-side ID and the flag configuration refer to the same LaunchDarkly project and environment.

### 7. Verify the application

Use the persona selector to test Internal QA, Premium Customer, and Standard Customer. Then change the flag state in LaunchDarkly while leaving the browser open and confirm the interface responds without a refresh.

### 8. Run the quality checks

```powershell
npm.cmd run lint
npm.cmd run build
```

These checks validate the source and generate production assets in `dist/`. They do not deploy the application.

## LaunchDarkly Configuration

### 1. Environment Variable

The application reads:

`VITE_LD_CLIENT_SIDE_ID`

The local value belongs in `.env.local`, which should be excluded from Git. The repository's `.env.example` should contain only a placeholder, never a real environment-specific credential.

A client-side ID is intended for browser SDK configuration. It is different from a server-side SDK key. Never expose server-side credentials or private trigger URLs in frontend code or public documentation.

### 2. Feature Flag

Create or configure the following Boolean flag in the LaunchDarkly environment used by the application.

| Setting | Value |
|---|---|
| Flag name | New Player Experience |
| Flag key | `new-player-experience` |
| Type | Boolean |
| On variation | `true` |
| Off variation | `false` |
| Application fallback | `false` |

Confirm that the flag key matches the key used by the application exactly.

### 3. Targeting Rules

Configure the following behavior:

| Order | Targeting mechanism | Condition | Serve |
|---|---|---|---|
| 1 | Individual targeting — Internal QA | Context key is `internal-qa-01` | `true` |
| 2 | Premium early access | `user_tier` equals `Premium` | `true` |
| 3 | Default rule | All other contexts | `false` |

Use the exact context key and attribute values. `user_tier` is a string attribute.

The individual QA target should enable the flag for `internal-qa-01`, even though that persona has `user_tier=Standard`. The Premium rule enables the flag for contexts whose `user_tier` is `Premium`. Other Standard contexts should receive `false` by default.

When the flag is turned off globally, its off variation should be returned regardless of the individual target and targeting rules.

## Demo Personas

Use the persona selector in the application to switch between these demonstration contexts.

| Persona | Context key | Attributes | Expected experience while flag is on |
|---|---|---|---|
| Internal QA | `internal-qa-01` | `user_tier=Standard`, `beta_tester=true` | New player |
| Premium Customer | `premium-customer-01` | `user_tier=Premium`, `beta_tester=false` | New player |
| Standard Customer | `standard-customer-01` | `user_tier=Standard`, `beta_tester=false` | Legacy player |

The selector updates the LaunchDarkly context so that targeting behavior can be demonstrated interactively.

The Internal QA persona receives the new experience through individual targeting, not through the `beta_tester` attribute. The Premium Customer receives it through the `user_tier=Premium` rule.

## Demonstration Scenarios

### Scenario 1 — Release to Internal QA

1. Start the application and confirm that the flag is on in LaunchDarkly.
2. Select **Internal QA**.
3. Confirm that the new player experience appears.
4. Explain how individual targeting allows a specific user to receive a feature before a wider release.

### Scenario 2 — Target Premium Customers

1. Keep the flag on.
2. Select **Premium Customer**.
3. Confirm that the new player experience appears.
4. Explain how the `user_tier=Premium` rule selectively enables the experience.
5. Select **Standard Customer** and confirm that the legacy player remains active under the default rule.

### Scenario 3 — Update Without Refreshing

1. Leave the application open in the browser.
2. Change the flag's on/off state in LaunchDarkly.
3. Observe the player experience update.
4. Confirm that the browser does not need to be refreshed.

Streaming is enabled in the provider configuration.

### Scenario 4 — Roll Back a Problematic Release

1. Turn the flag on and confirm that the new experience appears for the targeted personas.
2. Turn the flag off in LaunchDarkly.
3. Confirm that the legacy experience returns without refreshing the browser.
4. For the operational rollback demonstration, use the PowerShell helper described below.

This demonstrates that the feature can be disabled remotely without changing application code or redeploying the frontend.

## Emergency Rollback

The project includes:

`scripts/emergency-rollback.ps1`

The script invokes a LaunchDarkly Generic trigger intended to turn off `new-player-experience` in the configured environment. It prompts for the trigger URL at runtime and requires the confirmation text `ROLLBACK` before sending the request.

### Configure the Generic Trigger

In LaunchDarkly:

1. Create or use a Generic trigger for the correct project and environment.
2. Configure its action to turn off the intended feature flag.
3. Verify the trigger configuration before the demonstration.
4. Keep the trigger URL private.

The script can only perform the intended rollback if the trigger is correctly configured.

### Run the Script

From the project root in PowerShell:

```powershell
.\scripts\emergency-rollback.ps1
```

When prompted:

1. Enter the private LaunchDarkly trigger URL.
2. Type `ROLLBACK` to confirm.
3. Review the HTTP response.
4. Verify that the flag is off in LaunchDarkly.
5. Confirm that the legacy player appears without refreshing the browser.

A successful HTTP response alone does not prove that rollback completed. Verify both the flag state and the application behavior.

### Trigger Security

Treat the trigger URL as a secret bearer URL. Anyone who obtains it may be able to invoke its configured action.

- Never commit the trigger URL to this repository.
- Do not include it in this README, screenshots, public logs, or browser-side code.
- Store it in an approved private password manager or secret store.
- Rotate the URL if it has been exposed.
- Restrict access to authorized operators.

The rollback script prompts for the URL at runtime and should not store the URL in the source file.

## Validation and Quality Checks

Run these commands from the project root.

### Lint

```powershell
npm.cmd run lint
```

This checks the JavaScript source for code-quality issues.

### Production Build

```powershell
npm.cmd run build
```

Vite generates production assets in `dist/`. This verifies that the app can be built; it does not deploy the application.

### Preview the Production Build

```powershell
npm.cmd run preview
```

Open the local URL printed by Vite to inspect the production build. The preview server is for local verification and is not a production hosting service.

### Fresh-Clone Verification Checklist

Use this checklist before submitting or demonstrating the repository:

- [ ] Cloned the repository or extracted the ZIP.
- [ ] Opened the folder containing `package.json`.
- [ ] Installed dependencies successfully.
- [ ] Created `.env.local` from `.env.example`.
- [ ] Set the correct LaunchDarkly client-side ID.
- [ ] Confirmed the flag key is `new-player-experience`.
- [ ] Confirmed the individual QA target and Premium rule.
- [ ] Started the application and opened the Vite URL.
- [ ] Verified the Internal QA persona.
- [ ] Verified the Premium Customer persona.
- [ ] Verified the Standard Customer persona.
- [ ] Verified that flag changes update the UI without refreshing.
- [ ] Ran lint and the production build.
- [ ] Confirmed that local secrets are not staged for Git.
- [ ] Tested the rollback helper only with the intended private trigger URL and verified the final flag state.

## Troubleshooting

### The application does not connect to LaunchDarkly

- Confirm that `.env.local` exists in the project root.
- Confirm that the variable name is `VITE_LD_CLIENT_SIDE_ID`.
- Check that the client-side ID is correct and belongs to the intended environment.
- Do not use a server-side SDK key.
- Restart the Vite development server after changing environment variables.
- Check the browser console for SDK initialization or network errors.

### The flag is disabled for every persona

- Confirm the flag key is exactly `new-player-experience`.
- Confirm the flag is on in the LaunchDarkly environment.
- Confirm that the individual target uses the exact context key `internal-qa-01`.
- Confirm that the Premium rule checks `user_tier` against the exact value `Premium`.
- Confirm that the application's current context key and attributes match the persona.
- Confirm that the default rule serves `false`.

### Changes do not appear without a refresh

- Confirm that streaming is enabled in the SDK provider configuration.
- Check the browser console for SDK or network errors.
- Verify that you changed the flag in the same LaunchDarkly environment used by the application.

### PowerShell cannot run `npm`

Use `npm.cmd`, for example:

```powershell
npm.cmd ci
npm.cmd run dev
```

### `npm.cmd ci` fails

- Confirm that you are in the project root.
- Confirm that `package.json` and `package-lock.json` are present.
- If there is no lockfile, use `npm.cmd install`.
- Review the terminal output for the specific dependency or network error.

### The rollback script fails

- Confirm that the trigger URL is correct, private, and still active.
- Confirm that the trigger belongs to the correct project and environment.
- Type the required confirmation exactly as prompted.
- Review the HTTP response and trigger configuration.
- Verify the final flag state in LaunchDarkly.
- Never put the trigger URL in source control or public logs.

## Security and Repository Hygiene

Before publishing changes:

- Keep `.env.local` out of version control.
- Keep `.env.example` limited to placeholder values.
- Never commit server-side SDK keys, access tokens, or private rollback trigger URLs.
- Keep `node_modules/` and `dist/` out of version control.
- Do not put real customer data into demo contexts.
- Review staged changes before committing.

Check the working tree:

```powershell
git status --short
```

Review the exact changes staged for commit:

```powershell
git diff --cached --check
git diff --cached
```

If a private trigger URL or credential has been exposed, rotate it rather than relying only on deleting it from the latest version of the file.

## Project Structure

The repository's key files include:

```text
streamwave-launchdarkly-demo/
├── public/
├── scripts/
│   └── emergency-rollback.ps1
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

The exact repository contents are authoritative if files change over time.

## Limitations

- StreamWave is a frontend demo, not a complete video-streaming service.
- It does not implement video delivery, billing, customer authentication, or backend authorization.
- The internal persona selector is for demonstration and is not an authentication mechanism.
- Client-side feature flags must not be used as the sole authorization mechanism for sensitive backend operations.
- Emergency rollback requires a correctly configured LaunchDarkly trigger and suitable permissions.
- Targeting and live updates require a correctly configured LaunchDarkly environment.
- Feature flags do not replace automated testing, monitoring, or a complete incident-response process.

## Customer Demonstration Narrative

**Scenario:** StreamWave wants to release a redesigned playback experience while controlling exposure and limiting release risk.

1. **Release safely:** Enable `new-player-experience` for the individually targeted Internal QA user.
2. **Expand selectively:** Demonstrate the Premium targeting rule using `user_tier=Premium`.
3. **Preserve the existing experience:** Show that Standard customers receive the legacy player under the default rule.
4. **Remediate quickly:** Turn the flag off in LaunchDarkly and show the legacy experience returning without a browser refresh.
5. **Demonstrate operational response:** Invoke the emergency rollback helper and verify the flag state and application behavior.

**Customer value:** The team can control feature exposure and respond to a problematic release without rebuilding or redeploying the frontend application.

**Important distinction:** Feature flags control application behavior. They do not replace monitoring, testing, authorization, or a complete incident-response process.

## Learning Outcomes

This project demonstrates how feature management can support safer releases, targeted exposure, rapid rollback, and validation of a new user experience without a new application deployment.
