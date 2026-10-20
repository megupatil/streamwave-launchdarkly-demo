
import { useState } from 'react';
import {
  useBoolVariation,
  useLDClient,
} from '@launchdarkly/react-sdk';
import './App.css';

// -----------------------------------------------------------------------------
// Demo personas
//
// Reviewer setup: Configure the `new-player-experience` Boolean flag in
// LaunchDarkly using the targeting rules documented in README.md.
//
// Internal QA receives the new experience through individual targeting.
// Premium customers receive it through the `user_tier = Premium` rule.
// Standard customers receive the default false variation.
//
// The context keys and attribute values below must match the configuration
// created in your LaunchDarkly environment.
// -----------------------------------------------------------------------------
const personas = {
  qa: {
    label: 'Internal QA',
    key: 'internal-qa-01',
    name: 'Internal QA',
    user_tier: 'Standard',
    beta_tester: true,
    geography: 'India',
    device_type: 'Desktop',
  },
  premium: {
    label: 'Premium Customer',
    key: 'premium-customer-01',
    name: 'Premium Customer',
    user_tier: 'Premium',
    beta_tester: false,
    geography: 'India',
    device_type: 'Desktop',
  },
  standard: {
    label: 'Standard Customer',
    key: 'standard-customer-01',
    name: 'Standard Customer',
    user_tier: 'Standard',
    beta_tester: false,
    geography: 'India',
    device_type: 'Desktop',
  },
};

// Sample catalogue data used to make the fictional StreamWave interface
// feel like a customer-facing streaming application.
const titles = [
  {
    name: 'Beyond the Horizon',
    genre: 'Adventure · 2026',
    category: 'FEATURED',
    color: 'horizon',
  },
  {
    name: 'The Last Signal',
    genre: 'Thriller · 8 episodes',
    category: 'SERIES',
    color: 'signal',
  },
  {
    name: 'Neon District',
    genre: 'Sci-fi · 2026',
    category: 'ORIGINAL',
    color: 'neon',
  },
];

// Renders the player experience selected by the LaunchDarkly Boolean flag.
// A true variation displays the new experience; false displays the legacy one.
// This component only demonstrates UI variation; it does not play actual video.
function PlayerExperience({ isNewPlayer }) {
  return (
    <section
      className={`player ${isNewPlayer ? 'player-new' : 'player-legacy'}`}
      aria-label="Featured playback experience"
    >
      <div className="player-content">
        <div className="play-button" aria-hidden="true">▶</div>

        <p className="eyebrow">
          {isNewPlayer ? 'YOUR NEXT CHAPTER' : 'CONTINUE WATCHING'}
        </p>

        <h2>
          {isNewPlayer
            ? 'Entertainment, reimagined.'
            : 'Welcome back to your story.'}
        </h2>

        <p className="player-description">
          {isNewPlayer
            ? 'Discover a smoother way to explore and enjoy your favourite stories.'
            : 'Pick up where you left off and enjoy your favourite stories.'}
        </p>

        <button className="watch-button">
          ▶ &nbsp; Start watching
        </button>
      </div>
    </section>
  );
}

export default function App() {
  // Access the initialized LaunchDarkly client so the demo can identify
  // different contexts when the reviewer changes the selected persona.
  const ldClient = useLDClient();

  // Evaluate the flag for the current LaunchDarkly context.
  // The second argument, false, is the fallback value used when a flag
  // value is unavailable. It does not replace LaunchDarkly targeting rules.
  const isNewPlayer = useBoolVariation('new-player-experience', false);

  // Track the persona selected in the demo controls.
  const [persona, setPersona] = useState('qa');

  // Expose context-switch progress and errors to make the demo easier to operate.
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');

  // Identify the selected demo persona in LaunchDarkly.
  // This causes the SDK to evaluate flags for the selected context.
  async function changePersona(event) {
    const nextPersona = event.target.value;
    setPersona(nextPersona);
    setSwitching(true);
    setSwitchError('');

    try {
      // The selected persona's key and attributes are sent to LaunchDarkly.
      // Keep these values aligned with the flag's targeting configuration.
      await ldClient.identify({
        kind: 'user',
        ...personas[nextPersona],
      });
    } catch (error) {
      // Log technical details for debugging while showing a readable message
      // in the interface rather than exposing raw errors to the demo user.
      console.error('Unable to change LaunchDarkly context:', error);
      setSwitchError('Unable to update the test user. Check the browser console.');
    } finally {
      setSwitching(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-mark">S</span>
          STREAMWAVE
        </a>

        <nav aria-label="Main navigation">
          <a className="nav-active" href="#home">Home</a>
          <a href="#discover">Discover</a>
          <a href="#my-list">My List</a>
        </nav>

        <div className="profile">
          <span className="profile-avatar">S</span>
          <span>My account</span>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">A WORLD OF STORIES</p>
          <h1>Every story.<br />One destination.</h1>
          <p>
            Discover the stories everyone will be talking about.
            Your next favourite is waiting.
          </p>
          <button className="primary-button">Explore streaming</button>
        </div>

        <div className="hero-art" aria-label="Abstract cinematic artwork">
          <div className="hero-orb" />
          <div className="hero-art-label">STORIES WITHOUT LIMITS</div>
        </div>
      </section>

      <section className="featured" aria-label="Featured playback">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FEATURED FOR YOU</p>
            <h2>Your next favourite starts here</h2>
          </div>
        </div>

        {/* The rendered player changes according to the evaluated flag value. */}
        <PlayerExperience isNewPlayer={isNewPlayer} />
      </section>

      <section className="catalog" id="discover">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>Stories worth staying in for</h2>
          </div>
          <a className="catalog-link" href="#discover">Explore all →</a>
        </div>

        {/* Render the sample catalogue from data to avoid repeating card markup. */}
        <div className="title-grid">
          {titles.map((title) => (
            <article className={`title-card ${title.color}`} key={title.name}>
              <span className="title-category">{title.category}</span>
              <div className="title-art" />
              <div className="title-info">
                <h3>{title.name}</h3>
                <p>{title.genre}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interview-only controls for demonstrating context-based flag targeting.
          These controls are not an authentication or authorization mechanism. */}
      <section className="demo-controls" aria-label="Interview demo controls">
        <div>
          <p className="eyebrow">INTERVIEW DEMO · TESTING ONLY</p>
          <h2>Test user targeting</h2>
          <p className="demo-description">
            Switch test personas to verify how LaunchDarkly targeting changes
            the playback experience. These controls are for demonstration only.
          </p>
        </div>

        <label className="persona-label">
          Select test persona
          <select value={persona} onChange={changePersona} disabled={switching}>
            {Object.entries(personas).map(([key, value]) => (
              <option value={key} key={key}>{value.label}</option>
            ))}
          </select>
        </label>

        {/* Display the selected persona's attributes to help reviewers verify
            which context is being evaluated during the demonstration. */}
        <div className="persona-summary">
          <span><strong>User tier:</strong> {personas[persona].user_tier}</span>
          <span><strong>Beta tester:</strong> {String(personas[persona].beta_tester)}</span>
          <span><strong>Context key:</strong> {personas[persona].key}</span>
        </div>

        {switching && <p role="status">Updating test user…</p>}
        {switchError && <p className="demo-error" role="alert">{switchError}</p>}
      </section>

      <footer>
        <span>
          STREAMWAVE <span className="muted">· Fictional streaming demo</span>
        </span>
        <span>Discover something worth watching.</span>
      </footer>
    </main>
  );
}
