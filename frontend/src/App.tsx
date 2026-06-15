import { useState } from 'react';
import { Lobby } from './components/Lobby';
import { Room } from './components/Room';

function App() {
  const [roomId, setRoomId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });

  const handleJoin = (id: string) => {
    setRoomId(id);
    // Update URL without reloading
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleLeave = () => {
    setRoomId(null);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-blue-500/30">
      {!roomId ? (
        <Lobby onJoin={handleJoin} />
      ) : (
        <Room roomId={roomId} onLeave={handleLeave} />
      )}
    </div>
  );
}

export default App;
