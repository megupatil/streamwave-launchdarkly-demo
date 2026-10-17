# StreamWave — LaunchDarkly Feature Flag Demo

A React application demonstrating targeted feature releases, real-time flag updates, and emergency rollback using the LaunchDarkly React SDK.

## Customer scenario

StreamWave wants to introduce a new playback experience without exposing every customer to a potentially problematic release.

This demo uses a LaunchDarkly Boolean flag to release the new experience to selected users, validate it, and disable it remotely if a problem occurs—without rebuilding or redeploying the application.

## Capabilities demonstrated

- Boolean feature flag integration
- Targeting by user attributes
- Different experiences for different user personas
- Real-time updates without a browser refresh
- Emergency rollback using a LaunchDarkly Generic trigger
- Production build using Vite

## Technology stack

- React
- Vite
- JavaScript
- `@launchdarkly/react-sdk`
- PowerShell for the emergency rollback utility

## Architecture

1. `src/main.jsx` initializes the LaunchDarkly React provider.
2. The provider connects to the configured LaunchDarkly environment.
3. `src/App.jsx` evaluates the `new-player-experience` Boolean flag.
4. The evaluated flag value determines which player experience is displayed.
5. Streaming allows flag changes to update the application without a page reload.
6. A LaunchDarkly Generic trigger can turn the flag off for emergency rollback.

StreamWave is a frontend demonstration. It does not implement a production video-streaming backend.

## Prerequisites

- Node.js and npm
- Git
- A LaunchDarkly account and an environment configured for this demo
- A LaunchDarkly client-side ID
- Windows PowerShell to run the supplied rollback script

## LaunchDarkly configuration

### Environment variable

The application reads this variable:

`VITE_LD_CLIENT_SIDE_ID`

Create your local environment file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and replace the placeholder:

```dotenv
VITE_LD_CLIENT_SIDE_ID=your-launchdarkly-client-side-id
```

Do not commit `.env.local`. It is excluded by `.gitignore`.

A client-side ID is used by the browser SDK; it is not a server-side SDK key. Never put server-side SDK credentials or private trigger URLs in browser code.

### Feature flag

Configure this Boolean flag in the LaunchDarkly environment:

| Setting | Value |
|---|---|
| Flag name | New Player Experience |
| Flag key | `new-player-experience` |
| Type | Boolean |
| Enabled variation | `true` |
| Disabled variation | `false` |

The application uses `false` as its fallback value.

### Targeting rules

Configure the following rules in this order:

| Rule | Attribute | Condition | Serve |
|---|---|---|---|
| Individual target: Internal QA | User key `internal-qa-01` | Exact user match | `true` |
| Premium early access | `user_tier` | is `Premium` | `true` |
| Default rule | — | all other contexts | `false` |

Use a string for `user_tier` and a Boolean for `beta_tester`.

When the flag is turned off, the flag's off variation overrides these targeting rules.

## Installation and local development

Clone or download the repository and open a terminal in the project directory.

Install dependencies:

```powershell
npm.cmd install
```

Create and configure `.env.local` using the instructions above.

Start the development server:

```powershell
npm.cmd run dev
```

Open the local URL printed by Vite, typically:

`http://localhost:5173/`

## Test personas

Use the internal demo persona selector in the application.

| Persona | Context key | Attributes | Expected experience when flag is on |
|---|---|---|---|
| Internal QA | `internal-qa-01` | `user_tier=Standard`, `beta_tester=true` | New player |
| Premium Customer | `premium-customer-01` | `user_tier=Premium`, `beta_tester=false` | New player |
| Standard Customer | `standard-customer-01` | `user_tier=Standard`, `beta_tester=false` | Legacy player |

The selector updates the LaunchDarkly user context so you can demonstrate targeting behavior.

## Demonstrate real-time updates

1. Start the application and leave it open in the browser.
2. Turn on `new-player-experience` in LaunchDarkly.
3. Select the Premium Customer or Internal QA persona.
4. Confirm that the new player experience appears.
5. Change the flag in LaunchDarkly while leaving the browser open.
6. Confirm the UI updates without refreshing the page.

Streaming is enabled in the LaunchDarkly provider configuration.

## Emergency rollback

The project includes:

`scripts/emergency-rollback.ps1`

The script invokes a LaunchDarkly Generic trigger configured to turn off the `new-player-experience` flag.

### Configure the trigger

In LaunchDarkly, configure a Generic trigger for the correct flag and environment. Its action must turn flag targeting off.

### Run the rollback script

From the project root in PowerShell:

```powershell
.\scripts\emergency-rollback.ps1
```

When prompted:

1. Enter the private trigger URL.
2. Type `ROLLBACK` to confirm.
3. Review the HTTP response.
4. Verify that the flag is off in LaunchDarkly.
5. Verify that the legacy player appears without refreshing the browser.

A successful HTTP response alone does not prove that rollback completed. Verify the flag state and application behavior.

### Trigger security

Treat the trigger URL as a secret bearer URL. Anyone possessing it may be able to invoke its action.

- Never commit the trigger URL to this repository.
- Do not put it in this README, screenshots, or browser-side code.
- Store it in a private password manager or approved secret store.
- Rotate the URL if it has been exposed.
- Restrict access to authorized operators.

The rollback script prompts for the URL at runtime and does not store it in the source file.

## Production build

Build the application:

```powershell
npm.cmd run build
```

Vite generates production files in `dist/`. This command builds the application; it does not deploy it.

To preview the production build locally:

```powershell
npm.cmd run preview
```

## Project structure

```text
launchdarkly/
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

## Repository hygiene

Before publishing:

- Verify `.env.local` is ignored by Git.
- Ensure the trigger URL is absent from all files being committed.
- Never commit server-side SDK credentials.
- Keep `node_modules/` and `dist/` out of version control.
- Commit `.env.example` with a placeholder, not a real environment-specific value.

## Limitations

- StreamWave is a frontend demo, not a complete streaming service.
- Emergency rollback requires a correctly configured LaunchDarkly trigger and suitable permissions.
- Targeting and live updates require a correctly configured LaunchDarkly environment.
- The internal persona selector is for demonstration, not authentication or authorization.

## Learning outcomes

This project demonstrates how feature management can support safer releases, targeted exposure, rapid rollback, and validation of a new user experience without a new application deployment.
