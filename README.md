# StreamWave — LaunchDarkly Feature Flag Demo

A React + Vite demonstration of progressive feature releases, user targeting, real-time flag updates, and emergency rollback using the LaunchDarkly React SDK.

> **Project status:** Interview/demo application. This repository demonstrates frontend feature management; it is not a production video-streaming service.

## Table of Contents

- [Overview](#overview)
- [Business Scenario](#business-scenario)
- [Capabilities](#capabilities)
- [Technology Stack](#technology-stack)
- [Architecture and Request Flow](#architecture-and-request-flow)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [LaunchDarkly Configuration](#launchdarkly-configuration)
- [Demo Personas](#demo-personas)
- [Demonstration Runbook](#demonstration-runbook)
- [Emergency Rollback](#emergency-rollback)
- [Validation and Quality Gates](#validation-and-quality-gates)
- [Troubleshooting](#troubleshooting)
- [Security and Repository Hygiene](#security-and-repository-hygiene)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)
- [Customer Demonstration Narrative](#customer-demonstration-narrative)

## Overview

StreamWave demonstrates how LaunchDarkly feature flags can help a team control exposure to a new application experience without rebuilding or redeploying the frontend.

The Boolean flag `new-player-experience` determines whether the demo shows the redesigned player or the legacy experience. The intended targeting model grants access to an internal QA context and Premium customers while keeping other contexts on the legacy experience by default.

### Goals

- Show how a feature can be released to selected contexts.
- Demonstrate individual and attribute-based targeting.
- Demonstrate streaming updates while the browser remains open.
- Show an operational rollback path using a LaunchDarkly Generic trigger.
- Make setup and evaluation reproducible for another reviewer.

### Scope

This is a frontend interview exercise. It does not implement video delivery, user authentication, billing, backend authorization, production monitoring, or a full incident-management system.

## Business Scenario

StreamWave wants to introduce a redesigned playback experience without exposing every customer to a potentially problematic release.

The team wants to:

1. Validate the new experience with an individually targeted internal QA context.
2. Expand access to Premium customers using a context attribute.
3. Keep contexts that do not match targeting on the legacy experience.
4. Disable the release quickly if a problem occurs, without redeploying the frontend.

## Capabilities

- Boolean flag integration using the LaunchDarkly React SDK.
- Individual targeting by context key.
- Rule-based targeting using a string context attribute.
- A default-off experience for contexts that do not match targeting.
- Demo personas for Internal QA, Premium Customer, and Standard Customer.
- Streaming updates so flag changes can be reflected without a manual refresh.
- A PowerShell helper for invoking a configured LaunchDarkly Generic trigger.
- Lint and production-build scripts for basic validation.
- Repeatable setup from a fresh Git clone or ZIP archive.

## Technology Stack

- **React** — component-based user interface.
- **Vite** — project scaffolding, local development server, and production build tooling.
- **JavaScript** — application logic.
- **`@launchdarkly/react-sdk`** — LaunchDarkly integration for React.
- **LaunchDarkly** — flag evaluation, targeting, and Generic trigger configuration.
- **PowerShell** — emergency rollback helper on Windows.
- **Git and GitHub** — source control and repository hosting.

## Architecture and Request Flow

1. `src/main.jsx` creates the React application and configures the LaunchDarkly provider.
2. The provider reads `VITE_LD_CLIENT_SIDE_ID` from the local Vite environment.
3. The app evaluates `new-player-experience` for the currently selected demo context.
4. LaunchDarkly evaluates the flag using the context key, attributes, targeting rules, and flag state.
5. The UI renders the new player when the flag evaluates to `true`; otherwise it renders the legacy experience.
6. Streaming lets the SDK receive flag changes while the app remains open.
7. `scripts/emergency-rollback.ps1` can invoke a preconfigured Generic trigger intended to turn the flag off.

**Configuration boundary:** The browser application must use the LaunchDarkly client-side ID for the intended environment. Do not use a server-side SDK key, access token, or private trigger URL in browser code.

## Prerequisites

Before you begin, have:

- Node.js and npm installed.
- Git installed if you will clone the repository.
- Access to a LaunchDarkly project and environment where you can configure flags and targeting.
- The client-side ID for that environment.
- Windows PowerShell if you plan to use the rollback helper.

Check the tools:

```powershell
node --version
npm.cmd --version
git --version
```

Commands use `npm.cmd` to avoid the PowerShell script execution-policy issue that can affect `npm.ps1`. If `npm` works normally in your shell, you may use it instead.

## Quick Start

Complete these steps in order. Run commands from the project root—the directory containing `package.json`.

### 1. Obtain the source

**Option A — Clone with Git (recommended)**

```powershell
git clone https://github.com/megupatil/streamwave-launchdarkly-demo.git
Set-Location streamwave-launchdarkly-demo
```

**Option B — Download a ZIP**

1. Open the [StreamWave GitHub repository](https://github.com/megupatil/streamwave-launchdarkly-demo).
2. Select **Code → Download ZIP**.
3. Extract the archive.
4. Open PowerShell in the extracted project folder.

### 2. Confirm the project root

```powershell
Get-ChildItem
```

You should see `package.json`, `package-lock.json`, `.env.example`, `src/`, and `scripts/`. If you do not see `package.json`, you are not in the project root. Change into the folder that contains it before running npm commands.

### 3. Install dependencies

```powershell
npm.cmd ci
```

`npm.cmd ci` installs the dependency versions recorded in `package-lock.json`. If the repository does not include a lockfile, use `npm.cmd install` instead.

### 4. Create the local environment file

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace the placeholder with the client-side ID from the LaunchDarkly project and environment you will use.

The expected variable name is:

```dotenv
VITE_LD_CLIENT_SIDE_ID=your-launchdarkly-client-side-id
```

**Reviewer configuration notes:**

- Replace the placeholder; do not leave it as-is.
- Use the client-side ID, not a server-side SDK key.
- Use the same LaunchDarkly environment for this ID and the flag configuration.
- Do not commit `.env.local`.
- Vite reads environment variables when the dev server starts. Restart the server after changing this file.

### 5. Configure LaunchDarkly

Before starting the demo, configure the Boolean flag and targeting rules in [LaunchDarkly Configuration](#launchdarkly-configuration).

### 6. Start the development server

```powershell
npm.cmd run dev
```

Open the URL printed by Vite, typically `http://localhost:5173/`. Keep the terminal running while you use the app.

### 7. Run the validation commands

In a second terminal, from the project root:

```powershell
npm.cmd run lint
npm.cmd run build
```

These commands check the source and produce production assets in `dist/`. They do not deploy the application.

## LaunchDarkly Configuration

### 1. Client-side environment variable

The app expects:

`VITE_LD_CLIENT_SIDE_ID`

Set this variable in `.env.local`, created from `.env.example`. The example file must contain a placeholder only.

A client-side ID is designed for browser SDK initialization. It is not a server-side SDK key. Never expose private server-side credentials or a trigger URL through frontend code.

### 2. Create the feature flag

Create or configure a **Boolean** flag in the same LaunchDarkly project and environment as the client-side ID.

| Setting | Required value |
|---|---|
| Flag name | New Player Experience |
| Flag key | `new-player-experience` |
| Flag type | Boolean |
| On variation | `true` |
| Off variation | `false` |
| Application fallback | `false` |

**Reviewer note:** The flag key must match exactly, including spelling and hyphens. The fallback is what the app uses if it cannot obtain an evaluated flag value; it does not replace correct SDK configuration.

### 3. Configure targeting

Configure the following evaluation behavior:

| Priority | Targeting mechanism | Condition | Serve |
|---|---|---|---|
| 1 | Individual target — Internal QA | Context key is `internal-qa-01` | `true` |
| 2 | Premium early-access rule | `user_tier` equals `Premium` | `true` |
| 3 | Default rule | All other contexts | `false` |

Use the exact key and attribute values. `user_tier` is a string attribute.

Expected behavior:

- `internal-qa-01` receives `true` through individual targeting, even though its tier is Standard.
- A context with `user_tier=Premium` receives `true` through the Premium rule.
- A Standard context that is not individually targeted receives `false`.
- Turning the flag off globally returns the off variation, overriding targeting.

## Demo Personas

Use the in-app persona selector to switch contexts.

| Persona | Context key | Attributes | Expected result when flag is on |
|---|---|---|---|
| Internal QA | `internal-qa-01` | `user_tier=Standard`, `beta_tester=true` | New player |
| Premium Customer | `premium-customer-01` | `user_tier=Premium`, `beta_tester=false` | New player |
| Standard Customer | `standard-customer-01` | `user_tier=Standard`, `beta_tester=false` | Legacy player |

The persona selector is a demonstration aid. It is not authentication or authorization. Internal QA receives access through individual targeting, not through `beta_tester`.

## Demonstration Runbook

### Scenario 1 — Internal QA validation

1. Confirm the flag is on in LaunchDarkly.
2. Select **Internal QA** in the app.
3. Confirm the new player appears.
4. Explain that individual targeting allows a specific context to validate a release before broader exposure.

### Scenario 2 — Premium early access

1. Keep the flag on.
2. Select **Premium Customer**.
3. Confirm the new player appears.
4. Explain the `user_tier=Premium` rule.
5. Select **Standard Customer** and confirm the legacy player remains.

### Scenario 3 — Streaming update

1. Keep the browser open.
2. Change the flag's on/off state in LaunchDarkly.
3. Observe the app update without a manual refresh.
4. If it does not update, check SDK initialization, network access, browser console errors, and the selected environment.

### Scenario 4 — Flag-off remediation

1. Turn the flag on and confirm the new player is visible for targeted personas.
2. Turn the flag off in LaunchDarkly.
3. Confirm the legacy player returns without a refresh.
4. Use the operational rollback helper only after its trigger is configured and you are ready to demonstrate it.

## Emergency Rollback

The repository includes:

`scripts/emergency-rollback.ps1`

The script is intended to invoke a LaunchDarkly Generic trigger configured to turn off `new-player-experience`. It prompts for the trigger URL at runtime and requires the exact confirmation `ROLLBACK` before sending the request.

### Configure the Generic trigger

In LaunchDarkly:

1. Create or select a Generic trigger in the correct project and environment.
2. Configure its action to turn off the intended feature flag.
3. Review the trigger action and environment before testing.
4. Keep the generated trigger URL private.

The script cannot ensure the trigger's configuration is correct. Verify the configuration in LaunchDarkly before use.

### Run the script

From the project root in PowerShell:

```powershell
.\scripts\emergency-rollback.ps1
```

Follow the prompts:

1. Enter the private trigger URL.
2. Type `ROLLBACK` to confirm.
3. Review the HTTP response.
4. Verify the flag is off in LaunchDarkly.
5. Confirm the legacy player appears in the open browser without refreshing.

A successful HTTP response alone is not sufficient proof of rollback. Confirm both the flag state and application behavior.

### Trigger security

Treat the trigger URL as a secret bearer URL. Anyone who obtains it may be able to invoke its configured action.

- Never commit the URL to Git.
- Do not include it in this README, screenshots, public logs, or frontend code.
- Store it in an approved private password manager or secret store.
- Rotate it if exposed.
- Restrict access to authorized operators.

## Validation and Quality Gates

Run these checks from the project root.

### Lint

```powershell
npm.cmd run lint
```

This runs the lint script defined in `package.json`. Resolve reported errors before submitting.

### Production build

```powershell
npm.cmd run build
```

Vite should generate production assets under `dist/`. This checks that the app can be built; it does not deploy it.

### Optional production preview

```powershell
npm.cmd run preview
```

Open the URL printed by Vite. This is a local preview of the generated build, not a hosted production deployment.

### Fresh-clone verification checklist

- [ ] Cloned the repository or extracted the ZIP.
- [ ] Entered the directory containing `package.json`.
- [ ] Installed dependencies successfully.
- [ ] Created `.env.local` from `.env.example`.
- [ ] Set the correct LaunchDarkly client-side ID.
- [ ] Confirmed the flag key and Boolean variations.
- [ ] Configured individual QA targeting and the Premium rule.
- [ ] Started the app and opened the Vite URL.
- [ ] Verified Internal QA receives the new player.
- [ ] Verified Premium Customer receives the new player.
- [ ] Verified Standard Customer receives the legacy player.
- [ ] Verified flag updates while the browser remains open.
- [ ] Verified turning the flag off returns the legacy player.
- [ ] Ran lint and production build.
- [ ] Checked that local secrets are not staged for Git.
- [ ] Tested the rollback helper only with the intended private trigger and verified the final flag state.

## Troubleshooting

### The app does not connect to LaunchDarkly

- Confirm `.env.local` exists in the project root.
- Confirm the variable is named `VITE_LD_CLIENT_SIDE_ID`.
- Confirm the ID belongs to the intended LaunchDarkly environment.
- Do not use a server-side SDK key.
- Restart Vite after changing environment variables.
- Inspect the browser console and network activity for SDK initialization errors.

### All personas show the legacy player

- Confirm the flag key is `new-player-experience`.
- Confirm the flag is on.
- Confirm the individual target uses the exact context key `internal-qa-01`.
- Confirm the Premium rule checks `user_tier` against `Premium`.
- Confirm the app is using the context and attributes expected for the selected persona.
- Confirm the flag is configured in the same environment as the client-side ID.

### The UI does not update when the flag changes

- Confirm streaming is enabled in the provider configuration.
- Check browser console and network errors.
- Confirm the dashboard and app use the same LaunchDarkly environment.
- Verify the flag change was saved successfully.

### `npm` does not run in PowerShell

Use `npm.cmd`, for example:

```powershell
npm.cmd ci
npm.cmd run dev
```

### `npm.cmd ci` reports that `package.json` cannot be found

You are probably not in the project root. Run `Get-ChildItem` and change directory to the folder containing `package.json`.

### The rollback script fails

- Confirm the trigger URL is correct, private, and active.
- Confirm it belongs to the correct project and environment.
- Type the required confirmation exactly.
- Review the response and trigger configuration.
- Verify the flag state in LaunchDarkly.
- Never paste the trigger URL into source control or public logs.

## Security and Repository Hygiene

Before publishing a change:

- Keep `.env.local` out of version control.
- Keep `.env.example` limited to placeholder values.
- Never commit server-side SDK keys, access tokens, or private trigger URLs.
- Keep `node_modules/` and `dist/` out of version control.
- Do not put real customer data into demo contexts.
- Review the staged diff before committing.

Useful Git review commands:

```powershell
git status --short
git diff --check
git diff --cached --check
git diff --cached
```

If a credential or trigger URL has been exposed, rotate it. Removing it from the latest version of a file does not invalidate an already exposed secret.

## Project Structure

The main repository files are expected to include:

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

The current repository is authoritative if its file structure changes.

## Known Limitations

- This is a frontend demonstration, not a complete streaming service.
- It does not implement video delivery, billing, authentication, or backend authorization.
- The persona selector is not an identity-verification mechanism.
- Client-side feature flags must not be used as the sole authorization control for sensitive backend operations.
- Rollback depends on a correctly configured LaunchDarkly Generic trigger and suitable access.
- Targeting and live updates depend on correct SDK and environment configuration.
- Feature flags do not replace testing, monitoring, or incident response.

## Customer Demonstration Narrative

**Scenario:** StreamWave wants to release a redesigned playback experience while controlling exposure and reducing release risk.

1. **Release safely:** Enable `new-player-experience` for the individually targeted Internal QA context.
2. **Expand selectively:** Demonstrate the Premium rule using `user_tier=Premium`.
3. **Preserve the existing experience:** Show that Standard Customer receives the legacy player by default.
4. **Remediate quickly:** Turn the flag off and show the legacy player returning without a browser refresh.
5. **Demonstrate operational response:** Invoke the rollback helper and verify the flag state and application behavior.

**Customer value:** The team can control feature exposure and respond to a problematic release without rebuilding or redeploying the frontend.

**Important distinction:** Feature flags control application behavior. They do not replace testing, monitoring, authorization, or a complete incident-response process.
