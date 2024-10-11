interface AudioEventListeners {
  [key: string]: Array<(...args: any[]) => void>;
}

export default class AudioElementWrapper {
  private audio: HTMLAudioElement;
  private isReady: boolean;
  private volume: number;
  private playbackRate: number;
  private listeners: AudioEventListeners;

  constructor(audioElement: HTMLAudioElement) {
    this.audio = audioElement;
    this.isReady = false;
    this.volume = 1;
    this.playbackRate = 1;
    this.listeners = {};

    this.audio.addEventListener('loadedmetadata', () => {
      this.isReady = true;
      this.fireEvent('ready');
    });

    this.audio.addEventListener('timeupdate', () => {
      this.fireEvent('audioprocess', this.getCurrentTime());
    });

    this.audio.addEventListener('ended', () => {
      this.fireEvent('finish');
    });

    this.audio.addEventListener('play', () => {
      this.fireEvent('play');
    });

    this.audio.addEventListener('pause', () => {
      this.fireEvent('pause');
    });
  }

  load(url: string): Promise<void> {
    this.audio.src = url;
    this.audio.load();
    return new Promise((resolve) => {
      this.audio.oncanplaythrough = () => resolve();
    });
  }

  play(): Promise<void> {
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  skip(duration: number): void {
    this.audio.currentTime += duration;
  }

  setVolume(newVolume: number): void {
    this.volume = newVolume;
    this.audio.volume = newVolume;
  }

  getVolume(): number {
    return this.volume;
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    this.audio.playbackRate = rate;
  }

  getPlaybackRate(): number {
    return this.playbackRate;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration;
  }

  seekTo(time: number): void {
    this.audio.currentTime = time;
  }

  playPause(): void {
    console.log("calling playPause")
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  un(event: string, callback: (...args: any[]) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  fireEvent(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }

  destroy(): void {
    this.stop();
    this.audio.src = '';
    this.listeners = {};
  }
}