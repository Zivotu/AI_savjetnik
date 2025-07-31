export class EviWebAudioPlayer {
  private context = new AudioContext();
  private queue: ArrayBuffer[] = [];
  private current: AudioBufferSourceNode | null = null;

  enqueueBase64(data: string) {
    const buf = Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer;
    this.queue.push(buf);
    if (!this.current) this.playNext();
  }

  stop() {
    this.queue = [];
    if (this.current) {
      try {
        this.current.stop();
      } catch {
        /* empty */
      }
      this.current.disconnect();
      this.current = null;
    }
  }

  private async playNext() {
    if (!this.queue.length) {
      this.current = null;
      return;
    }
    const raw = this.queue.shift() as ArrayBuffer;
    const audioBuf = await this.context.decodeAudioData(raw.slice(0));
    const src = this.context.createBufferSource();
    src.buffer = audioBuf;
    src.connect(this.context.destination);
    src.onended = () => {
      this.current = null;
      this.playNext();
    };
    this.current = src;
    src.start();
  }
}
