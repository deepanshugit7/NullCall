import React, { useEffect, useRef, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useRTCStats } from '../hooks/useRTCStats';
import { Controls } from './Controls';
import { HealthBadge } from './HealthBadge';

export const Room: React.FC<{ roomId: string; onLeave: () => void }> = ({ roomId, onLeave }) => {
  const { 
    localStream, 
    remoteStream, 
    connectionStatus,
    peerConnection, 
    messages, 
    sendMessage, 
    isScreenSharing,
    isRemoteScreenSharing,
    toggleScreenShare 
  } = useWebRTC(roomId);
  
  const health = useRTCStats(peerConnection, localStream);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!isRemoteScreenSharing && document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Exit Fullscreen Error:', err));
    }
  }, [isRemoteScreenSharing]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePiP = async () => {
    try {
      if (localVideoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await localVideoRef.current.requestPictureInPicture();
        }
      }
    } catch (err) {
      console.error('PiP Error:', err);
    }
  };

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (remoteContainerRef.current) {
          await remoteContainerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-primary flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-accent-primary/20">F</div>
            <div>
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Active Chat Room</h2>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium opacity-80">{roomId}</p>
                <button 
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-accent-primary"
                  title="Copy ID"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <HealthBadge health={health} />
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 rounded-xl transition-all ${isChatOpen ? 'bg-accent-primary text-white' : 'bg-glass border border-glass-border text-text-primary'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </button>
          </div>
        </header>

        {/* Video Display */}
        <main className="flex-1 p-6 relative flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
            {/* Remote Video (Main / Wide) */}
            <div 
              ref={remoteContainerRef}
              className={`video-container w-full h-full transition-all duration-700 relative ${!remoteStream ? 'hidden' : 'block'}`}
            >
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 z-10">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Partner {isRemoteScreenSharing ? '(Screen)' : ''}</span>
              </div>
              {isRemoteScreenSharing && (
                <button
                  onClick={toggleFullScreen}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-white transition-all shadow-lg hover:scale-105"
                  title="Toggle Full Screen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              )}
            </div>

            {/* Local Video - Shared stable element */}
            <div className={`video-container transition-all duration-500 shadow-2xl border-2 border-white/10 group ${
              remoteStream 
                ? 'absolute bottom-4 right-4 w-1/4 min-w-[200px] aspect-video z-20' 
                : 'w-full h-full max-h-[80vh] opacity-40 grayscale-[0.5]'
            }`}>
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-700 ${health.isAudioOnly ? 'opacity-20' : 'opacity-100'}`}
              />
              <div className={`absolute top-2 left-2 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 transition-all ${!remoteStream ? 'scale-125 translate-x-4 translate-y-4' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                  {remoteStream ? (isScreenSharing ? 'You (Screen)' : 'You') : 'You (Preview)'}
                </span>
              </div>
            </div>

            {/* Waiting State Overlay */}
            {!remoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 pointer-events-none">
                <div className="bg-bg-primary/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-glass-border shadow-2xl flex flex-col items-center gap-6 pointer-events-auto">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-accent-primary/20 rounded-full animate-ping absolute inset-0" />
                    <div className="w-20 h-20 border-4 border-t-accent-primary border-accent-primary/10 rounded-full animate-spin relative" />
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-xl font-black text-text-primary tracking-tight">
                      {connectionStatus === 'connecting' ? 'Establishing Connection...' : 'Waiting for partner...'}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Share this code</p>
                      <div className="flex items-center gap-2 bg-accent-primary/10 pl-4 pr-2 py-2 rounded-2xl border border-accent-primary/20">
                        <span className="font-mono text-lg font-bold text-accent-primary tracking-wider">{roomId}</span>
                        <button 
                          onClick={copyToClipboard}
                          className="ml-2 p-2 bg-accent-primary text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-accent-primary/20"
                        >
                          {copied ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Controls */}
        <footer className="p-8 flex justify-center z-10">
          <Controls 
            onLeave={onLeave} 
            localStream={localStream} 
            isScreenSharing={isScreenSharing}
            onToggleScreenShare={toggleScreenShare}
            onTogglePiP={togglePiP}
          />
        </footer>

        {/* Warning Banner */}
        {health.status === 'poor' && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20 animate-bounce">
            <div className="bg-rose-500 border border-rose-600 shadow-2xl p-4 rounded-2xl flex items-center gap-4 text-white">
              <div className="p-2 bg-white/20 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <p className="font-bold">Unstable connection</p>
                <p className="text-xs opacity-80">Video quality may be reduced automatically.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <aside className={`sidebar absolute right-0 h-full z-40 transition-transform duration-500 ease-in-out md:relative ${isChatOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:-mr-80'}`}>
        <div className="p-6 border-b border-glass-border flex justify-between items-center">
          <h3 className="font-black text-xl tracking-tight">Chat Room</h3>
          <button className="md:hidden p-2 -mr-2 text-text-secondary hover:text-white transition-colors" onClick={() => setIsChatOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <ScrollToBottom className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-20 text-center space-y-4 p-8">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="font-bold">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble ${msg.sender === 'Me' ? 'chat-bubble-me' : 'chat-bubble-them'}`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{msg.sender}</div>
                  <div className="break-words font-medium">{msg.text}</div>
                  <div className="text-[8px] opacity-40 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollToBottom>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-glass-border bg-bg-secondary/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-glass border border-glass-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary transition-all text-sm"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim()}
              className="p-3 bg-accent-primary text-white rounded-xl hover:bg-accent-secondary transition-all disabled:opacity-50 shadow-lg shadow-accent-primary/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
