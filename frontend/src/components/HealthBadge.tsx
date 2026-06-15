import React from 'react';
import type { RTCHealth } from '../hooks/useRTCStats';

export const HealthBadge: React.FC<{ health: RTCHealth }> = ({ health }) => {
  const statusColors = {
    excellent: 'bg-green-500',
    good: 'bg-emerald-400',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 glass-panel !rounded-full text-xs font-medium">
      <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors[health.status]}`} />
      <span className="uppercase tracking-wider opacity-80">{health.status}</span>
      <span className="opacity-40">|</span>
      <span>{health.latency}ms</span>
    </div>
  );
};
