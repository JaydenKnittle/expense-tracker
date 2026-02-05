import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

export default function CashflowTimeline({ timeline }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const minBalance = Math.min(...timeline.map(t => t.balance));
  const maxBalance = Math.max(...timeline.map(t => t.balance));
  const range = maxBalance - minBalance || 1;

  const getYPosition = (balance) => {
    if (range === 0) return 50;
    // Fixed: Min at bottom (180), Max at top (20)
    return 180 - ((balance - minBalance) / range) * 160;
  };

  const warningDays = timeline.filter(t => t.warning);

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = x / rect.width;
    const index = Math.round(relativeX * (timeline.length - 1));
    
    if (index >= 0 && index < timeline.length) {
      setHoveredPoint({
        index,
        data: timeline[index],
        x: relativeX * 1000,
        y: getYPosition(timeline[index].balance)
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="cashflow-timeline-container">
      {warningDays.length > 0 && (
        <div className="cashflow-warning">
          ⚠️ Balance will drop below N$1,000 on {warningDays.length} day{warningDays.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="cashflow-chart">
        <svg 
          width="100%" 
          height="200" 
          viewBox="0 0 1000 200" 
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'crosshair' }}
        >
          {/* Grid lines */}
          <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="60" x2="1000" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="140" x2="1000" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="180" x2="1000" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {/* Area fill under line */}
          <polygon
            points={[
              '0,180',
              ...timeline.map((t, idx) => {
                const x = (idx / (timeline.length - 1)) * 1000;
                const y = getYPosition(t.balance);
                return `${x},${y}`;
              }),
              '1000,180'
            ].join(' ')}
            fill="rgba(99, 102, 241, 0.15)"
          />

          {/* Balance line */}
          <polyline
            points={timeline.map((t, idx) => {
              const x = (idx / (timeline.length - 1)) * 1000;
              const y = getYPosition(t.balance);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Warning points */}
          {timeline.map((t, idx) => {
            if (!t.warning) return null;
            const x = (idx / (timeline.length - 1)) * 1000;
            const y = getYPosition(t.balance);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="6"
                fill="#ef4444"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Data points */}
          {timeline.map((t, idx) => {
            if (idx % 3 !== 0) return null;
            const x = (idx / (timeline.length - 1)) * 1000;
            const y = getYPosition(t.balance);
            return (
              <circle
                key={`point-${idx}`}
                cx={x}
                cy={y}
                r="4"
                fill="#6366f1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Hover indicator */}
          {hoveredPoint && (
            <>
              <line
                x1={hoveredPoint.x}
                y1="20"
                x2={hoveredPoint.x}
                y2="180"
                stroke="rgba(99, 102, 241, 0.3)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="5,5"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="8"
                fill="#6366f1"
                stroke="white"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div 
            className="cashflow-tooltip"
            style={{
              left: `${(hoveredPoint.x / 1000) * 100}%`,
              transform: hoveredPoint.x > 500 ? 'translateX(-100%)' : 'translateX(0)'
            }}
          >
            <div className="cashflow-tooltip-date">
              {hoveredPoint.data.dateObj.toLocaleDateString('en-NA', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="cashflow-tooltip-balance">
              {formatCurrency(hoveredPoint.data.balance)}
            </div>
            {hoveredPoint.data.netChange !== 0 && (
              <div className={`cashflow-tooltip-change ${hoveredPoint.data.netChange > 0 ? 'positive' : 'negative'}`}>
                {hoveredPoint.data.netChange > 0 ? '+' : ''}{formatCurrency(hoveredPoint.data.netChange)}
              </div>
            )}
          </div>
        )}

        <div className="cashflow-days">
          {timeline.filter((_, idx) => idx % 5 === 0).map((t, idx) => (
            <div key={idx} className="cashflow-day-label">
              {t.dateObj.toLocaleDateString('en-NA', { month: 'short', day: 'numeric' })}
            </div>
          ))}
        </div>

        <div className="cashflow-balance-labels">
          <div className="cashflow-balance-label max">
            Max: {formatCurrency(maxBalance)}
          </div>
          <div className="cashflow-balance-label min">
            Min: {formatCurrency(minBalance)}
          </div>
        </div>
      </div>

      <div className="cashflow-transactions">
        <div className="cashflow-transactions-title">Upcoming Transactions</div>
        {timeline.filter(t => t.income > 0 || t.expenses > 0).slice(0, 10).map((t, idx) => (
          <div key={idx} className="cashflow-transaction">
            <div className="cashflow-date">
              {t.dateObj.toLocaleDateString('en-NA', { month: 'short', day: 'numeric' })}
            </div>
            <div className="cashflow-amounts">
              {t.income > 0 && (
                <span className="cashflow-income">+{formatCurrency(t.income)}</span>
              )}
              {t.expenses > 0 && (
                <span className="cashflow-expense">-{formatCurrency(t.expenses)}</span>
              )}
            </div>
            <div className="cashflow-balance">
              Balance: {formatCurrency(t.balance)}
            </div>
          </div>
        ))}
        {timeline.filter(t => t.income > 0 || t.expenses > 0).length === 0 && (
          <div className="cashflow-empty">
            No upcoming recurring transactions in the next 30 days
          </div>
        )}
      </div>
    </div>
  );
}