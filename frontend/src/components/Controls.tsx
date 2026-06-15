import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ControlsProps {
  onLeave: () => void;
  localStream: MediaStream | null;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  onTogglePiP?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  onLeave, 
  localStream, 
  isScreenSharing, 
  onToggleScreenShare,
  onTogglePiP
}) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOn(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="flex items-center gap-4 p-6 glass-panel shadow-2xl ring-1 ring-white/5">
      <button 
        onClick={toggleMic}
        className={`btn-icon ${!micOn ? 'bg-rose-500/20 border-rose-500/50 text-rose-500' : ''}`}
        title={micOn ? 'Mute Mic' : 'Unmute Mic'}
      >
        {micOn ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        )}
      </button>

      <button 
        onClick={toggleVideo}
        className={`btn-icon ${!videoOn ? 'bg-rose-500/20 border-rose-500/50 text-rose-500' : ''}`}
        title={videoOn ? 'Stop Video' : 'Start Video'}
      >
        {videoOn ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        )}
      </button>

      <button 
        onClick={onToggleScreenShare}
        className={`btn-icon ${isScreenSharing ? 'bg-accent-primary border-accent-primary text-white' : ''}`}
        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </button>

      {document.pictureInPictureEnabled && (
        <button 
          onClick={onTogglePiP}
          className="btn-icon"
          title="Toggle Picture-in-Picture"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3-3m0 0l-3 3m3-3v8" /></svg>
        </button>
      )}

      <div className="w-px h-8 bg-glass-border mx-2" />

      <button 
        onClick={toggleTheme}
        className="btn-icon"
        title="Toggle Theme"
      >
        {theme === 'dark' ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      <button 
        onClick={onLeave}
        className="btn-icon bg-rose-500 hover:bg-rose-600 text-white border-transparent shadow-lg shadow-rose-500/20"
        title="Leave Room"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      </button>
    </div>
  );
};
