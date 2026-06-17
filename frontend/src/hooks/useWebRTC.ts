import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export const useWebRTC = (roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMediaReady, setIsMediaReady] = useState(false);
  
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

  const createPeerConnection = useCallback((targetSocketId: string) => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    setPeerConnection(pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('signal', {
          to: targetSocketId,
          signal: { type: 'candidate', candidate: event.candidate },
          roomId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state change:', pc.connectionState);
      switch (pc.connectionState) {
        case 'connected':
          setConnectionStatus('connected');
          break;
        case 'connecting':
          setConnectionStatus('connecting');
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          setConnectionStatus('disconnected');
          setRemoteStream(null);
          break;
      }
    };

    const stream = screenStreamRef.current || localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    return pc;
  }, [roomId]);

  // Initialize Media once
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }, 
          audio: true 
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        setIsMediaReady(true);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setIsMediaReady(true);
      }
    };
    getMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Socket & Signaling
  useEffect(() => {
    if (!roomId || !isMediaReady) return;

    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join-room', roomId);
    });

    socketRef.current.on('user-joined', async (userId) => {
      console.log('User joined:', userId);
      const pc = createPeerConnection(userId);
      
      // Ensure tracks are added before creating offer
      const stream = screenStreamRef.current || localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          if (pc.getSenders().every(s => s.track !== track)) {
            pc.addTrack(track, stream);
          }
        });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('signal', { to: userId, signal: offer, roomId });
    });

    socketRef.current.on('signal', async (data) => {
      const { from, signal } = data;
      let pc = pcRef.current;

      if (!pc) {
        pc = createPeerConnection(from);
      }

      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          if (candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding queued ice candidate', e);
            }
          }
        }
        
        // Ensure tracks are added before creating answer
        const stream = screenStreamRef.current || localStreamRef.current;
        if (stream) {
          stream.getTracks().forEach((track) => {
            if (pc && pc.getSenders().every(s => s.track !== track)) {
              pc.addTrack(track, stream);
            }
          });
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit('signal', { to: from, signal: answer, roomId });
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          if (candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding queued ice candidate', e);
            }
          }
        }
      } else if (signal.type === 'candidate') {
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            console.error('Error adding ice candidate', e);
          }
        } else {
          iceCandidateQueue.current.push(signal.candidate);
        }
      }
    });

    socketRef.current.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicate messages if sender and receiver both add it
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, sender: 'Partner' }];
      });
    });

    socketRef.current.on('screen-share-status', (isSharing: boolean) => {
      setIsRemoteScreenSharing(isSharing);
    });

    socketRef.current.on('user-left', () => {
      setRemoteStream(null);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    });

    return () => {
      socketRef.current?.disconnect();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [roomId, isMediaReady, createPeerConnection]);

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
            frameRate: { ideal: 60 }
          } as MediaTrackConstraints,
          audio: true
        });
        
        screenStreamRef.current = stream;
        setIsScreenSharing(true);

        const videoTrack = stream.getVideoTracks()[0];
        
        if (pcRef.current) {
          const senders = pcRef.current.getSenders();
          const sender = senders.find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        // Update local stream state for preview if desired, 
        // but often we want to keep showing camera locally or switch it.
        // Let's replace localStream for the UI too.
        setLocalStream(stream);

        socketRef.current?.emit('screen-share-status', { roomId, isSharing: true });

      } catch (err) {
        console.error('Error starting screen share:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    socketRef.current?.emit('screen-share-status', { roomId, isSharing: false });

    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (pcRef.current) {
        const senders = pcRef.current.getSenders();
        const sender = senders.find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
      setLocalStream(localStreamRef.current);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || !socketRef.current) return;
    
    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'Me',
      text,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, msg]);
    socketRef.current.emit('chat-message', { roomId, msg });
  };

  return {
    localStream,
    remoteStream,
    connectionStatus,
    messages,
    isScreenSharing,
    isRemoteScreenSharing,
    toggleScreenShare,
    sendMessage,
    peerConnection // Return the state-tracked peerConnection
  };
};
