'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { fal } from '@fal-ai/client';

export type ConnectionState = 'idle' | 'connecting' | 'streaming' | 'error';

const MODEL_ID = 'decart/lucy-2-5/realtime';

export function useFalRealtime() {
  const [state, setState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const connectionRef = useRef<any>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const facingModeRef = useRef<'user' | 'environment'>('user');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => cleanup();
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (connectionRef.current) {
      try { connectionRef.current.close(); } catch {}
      connectionRef.current = null;
    }
    setElapsed(0);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setState('connecting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 720, facingMode: facingModeRef.current },
        audio: false,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      let conn: any = null;

      const handleResult = async (result: any) => {
        switch (result.type) {
          case 'iceservers':
          case 'iceServers': {
            const servers = (result.iceservers || result.iceServers || result.ice_servers)
              .map((s: any) => ({ urls: s.urls, username: s.username, credential: s.credential }));
            const pc = new RTCPeerConnection({ iceServers: servers });
            pcRef.current = pc;
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            pc.ontrack = (e) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = e.streams[0];
              }
              setState('streaming');
              setElapsed(0);
              timerRef.current = setInterval(() => setElapsed((v) => v + 1), 1000);
            };
            pc.onicecandidate = (e) => {
              if (e.candidate && conn) {
                conn.send({
                  type: 'icecandidate',
                  candidate: {
                    candidate: e.candidate.candidate,
                    sdpMid: e.candidate.sdpMid,
                    sdpMLineIndex: e.candidate.sdpMLineIndex,
                  },
                });
              }
            };
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            conn?.send({ type: 'offer', sdp: offer.sdp });
            break;
          }
          case 'answer':
            if (pcRef.current) {
              await pcRef.current.setRemoteDescription({ type: 'answer', sdp: result.sdp });
            }
            break;
          case 'icecandidate':
            if (pcRef.current) {
              try { await pcRef.current.addIceCandidate(new RTCIceCandidate(result.candidate)); } catch {}
            }
            break;
          case 'ice-restart':
            if (result.turn_config && pcRef.current) {
              pcRef.current.setConfiguration({
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  {
                    urls: result.turn_config.server_url,
                    username: result.turn_config.username,
                    credential: result.turn_config.credential,
                  },
                ],
              });
              const offer = await pcRef.current.createOffer({ iceRestart: true });
              await pcRef.current.setLocalDescription(offer);
              conn?.send({ type: 'offer', sdp: offer.sdp });
            }
            break;
          case 'generation_started':
            setState('streaming');
            break;
          case 'error':
            setError(result.error || 'Server error');
            setState('error');
            break;
        }
      };

      conn = fal.realtime.connect(MODEL_ID, {
        onResult: handleResult,
        onError: (err: any) => {
          console.error('fal error:', err);
          setError(err.message || 'Connection error');
          setState('error');
        },
        tokenProvider: async (app: string) => {
          const response = await fetch('/api/fal/realtime-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app }),
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to get token');
          }
          return response.text();
        },
        tokenExpirationSeconds: 10,
      });

      connectionRef.current = conn;
      conn.send({});
    } catch (err) {
      console.error('startSession error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setState('error');
    }
  }, []);

  const stopSession = useCallback(() => {
    cleanup();
    setState('idle');
  }, [cleanup]);

  const sendPrompt = useCallback((prompt: string, referenceImageUrl?: string) => {
    if (!connectionRef.current) return;
    connectionRef.current.send({
      prompt,
      enable_prompt_expansion: true,
      ...(referenceImageUrl ? { reference_image_url: referenceImageUrl } : {}),
    });
  }, []);

  const flipCamera = useCallback(async () => {
    const next = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = next;
    if (!localStreamRef.current) return;
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 720, height: 720, facingMode: next },
      audio: false,
    });
    const oldTrack = localStreamRef.current.getVideoTracks()[0];
    const newTrack = newStream.getVideoTracks()[0];
    if (pcRef.current) {
      const sender = pcRef.current.getSenders().find((s) => s.track === oldTrack);
      if (sender) await sender.replaceTrack(newTrack);
    }
    localStreamRef.current.removeTrack(oldTrack);
    localStreamRef.current.addTrack(newTrack);
    oldTrack.stop();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, []);

  return {
    state,
    error,
    elapsed,
    startSession,
    stopSession,
    sendPrompt,
    flipCamera,
    localVideoRef,
    remoteVideoRef,
  };
}
