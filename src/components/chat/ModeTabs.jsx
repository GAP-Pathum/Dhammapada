import { modes, modeKeys } from '../../constants/modes';

export default function ModeTabs({ activeMode, onModeChange }) {
  return (
    <div className="mode-tabs">
      {modeKeys.map((key) => (
        <button
          key={key}
          className={`mode-tab${activeMode === key ? ' active' : ''}`}
          onClick={() => onModeChange(key)}
        >
          {modes[key].label}
        </button>
      ))}
    </div>
  );
}
