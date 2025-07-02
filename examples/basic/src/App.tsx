import React, { useState, useCallback } from 'react';
import {
  PokerHandReplay,
  type Action,
  type ComponentTheme,
  type ReplayEventCallback,
} from 'poker-hand-replay';
import { handHistories } from './hand-data';
import './index.css';

// Available themes for the theme selector
const themes: ComponentTheme[] = ['light', 'dark', 'auto', 'casino', 'professional'];

// Available hand histories for demonstration
const handOptions = [
  { key: 'sample', label: 'Sample Tournament Hand' },
  { key: 'allIn', label: 'All-In Side Pot Hand' },
  { key: 'invalid', label: 'Invalid Hand (Error Demo)' },
] as const;

type HandKey = keyof typeof handHistories;

function App() {
  // State for current hand selection
  const [selectedHand, setSelectedHand] = useState<HandKey>('sample');

  // State for theme selection
  const [selectedTheme, setSelectedTheme] = useState<ComponentTheme>('dark');

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for success messages
  const [status, setStatus] = useState<string | null>(null);

  // State for action logging
  const [actionLog, setActionLog] = useState<Array<{ action: Action; index: number }>>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState<number>(-1);

  // Handle action changes for logging
  const handleActionChange = useCallback((action: Action, index: number) => {
    setCurrentActionIndex(index);
    setActionLog(prev => {
      const newLog = [...prev];
      // Add new action if it's not already in the log
      if (!newLog.some(entry => entry.index === index)) {
        newLog.push({ action, index });
        // Keep only last 20 actions
        if (newLog.length > 20) {
          newLog.shift();
        }
      }
      return newLog;
    });
  }, []);

  // Handle replay events for error/success feedback
  const handleReplayEvent: ReplayEventCallback = useCallback((event, data) => {
    console.log('Replay event:', event, data);

    switch (event) {
      case 'parseError':
        setError(data?.error?.message || 'Failed to parse hand history');
        setStatus(null);
        setActionLog([]);
        break;

      case 'parseSuccess':
        setError(null);
        setStatus(`Successfully parsed hand: ${data?.hand?.id || 'Unknown'}`);
        setActionLog([]);
        setCurrentActionIndex(-1);
        break;

      case 'start':
        setStatus('Replay started');
        break;

      case 'pause':
        setStatus('Replay paused');
        break;

      case 'end':
        setStatus('Replay finished');
        break;

      case 'reset':
        setStatus('Replay reset');
        setCurrentActionIndex(-1);
        break;

      default:
        // Handle other events silently
        break;
    }
  }, []);

  // Handle hand selection change
  const handleHandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHand(event.target.value as HandKey);
    setError(null);
    setStatus(null);
    setActionLog([]);
    setCurrentActionIndex(-1);
  };

  // Handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTheme(event.target.value as ComponentTheme);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🃏 Poker Hand Replay</h1>
        <p>Basic example demonstrating core functionality</p>
      </header>

      <div className="controls">
        <div className="hand-selector">
          <label htmlFor="hand-select">Choose Hand:</label>
          <select id="hand-select" value={selectedHand} onChange={handleHandChange}>
            {handOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="theme-selector">
          <label htmlFor="theme-select">Theme:</label>
          <select id="theme-select" value={selectedTheme} onChange={handleThemeChange}>
            {themes.map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {status && !error && <div className="status-info">✅ {status}</div>}

      <main className="replay-container">
        <PokerHandReplay
          handHistory={handHistories[selectedHand]}
          config={{
            theme: selectedTheme,
            autoPlay: false,
            animationSpeed: 1.5,
            tableShape: 'oval',
            cardDesign: 'four-color',
            showAllCards: false,
            enableSounds: false,
            size: 'medium',
            animations: {
              enableCardAnimations: true,
              enableChipAnimations: true,
              enableActionHighlight: true,
              cardDealDuration: 800,
              actionTransitionDuration: 400,
              easing: 'ease-out',
            },
          }}
          onActionChange={handleActionChange}
          onReplayEvent={handleReplayEvent}
          enableLoadingStates={true}
          enableErrorRecovery={true}
        />

        {actionLog.length > 0 && (
          <div className="action-log">
            <h3>Action Log</h3>
            {actionLog.map((entry, idx) => (
              <div
                key={`${entry.index}-${idx}`}
                className={`action-log-entry ${
                  entry.index === currentActionIndex ? 'current' : ''
                }`}
              >
                #{entry.index + 1}: {entry.action.player || 'System'} - {entry.action.type}
                {entry.action.amount && ` ($${entry.action.amount})`}
                {entry.action.cards && ` [${entry.action.cards.join(', ')}]`}
                {entry.action.isAllIn && ' (ALL-IN)'}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          This is a basic example. Check out the{' '}
          <a href="../advanced/" target="_blank" rel="noopener noreferrer">
            advanced example
          </a>{' '}
          for more features, or browse{' '}
          <a href="../" target="_blank" rel="noopener noreferrer">
            all examples
          </a>
          .
        </p>
        <p>
          <a href="../../README.md" target="_blank" rel="noopener noreferrer">
            📚 Documentation
          </a>{' '}
          |{' '}
          <a
            href="https://github.com/junichiro/poker-replayer"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
