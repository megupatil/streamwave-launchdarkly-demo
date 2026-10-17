import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createLDReactProvider } from '@launchdarkly/react-sdk';
import App from './App.jsx';
import './index.css';

const clientSideId = import.meta.env.VITE_LD_CLIENT_SIDE_ID;

if (!clientSideId) {
  throw new Error(
    'Missing VITE_LD_CLIENT_SIDE_ID. Check your .env.local file.',
  );
}

const initialContext = {
  kind: 'user',
  key: 'internal-qa-01',
  name: 'Internal QA',
  user_tier: 'Standard',
  geography: 'India',
  device_type: 'Desktop',
  beta_tester: true,
};

const LDReactProvider = createLDReactProvider(
  clientSideId,
  initialContext,
  {
    ldOptions: {
      streaming: true,
    },
  },
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LDReactProvider>
      <App />
    </LDReactProvider>
  </StrictMode>,
);
