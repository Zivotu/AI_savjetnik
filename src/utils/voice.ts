export type STTCallback = (text: string) => void;

export function startSttStream(onText: STTCallback) {
  const wsUrl =
    (window.location.protocol === "https:" ? "wss://" : "ws://") +
    window.location.host +
    "/api/stt";
  const ws = new WebSocket(wsUrl);


  ws.addEventListener("open", async () => {
    // getUserMedia → MediaRecorder chunks → send ArrayBuffer
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    recorder.addEventListener("dataavailable", (e) => {
      if (e.data && e.data.size > 0) e.data.arrayBuffer().then(buf => ws.send(buf));
    });
    recorder.start(250); // every 250 ms
  });

  ws.addEventListener("message", (e) => {
    const data = JSON.parse(e.data as string);
    if (data.transcript) {
      onText(data.transcript);
      if (data.stop) ws.close();
    }
  });

  return () => ws.close();
}
