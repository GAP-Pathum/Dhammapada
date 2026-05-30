import { modes } from '../../constants/modes';

export default function Suggestions({ activeMode, onSend }) {
  const chips = modes[activeMode]?.chips || [];
  return (
    <div className="suggestions" id="suggestions">
      {chips.map((chip) => (
        <button
          key={chip}
          className="suggestion-chip"
          onClick={() => onSend(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
