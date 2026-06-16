# NullCall 

Instant, serverless-feeling video calls — no accounts, no servers storing your data, just a code and a connection.

NullCall is a peer-to-peer video chat application built on **WebRTC**. You create a room, share a short code with someone, and within seconds you're face-to-face — HD video, real-time chat, screen sharing, and all. Nothing is recorded. Nothing is stored. When you leave, the room simply disappears.

## Languages Used

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

| Language | Where it lives | Purpose |
|---|---|---|
| **TypeScript** | `frontend/src/**/*.tsx`, `*.ts` | All React components, hooks, and type definitions |
| **JavaScript** | `backend/index.js` | Signaling server (Node.js runtime) |
| **HTML** | `frontend/index.html` | App shell and Vite entry point |
| **CSS** | `frontend/src/index.css` | Tailwind base styles, custom design tokens, animations |

## Why NullCall?

Most video call apps ask you to sign up, install software, or trust a company with your conversations. NullCall skips all of that. It uses the browser's native WebRTC engine to punch a direct connection between two people — the server only helps them *find* each other, not eavesdrop on them.

---

## Features

- 🎥 **HD Video & Audio** — Up to 1280×720 @ 30fps, straight from your browser
- 🔗 **Zero-friction rooms** — One click to create, one code to share
- 💬 **Live in-room chat** — Text alongside video, auto-scrolling
- 🖥️ **Screen sharing** — Share your whole screen or a specific window, with 60fps capture
- 📺 **Picture-in-Picture** — Float your own camera in a corner while you work
- ⛶ **Fullscreen mode** — Go fullscreen when your partner shares their screen
- 📶 **Connection health monitor** — Live packet-loss and latency badge, auto-downgrades to audio-only if the connection degrades badly
- 🌗 **Dark / Light mode** — System preference respected, manual toggle available

## How It Works

```
You ──────────────────────────────────────► Peer
      (1) Join room via Signaling Server
      (2) Exchange WebRTC offer/answer
      (3) Direct P2P connection established
      (4) Video, audio, and chat flow directly
```
1. Both users join the same room ID.
2. The **signaling server** (Node.js + Socket.IO) relays the WebRTC handshake.
3. Once connected, all media flows **directly between browsers** — the server is no longer in the path.
4. When you leave, the room is purged from memory.

## Tech Stack

| Layer | Technology |
|---|---|
| **Languages** | TypeScript, JavaScript, HTML, CSS |
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **Real-time comms** | WebRTC (browser-native) |
| **Signaling** | Node.js + Express + Socket.IO |
| **State/Hooks** | Custom React hooks (`useWebRTC`, `useRTCStats`) |
| **Package manager** | npm |

## Project Structure

```
NullCall/
├── backend/
│   ├── index.js          # Signaling server (Socket.IO)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # Root router (Lobby ↔ Room)
    │   ├── components/
    │   │   ├── Lobby.tsx         # Landing page, room creation/join
    │   │   ├── Room.tsx          # Main call UI, video layout, chat
    │   │   ├── Controls.tsx      # Mic/cam/screen/PiP/leave buttons
    │   │   ├── HealthBadge.tsx   # Live connection quality indicator
    │   │   └── ThemeProvider.tsx # Dark/light theme context
    │   └── hooks/
    │       ├── useWebRTC.ts      # WebRTC lifecycle, signaling, chat
    │       └── useRTCStats.ts    # Packet loss, latency, audio-only fallback
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- A modern browser (Chrome, Edge, Firefox — all support WebRTC)

### 1. Start the signaling server

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:3001
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

### 3. Make a call

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Click **"Start New Chat Room"** — a random room code is generated.
3. Share the code with someone else (they paste it into "Join Existing Session").
4. That's it. You're connected.

**Tip:** The room URL updates automatically (`?room=abc123`), so you can also just share the full link.

---

## Configuration

### Deploying the backend

Set the `PORT` environment variable if needed (default: `3001`). For production, restrict the CORS origin in `backend/index.js`:

```js
// backend/index.js
cors: {
  origin: "https://your-frontend-domain.com", // replace *
  methods: ["GET", "POST"]
}
```

### Pointing the frontend at your server

Update the Socket.IO connection URL in `frontend/src/hooks/useWebRTC.ts`:

```ts
socketRef.current = io('https://your-backend-url.com');
```

## Limitations & Known Behaviours

- **2 users per room max.** NullCall is designed for 1-on-1 calls. A third person trying to join will be rejected with an error.
- **No persistent state.** Rooms live in memory. Restarting the server clears all rooms.
- **STUN only.** The current ICE config uses Google's public STUN servers. For users behind strict NATs or corporate firewalls, a TURN server would improve reliability.
- **Local network only** by default (if backend is `localhost`). Deploy the backend to a public server for remote calls.
