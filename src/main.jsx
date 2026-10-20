
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createLDReactProvider } from '@launchdarkly/react-sdk';
import App from './App.jsx';
import './index.css';

// -----------------------------------------------------------------------------
// LaunchDarkly SDK configuration
// Reviewer action: Create a local .env.local file and set
// VITE_LD_CLIENT_SIDE_ID to the client-side ID from your LaunchDarkly
// project and environment. See .env.example and README.md for setup instructions.
//
// Security: A client-side ID is intended for browser SDK configuration.
// Never use a server-side SDK key, access token, or private trigger URL here.
// -----------------------------------------------------------------------------
const clientSideId = import.meta.env.VITE_LD_CLIENT_SIDE_ID;

// Fail fast with an actionable message when the required configuration is absent.
// This prevents the demo from silently starting without LaunchDarkly configuration.
if (!clientSideId) {
  throw new Error(
    'Missing VITE_LD_CLIENT_SIDE_ID. Check your .env.local file.',
  );
}

// -----------------------------------------------------------------------------
// Initial LaunchDarkly context
// Reviewer action: Re-create the `new-player-experience` Boolean flag and its
// targeting rules in your own LaunchDarkly environment, as documented in README.md.
//
// This context represents the Internal QA demo persona. Its key must match the
// individual target configured in LaunchDarkly. The remaining attributes provide
// realistic context data for demonstrating targeting and context switching.
// -----------------------------------------------------------------------------
const initialContext = {
  kind: 'user',
  key: 'internal-qa-01',
  name: 'Internal QA',
  user_tier: 'Standard',
  geography: 'India',
  device_type: 'Desktop',
  beta_tester: true,
};

// -----------------------------------------------------------------------------
// Create the LaunchDarkly React provider
//
// `streaming: true` enables streaming updates so flag changes can be delivered
// to the running application without requiring a manual browser refresh.
// The provider makes LaunchDarkly flag evaluation available to the React tree.
// -----------------------------------------------------------------------------
const LDReactProvider = createLDReactProvider(
  clientSideId,
  initialContext,
  {
    ldOptions: {
      streaming: true,
    },
  },
);

// -----------------------------------------------------------------------------
// Mount the application
//
// StrictMode enables additional development checks provided by React.
// The LaunchDarkly provider wraps App so components can access flag evaluations
// and react to updates from the configured LaunchDarkly environment.
// -----------------------------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LDReactProvider>
      <App />
    </LDReactProvider>
  </StrictMode>,
);
