import { useEffect, useState, useRef } from 'react';

export interface RTCHealth {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  packetLoss: number;
  latency: number;
  isAudioOnly: boolean;
}

export const useRTCStats = (peerConnection: RTCPeerConnection | null, localStream: MediaStream | null) => {
  const [health, setHealth] = useState<RTCHealth>({
    status: 'excellent',
    packetLoss: 0,
    latency: 0,
    isAudioOnly: false,
  });

  const intervalRef = useRef<number | null>(null);
  const prevStatsRef = useRef<RTCStatsReport | null>(null);

  useEffect(() => {
    if (!peerConnection) return;

    intervalRef.current = window.setInterval(async () => {
      const stats = await peerConnection.getStats();
      let currentPacketLoss = 0;
      let currentLatency = 0;

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          const packetsLost = report.packetsLost || 0;
          const packetsReceived = report.packetsReceived || 0;
          
          if (prevStatsRef.current) {
            const prevPacketsLost = prevStatsRef.current.get(report.id)?.packetsLost || 0;
            const prevPacketsReceived = prevStatsRef.current.get(report.id)?.packetsReceived || 0;
            
            const lostDiff = packetsLost - prevPacketsLost;
            const receivedDiff = packetsReceived - prevPacketsReceived;
            const total = lostDiff + receivedDiff;
            
            if (total > 0) {
              currentPacketLoss = (lostDiff / total) * 100;
            }
          }
        }

        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          currentLatency = report.currentRoundTripTime * 1000 || 0;
        }
      });

      prevStatsRef.current = stats;

      // Determine Health Status
      let status: RTCHealth['status'] = 'excellent';
      if (currentPacketLoss > 5 || currentLatency > 300) status = 'poor';
      else if (currentPacketLoss > 2 || currentLatency > 150) status = 'fair';
      else if (currentPacketLoss > 0.5 || currentLatency > 80) status = 'good';

      // Audio-Only Fallback Logic
      const shouldBeAudioOnly = currentPacketLoss > 10 || currentLatency > 500;
      
      if (shouldBeAudioOnly && !health.isAudioOnly) {
        localStream?.getVideoTracks().forEach(track => track.enabled = false);
      } else if (!shouldBeAudioOnly && health.isAudioOnly) {
        localStream?.getVideoTracks().forEach(track => track.enabled = true);
      }

      setHealth({
        status,
        packetLoss: Math.round(currentPacketLoss * 10) / 10,
        latency: Math.round(currentLatency),
        isAudioOnly: shouldBeAudioOnly,
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [peerConnection, localStream, health.isAudioOnly]);

  return health;
};
