
import { useState } from 'react';
import {
  useBoolVariation,
  useLDClient,
} from '@launchdarkly/react-sdk';
import './App.css';

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
  const ldClient = useLDClient();
  const isNewPlayer = useBoolVariation('new-player-experience', false);
  const [persona, setPersona] = useState('qa');
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');

  async function changePersona(event) {
    const nextPersona = event.target.value;
    setPersona(nextPersona);
    setSwitching(true);
    setSwitchError('');

    try {
      await ldClient.identify({
        kind: 'user',
        ...personas[nextPersona],
      });
    } catch (error) {
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
