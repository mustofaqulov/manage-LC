import React, { useState, useRef, useEffect, useMemo } from 'react';

interface DataPoint {
  date: string;
  score: number;
}

interface ScoreChartProps {
  data: DataPoint[];
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 45 };

const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const height = 220;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const minScore = Math.max(0, Math.min(...data.map((d) => d.score)) - 10);
    const maxScore = Math.min(100, Math.max(...data.map((d) => d.score)) + 10);
    const range = maxScore - minScore || 1;

    return data.map((d, i) => ({
      x: PADDING.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
      y: PADDING.top + chartH - ((d.score - minScore) / range) * chartH,
      ...d,
    }));
  }, [data, chartW, chartH]);

  const yTicks = useMemo(() => {
    if (data.length === 0) return [];
    const minScore = Math.max(0, Math.min(...data.map((d) => d.score)) - 10);
    const maxScore = Math.min(100, Math.max(...data.map((d) => d.score)) + 10);
    const step = Math.ceil((maxScore - minScore) / 4);
    const ticks: number[] = [];
    for (let v = Math.floor(minScore); v <= maxScore; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-white/40 text-sm">Hali baholangan natijalar yo'q</p>
      </div>
    );
  }

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = points.length > 1
    ? `M${points[0].x},${PADDING.top + chartH} L${polyline} L${points[points.length - 1].x},${PADDING.top + chartH} Z`
    : '';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div ref={containerRef} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
      <svg
        width={width}
        height={height}
        className="w-full"
        onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff7300" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff7300" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff7300" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        {yTicks.map((val) => {
          const minScore = Math.max(0, Math.min(...data.map((d) => d.score)) - 10);
          const maxScore = Math.min(100, Math.max(...data.map((d) => d.score)) + 10);
          const range = maxScore - minScore || 1;
          const y = PADDING.top + chartH - ((val - minScore) / range) * chartH;
          return (
            <g key={val}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chartW}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4,4"
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="11"
                fontWeight="600">
                {val}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

        {/* Line */}
        {points.length > 1 && (
          <polyline
            points={polyline}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points and hover areas */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Hover area */}
            <rect
              x={p.x - (chartW / data.length) / 2}
              y={PADDING.top}
              width={chartW / data.length}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />

            {/* Dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === i ? 6 : 4}
              fill={hoverIdx === i ? '#ff7300' : '#1a1a1a'}
              stroke="#ff7300"
              strokeWidth="2.5"
              style={{ transition: 'r 0.15s ease' }}
            />

            {/* X-axis date labels (show some to avoid overlap) */}
            {(data.length <= 8 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) && (
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontWeight="500">
                {formatDate(p.date)}
              </text>
            )}

            {/* Tooltip */}
            {hoverIdx === i && (
              <g>
                <line
                  x1={p.x}
                  y1={PADDING.top}
                  x2={p.x}
                  y2={PADDING.top + chartH}
                  stroke="rgba(255,115,0,0.2)"
                  strokeDasharray="4,4"
                />
                <rect
                  x={p.x - 40}
                  y={p.y - 36}
                  width="80"
                  height="26"
                  rx="8"
                  fill="rgba(30,30,30,0.95)"
                  stroke="rgba(255,115,0,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={p.x}
                  y={p.y - 19}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="700">
                  {Math.round(p.score)}%
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ScoreChart;
