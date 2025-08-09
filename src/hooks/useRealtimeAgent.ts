import { useRef } from "react";

interface Message {
  source: 'user' | 'assistant';
  message: string;
}

interface Options {
  onMessage?: (m: Message) => void;
  onConnect?: () => void;
  onError?: (err: unknown) => void;
}

export function useRealtimeAgent({ onMessage, onConnect, onError }: Options) {
  const pcRef = useRef<RTCPeerConnection>();
  const dcRef = useRef<RTCDataChannel>();
  const micRef = useRef<MediaStreamTrack>();

  async function startSession() {
    try {
      const tokenRes = await fetch('/api/realtime/session', { method: 'POST' });
      const token = await tokenRes.json();
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const dc = pc.createDataChannel('oai-events');
      dc.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === 'response.output_text.delta') {
            onMessage?.({ source: 'assistant', message: data.delta });
          }
        } catch {
          /* ignore */
        }
      };
      dcRef.current = dc;
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') onConnect?.();
      };
      pc.ontrack = (e) => {
        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = e.streams[0];
      };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = stream.getTracks()[0];
      pc.addTrack(micRef.current, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const res = await fetch(token.data.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.data.client_secret.value}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      const answer = { type: 'answer', sdp: await res.text() };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      onError?.(err);
    }
  }

  function stopSession() {
    pcRef.current?.close();
    micRef.current?.stop();
  }

  function sendUserMessage(text: string) {
    dcRef.current?.send(
      JSON.stringify({ type: 'input_text', text })
    );
  }

  function sendUserActivity() {
    dcRef.current?.send(JSON.stringify({ type: 'user_event' }));
  }

  function mute() {
    if (micRef.current) micRef.current.enabled = false;
  }

  function unmute() {
    if (micRef.current) micRef.current.enabled = true;
  }

  return { startSession, stopSession, sendUserMessage, sendUserActivity, mute, unmute };
}
