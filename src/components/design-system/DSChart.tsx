import React, { useState } from 'react';
import { motion } from 'motion/react';

// 1. Sparkline for Metric Cards
export interface DSSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

export const DSSparkline: React.FC<DSSparklineProps> = ({
  data,
  width = 120,
  height = 40,
  color = '#06B6D4', // cyan-500
  fillColor = 'rgba(6, 182, 212, 0.15)',
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Background Gradient Area */}
      <polygon points={areaPoints} fill={fillColor} />
      {/* Outline Path */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// 2. Bar Chart Component
export interface DSBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export const DSBarChart: React.FC<DSBarChartProps> = ({ data, height = 180 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="w-full flex flex-col font-mono text-[10px] text-slate-500">
      <div className="flex items-end justify-between w-full border-b border-slate-900 pb-2 relative" style={{ height }}>
        {data.map((item, idx) => {
          const barHeight = (item.value / maxVal) * (height - 20);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center justify-end h-full px-1 relative group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-6 bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded-sm shadow-md whitespace-nowrap z-10">
                  {item.value.toLocaleString()} ops
                </div>
              )}

              {/* Bar Column */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                className={`w-full rounded-t-xs transition-colors duration-200 ${
                  isHovered ? 'bg-cyan-400' : 'bg-slate-800'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Axis Labels */}
      <div className="flex justify-between w-full pt-1.5 px-0.5 text-slate-400">
        {data.map((item) => (
          <span key={item.label} className="text-center truncate flex-1 font-mono uppercase tracking-tight">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// 3. Glowing Area Chart Component
export interface DSAreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export const DSAreaChart: React.FC<DSAreaChartProps> = ({ data, height = 200 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);

  const maxVal = Math.max(...data.map((d) => d.value)) || 1;
  const minVal = Math.min(...data.map((d) => d.value)) || 0;
  const range = maxVal - minVal || 1;

  const width = 500;
  const svgHeight = height;

  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = svgHeight - 25 - ((d.value - minVal) / range) * (svgHeight - 50);
    return { x, y, val: d.value, label: d.label };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - 15} L ${points[0].x} ${svgHeight - 15} Z`;

  return (
    <div className="w-full flex flex-col font-sans relative">
      <svg viewBox={`0 0 ${width} ${svgHeight}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="0" y1={svgHeight - 15} x2={width} y2={svgHeight - 15} stroke="#1E293B" strokeWidth="1" />
        <line x1="0" y1={svgHeight / 2} x2={width} y2={svgHeight / 2} stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3,3" />
        <line x1="0" y1="15" x2={width} y2="15" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3,3" />

        {/* Gradient Fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Glowing stroke outline */}
        <path d={pathD} fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Dots */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="4"
            className="fill-slate-950 stroke-cyan-400 stroke-2 cursor-pointer hover:r-6 transition-all"
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Axis label overlays */}
      <div className="flex justify-between w-full pt-1.5 px-1 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
        <span>{data[0].label}</span>
        <span>{data[Math.floor(data.length / 2)].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>

      {/* Inline Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute bg-slate-950 border border-slate-800 rounded-sm py-1.5 px-2.5 shadow-xl text-xs z-10"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / svgHeight) * 100 - 45}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-mono text-[9px] uppercase text-slate-400 mb-0.5">{hoveredPoint.label}</div>
          <div className="font-semibold text-cyan-400">{hoveredPoint.val.toLocaleString()} bytes</div>
        </div>
      )}
    </div>
  );
};

// 4. Activity Heatmap Grid (Github Style)
export const DSActivityHeatmap: React.FC = () => {
  const weeks = 24;
  const days = 7;
  // Generate pseudo-random intensity levels
  const intensities = [0, 1, 0, 2, 0, 3, 4, 1, 0, 0, 2, 1, 3, 0, 1, 2, 0, 4, 1, 2, 0];

  const levelClasses = {
    0: 'bg-slate-950 border-slate-900/60',
    1: 'bg-cyan-950/40 border-cyan-950',
    2: 'bg-cyan-900/40 border-cyan-900',
    3: 'bg-cyan-700/60 border-cyan-600/40',
    4: 'bg-cyan-500 border-cyan-400 text-slate-950',
  };

  return (
    <div className="flex flex-col gap-2 font-sans">
      <div className="flex gap-1 overflow-x-auto pb-1 select-none">
        {Array.from({ length: weeks }).map((_, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1 shrink-0">
            {Array.from({ length: days }).map((_, dIdx) => {
              const intensity = intensities[(wIdx * days + dIdx) % intensities.length] as 0 | 1 | 2 | 3 | 4;
              return (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 rounded-xs border transition-colors duration-150 cursor-pointer hover:border-cyan-400 ${levelClasses[intensity]}`}
                  title={`Agent dispatch activity level: ${intensity}/4`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono select-none">
        <span>Historical Log Span</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 border border-slate-900 bg-slate-950 rounded-xs" />
          <div className="w-2.5 h-2.5 border border-cyan-950 bg-cyan-950/40 rounded-xs" />
          <div className="w-2.5 h-2.5 border border-cyan-900 bg-cyan-900/40 rounded-xs" />
          <div className="w-2.5 h-2.5 border border-cyan-600/40 bg-cyan-700/60 rounded-xs" />
          <div className="w-2.5 h-2.5 border border-cyan-400 bg-cyan-500 rounded-xs" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

// 5. Circular Progress Dial / Gauge
export interface DSProgressCircleProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const DSProgressCircle: React.FC<DSProgressCircleProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center justify-center font-sans gap-2 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
          />
          {/* Animated Progress Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#06B6D4"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-100 tracking-tighter">
            {value}%
          </span>
          {label && (
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
