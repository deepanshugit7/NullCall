import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

export const Lobby: React.FC<{ onJoin: (roomId: string) => void }> = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const { theme, toggleTheme } = useTheme();

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 10);
    onJoin(id);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoin(roomId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-8 right-8 btn-icon"
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10 space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-primary rounded-[2.5rem] shadow-2xl shadow-accent-primary/30 mb-2 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
            <span className="text-4xl font-black text-white">N</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-text-primary via-text-primary to-text-secondary">NullCall</h1>
            <p className="text-text-secondary font-medium text-lg">Modern, high-fidelity video conferencing.</p>
          </div>
        </div>

        <div className="glass-panel p-10 space-y-8 shadow-2xl ring-1 ring-white/5">
          <button 
            onClick={generateRoomId}
            className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 group"
          >
            <span>Start New Chat Room</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-text-secondary/50">
              <span className="bg-bg-primary px-4">OR JOIN WITH CODE</span>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room identifier..."
                className="w-full bg-glass border border-glass-border rounded-2xl px-6 py-5 focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all font-mono text-center text-xl tracking-widest placeholder:text-text-secondary/30 placeholder:font-sans placeholder:tracking-normal"
              />
            </div>
            <button type="submit" className="w-full py-4 bg-bg-secondary hover:bg-glass text-text-primary font-bold rounded-2xl border border-glass-border transition-all shadow-lg hover:border-accent-primary/50">
              Join Existing Session
            </button>
          </form>
        </div>

        <div className="flex justify-center gap-10 opacity-40">
          <div className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">HD Video</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
};
