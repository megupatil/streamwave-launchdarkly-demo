# StreamWave — LaunchDarkly Feature Flag Demo

A React application demonstrating targeted feature releases, real-time flag updates, and emergency rollback using the LaunchDarkly React SDK.

## Customer Scenario

StreamWave wants to introduce a redesigned playback experience without exposing every customer to a potentially problematic release.

This demo uses a LaunchDarkly Boolean feature flag to release the new experience selectively, validate it with specific users, and disable it remotely if a problem occurs—all without rebuilding or redeploying the frontend application.

## Capabilities Demonstrated

- Boolean feature flag integration using the LaunchDarkly React SDK
- Individual targeting by user key
- Rule-based targeting using context attributes
- Default behavior for users who do not match targeting rules
- Different experiences for different user personas
- Real-time flag updates without a browser refresh
- Emergency rollback using a LaunchDarkly Generic trigger
- Production build and lint validation

## Technology Stack

- React
- Vite
- JavaScript
- `@launchdarkly/react-sdk`
- LaunchDarkly feature flags and targeting
- PowerShell for the emergency rollback utility

## Architecture

1. `src/main.jsx` initializes the LaunchDarkly React provider.
2. The provider connects to the configured LaunchDarkly environment using the client-side ID.
3. `src/App.jsx` evaluates the `new-player-experience` Boolean flag.
4. The evaluated flag value determines which player experience is displayed.
5. Streaming allows flag changes to update the application without a page reload.
6. A LaunchDarkly Generic trigger can turn the flag off for emergency rollback.

StreamWave is a frontend demonstration. It does not implement a production video-streaming backend.

## Prerequisites

- Node.js and npm
- Git
- A LaunchDarkly account with access to a configured project and environment
- A LaunchDarkly client-side ID for the selected environment
- Windows PowerShell to run the supplied rollback script

## LaunchDarkly Configuration

### 1. Environment Variable

The application reads the following environment variable:

`VITE_LD_CLIENT_SIDE_ID`

Create your local environment file from the example:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and replace the placeholder with your LaunchDarkly client-side ID:

```dotenv
VITE_LD_CLIENT_SIDE_ID=your-launchdarkly-client-side-id
```

Do not commit `.env.local`. It is excluded by `.gitignore`.

**Security note:** A client-side ID is intended for browser SDK configuration. It is not a server-side SDK key. Never put private server-side SDK credentials or private trigger URLs in browser code.

### 2. Feature Flag

Create or configure the following Boolean flag in the LaunchDarkly environment used by the demo.

| Setting | Value |
|---|---|
| Flag name | New Player Experience |
| Flag key | `new-player-experience` |
| Type | Boolean |
| On variation | `true` |
| Off variation | `false` |

The application uses `false` as its fallback value.

### 3. Targeting Rules

Configure the following targeting behavior:

| Targeting mechanism | Condition | Serve |
|---|---|---|
| Individual targeting: Internal QA | User key `internal-qa-01` | `true` |
| Premium early access | `user_tier` is `Premium` | `true` |
| Default rule | All other users | `false` |

Individual targeting enables the Internal QA user (`internal-qa-01`). The Premium rule serves users whose `user_tier` attribute is `Premium`. All other users receive the default `false` variation.

Use the exact user key and attribute values shown above. `user_tier` is a string attribute.

When the flag is turned off globally, the flag's off variation takes precedence over these targeting rules.

## Installation and Local Development

### 1. Clone the Repository

```powershell
git clone https://github.com/megupatil/streamwave-launchdarkly-demo.git
cd streamwave-launchdarkly-demo
```

Alternatively, download the repository ZIP and open the extracted project directory.

### 2. Install Dependencies

```powershell
npm.cmd install
```

On Windows PowerShell, `npm.cmd` can be used if the `npm.ps1` script is blocked by the execution policy.

### 3. Configure LaunchDarkly

Create `.env.local` using the instructions in the Environment Variable section. Replace the example value with the client-side ID for your LaunchDarkly environment.

### 4. Start the Application

```powershell
npm.cmd run dev
```

Open the local URL printed by Vite, typically:

`http://localhost:5173/`

Keep the browser open while testing live flag changes.

## Test Personas

Use the internal persona selector in the application to switch between the following demonstration contexts.

| Persona | Context key | Attributes | Expected experience when flag is on |
|---|---|---|---|
| Internal QA | `internal-qa-01` | `user_tier=Standard`, `beta_tester=true` | New player |
| Premium Customer | `premium-customer-01` | `user_tier=Premium`, `beta_tester=false` | New player |
| Standard Customer | `standard-customer-01` | `user_tier=Standard`, `beta_tester=false` | Legacy player |

The selector updates the LaunchDarkly user context so that targeting behavior can be demonstrated interactively.

The Internal QA persona receives the new experience through individual targeting, not through the `beta_tester` attribute.

## Demonstrate Release and Remediation

### Scenario 1: Release to Internal QA

1. Start the application.
2. In LaunchDarkly, turn on `new-player-experience`.
3. Select the Internal QA persona.
4. Confirm that the new player experience appears.
5. Explain how individual targeting allows a specific user to receive the feature before a wider release.

### Scenario 2: Target Premium Customers

1. Keep the feature flag on.
2. Select the Premium Customer persona.
3. Confirm that the new player experience appears.
4. Explain how the `user_tier = Premium` rule selectively enables the experience.
5. Select Standard Customer and confirm that the legacy player remains active under the default rule.

### Scenario 3: Change the Flag Without Refreshing

1. Leave the application open in the browser.
2. Change the flag's on/off state in LaunchDarkly.
3. Observe the player experience update.
4. Confirm that the browser does not need to be refreshed.

Streaming is enabled in the LaunchDarkly provider configuration.

### Scenario 4: Roll Back a Problematic Release

1. Turn the flag on and confirm that the new experience appears.
2. Turn the flag off in LaunchDarkly.
3. Confirm that the legacy experience returns without refreshing the browser.
4. For the operational rollback demonstration, use the supplied PowerShell script as described below.

This demonstrates that the feature can be disabled remotely without changing application code or redeploying the frontend.

## Emergency Rollback

The project includes:

`scripts/emergency-rollback.ps1`

The script invokes a LaunchDarkly Generic trigger configured to turn off the `new-player-experience` flag in the intended environment.

### Configure the Trigger

In LaunchDarkly:

1. Create or use a Generic trigger for the correct project and environment.
2. Configure its action to turn off the intended feature flag.
3. Keep the trigger URL private.
4. Verify the trigger configuration before using it in a demonstration.

The trigger must be configured correctly for the script to perform the expected rollback.

### Run the Rollback Script

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

Treat the trigger URL as a secret bearer URL. Anyone possessing it may be able to invoke its configured action.

- Never commit the trigger URL to this repository.
- Do not include it in this README, screenshots, or browser-side code.
- Store it in a private password manager or approved secret store.
- Rotate the URL if it has been exposed.
- Restrict access to authorized operators.

The rollback script prompts for the URL at runtime and does not store the URL in the source file.

## Quality Checks

Run the following commands from the project root.

### Lint

```powershell
npm.cmd run lint
```

This checks the JavaScript source for code-quality issues.

### Production Build

```powershell
npm.cmd run build
```

Vite generates production assets in `dist/`. This command verifies that the application can be built; it does not deploy the application.

### Preview the Production Build

```powershell
npm.cmd run preview
```

Open the local URL printed by Vite to inspect the production build.

## Fresh-Clone Verification

Before submitting the repository, verify the documented setup from a fresh clone:

1. Clone the public GitHub repository into a separate directory.
2. Install dependencies.
3. Create `.env.local` and configure the LaunchDarkly client-side ID.
4. Start the application.
5. Test Internal QA, Premium Customer, and Standard Customer.
6. Toggle the flag in LaunchDarkly and confirm that the browser updates without refreshing.
7. Run lint and build checks.

The project should be reproducible using the documented steps and a correctly configured LaunchDarkly environment.

## Project Structure

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

## Repository Hygiene

Before publishing changes:

- Verify that `.env.local` is ignored by Git.
- Ensure that no complete private trigger URL is included in the changes being committed.
- Never commit server-side SDK credentials.
- Keep `node_modules/` and `dist/` out of version control.
- Commit `.env.example` with a placeholder rather than a real environment-specific value.
- Review the staged changes before committing.

## Limitations

- StreamWave is a frontend demo, not a complete streaming service.
- Emergency rollback requires a correctly configured LaunchDarkly trigger and suitable permissions.
- Targeting and live updates require a correctly configured LaunchDarkly environment.
- The internal persona selector is for demonstration, not authentication or authorization.
- Feature flags help control releases but do not replace automated testing, monitoring, or a complete incident-response process.

## Customer Demonstration Narrative

**Scenario:** StreamWave wants to release a redesigned playback experience while controlling exposure and limiting release risk.

1. **Release safely:** Enable `new-player-experience` for the individually targeted Internal QA user.
2. **Expand selectively:** Demonstrate the Premium targeting rule using `user_tier = Premium`.
3. **Preserve the existing experience:** Show that Standard customers receive the legacy player under the default rule.
4. **Remediate quickly:** Turn the flag off in LaunchDarkly and show the legacy experience returning without a browser refresh.
5. **Demonstrate operational response:** Invoke the emergency rollback script and verify the flag state and application behavior.

**Customer value:** The team can control feature exposure and respond to a problematic release without rebuilding or redeploying the frontend application.

**Important distinction:** Feature flags control application behavior; they do not replace monitoring, testing, authorization, or a complete incident-response process.

## Learning Outcomes

This project demonstrates how feature management can support safer releases, targeted exposure, rapid rollback, and validation of a new user experience without a new application deployment.
