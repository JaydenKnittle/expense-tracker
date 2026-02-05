import { formatCurrency } from '../utils/calculations';

export default function InteractiveSlider({ value, onChange, min, max, step, label }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="interactive-slider">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <div className="slider-value">{formatCurrency(value)}</div>
      </div>
      
      <div className="slider-track-container">
        <input
          type="range"
          className="slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="slider-markers">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}</span>
        </div>
      </div>
    </div>
  );
}