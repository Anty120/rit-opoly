export function GameHud({ onReset }: { onReset: () => void }) {
  return <>
    <header className="hud masthead">
      <span className="eyebrow">A LITTLE WORLD TO PLAY IN</span>
      <h1>rit<span>·</span>opoly</h1><p>The meadow</p>
    </header>
    <div className="hud world-label"><span className="status-dot" /> Free roam <span className="divider">/</span> Island 01</div>
    <button className="home-button" onClick={event => { onReset(); event.currentTarget.blur() }} title="Return to the starting position (R)">&#8634; <span>Back to start</span></button>
    <footer className="hud controls">
      <div><span className="keys"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><span>Wander<small>or arrow keys</small></span></div>
      <i /><div><span className="mouse-icon" /><span>Look around<small>click + drag</small></span></div>
      <i /><div><kbd className="wide-key">shift</kbd><span>Run</span></div>
      <div><kbd className="wide-key">space</kbd><span>Jump</span></div>
    </footer>
    <p className="hud corner-note">Take your time. Find your place.</p>
  </>
}
