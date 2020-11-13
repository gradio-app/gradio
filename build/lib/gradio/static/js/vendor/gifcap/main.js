const FPS = 10;
const FRAME_DELAY = Math.floor(1000 / FPS);

function timediff(millis) {
  const abs = Math.floor(millis / 1000);
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  const s = `${secs < 10 ? '0' : ''}${secs}`;
  const m = mins > 0 ? `${mins < 10 ? '0' : ''}${mins}` : '00';
  return `${m}:${s}`;
}

function humanSize(size) {
  if (size < 1024) {
    return '1 KB';
  }

  size = Math.round(size / 1024);
  return size < 1024 ? `${size} KB` : `${Math.floor(size / 1024 * 100) / 100} MB`;
}

function getFrameIndex(frames, timestamp, start = 0, end = frames.length - 1) {
  const gap = end - start;

  if (gap === 0) {
    return start;
  } else if (gap === 1) {
    return timestamp < frames[end].timestamp ? start : end;
  }

  const mid = Math.floor((end + start) / 2);
  const midTimestamp = frames[mid].timestamp;

  if (timestamp === midTimestamp) {
    return mid;
  }

  return timestamp < midTimestamp ? getFrameIndex(frames, timestamp, start, mid) : getFrameIndex(frames, timestamp, mid, end);
}

const Button = {
  view(vnode) {
    if (vnode.attrs.a) {
      return m('a', {
        class: `button ${vnode.attrs.primary ? 'primary' : 'secondary'} ${vnode.attrs.label ? '' : 'icon-only'} ${vnode.attrs.outline ? 'outline' : ''}`,
        ...vnode.attrs.a,
      }, [
        m('img', { src: `https://icongr.am/${vnode.attrs.iconset || 'octicons'}/${vnode.attrs.icon}.svg?size=16&color=${vnode.attrs.outline ? '333333' : 'ffffff'}` }),
        vnode.attrs.label
      ]);
    } else {
      return m('button', {
        class: `button ${vnode.attrs.primary ? 'primary' : 'secondary'} ${vnode.attrs.label ? '' : 'icon-only'} ${vnode.attrs.outline ? 'outline' : ''}`,
        onclick: vnode.attrs.onclick,
        title: vnode.attrs.title || vnode.attrs.label,
        disabled: vnode.attrs.disabled
      }, [
        m('img', { src: `https://icongr.am/${vnode.attrs.iconset || 'octicons'}/${vnode.attrs.icon}.svg?size=16&color=${vnode.attrs.outline ? '333333' : 'ffffff'}` }),
        vnode.attrs.label
      ]);
    }
  }
};

const Timer = {
  view(vnode) {
    return m('span.tag.is-small', [
      m('img', { src: 'https://icongr.am/octicons/clock.svg?size=16&color=333333' }),
      timediff(vnode.attrs.duration)
    ]);
  }
};

const View = {
  view(vnode) {
    return m('section', { class: 'view' }, [
      m('section', { class: `content ${vnode.attrs.contentClass || ''}`, ...(vnode.attrs.contentProps || {}) }, vnode.children),
      m('section', { class: 'actions' }, vnode.attrs.actions)
    ]);
  }
};


const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

class IdleView {

  constructor(vnode) {
    this.app = vnode.attrs.app;
  }

  view() {
    let content, actions;

    if (this.app.gif) {
      content = m('.recording-card', [
        m('a', { href: this.app.gif.url, download: 'recording.gif', target: '_blank' }, [
          m('img.recording', { src: this.app.gif.url })
        ]),
        m('footer', [
          m(Timer, { duration: this.app.gif.duration }),
          m('span.tag.is-small', [
            m('a.recording-detail', { href: this.app.gif.url, download: 'recording.gif', target: '_blank' }, [
              m('img', { src: 'https://icongr.am/octicons/download.svg?size=16&color=333333' }),
              humanSize(this.app.gif.size)
            ])
          ]),
        ]),
      ]);

      actions = [
        m(Button, { label: 'Download', icon: 'download', a: { href: this.app.gif.url, download: 'recording.gif', target: '_blank' }, primary: true }),
        m(Button, { label: 'Edit', icon: 'pencil', onclick: () => this.app.editGif() }),
        m(Button, { label: 'Discard', icon: 'trashcan', onclick: () => this.app.discardGif() })
      ];
    } else {
      content = [
        m('p', 'Create animated GIFs from a screen recording.'),
        m('p', 'Client-side only, no data is uploaded. Modern browser required.'),
        isMobile ? m('p', 'Sorry, mobile does not support screen recording.') : undefined,
        isMobile ? undefined : m(Button, { label: 'Start Recording', icon: 'play', onclick: () => this.app.startRecording(), primary: true }),
      ];
    }

    return [m(View, { actions }, content)];
  }
}

class RecordView {

  constructor(vnode) {
    this.app = vnode.attrs.app;
    this.recording = this.app.recording;
    this.startTime = undefined;
  }

  async oncreate(vnode) {
    const video = vnode.dom.getElementsByTagName('video')[0];
    const canvas = vnode.dom.getElementsByTagName('canvas')[0];

    video.srcObject = this.recording.captureStream;

    const ctx = canvas.getContext('2d');

    const worker = new Worker('ticker.js');
    worker.onmessage = () => {
      if (video.videoWidth === 0) {
        return;
      }

      const first = this.startTime === undefined;

      if (first) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        this.startTime = Date.now();
        this.recording.width = width;
        this.recording.height = height;
        canvas.width = `${width}`;
        canvas.height = `${height}`;
      }

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, this.recording.width, this.recording.height);

      this.recording.frames.push({
        imageData,
        timestamp: first ? 0 : Date.now() - this.startTime
      });
    };

    const redrawInterval = setInterval(() => m.redraw(), 100);

    const track = this.recording.captureStream.getVideoTracks()[0];
    const endedListener = () => {
      this.app.stopRecording();
      m.redraw();
    };
    track.addEventListener('ended', endedListener);

    this.onbeforeremove = () => {
      worker.terminate();
      clearInterval(redrawInterval);
      track.removeEventListener('ended', endedListener);
      track.stop();

      this.recording.duration = this.recording.frames[this.recording.frames.length - 1].timestamp + FRAME_DELAY;
    };

    m.redraw();
  }

  view() {
    return [
      m(View, [
        m('p', [
          m(Timer, { duration: this.startTime === undefined ? 0 : Date.now() - this.startTime }),
        ]),
        m(Button, { label: 'Stop Recording', icon: 'square-fill', onclick: () => this.app.stopRecording() }),
        m('canvas.hidden', { width: 640, height: 480 }),
        m('video.hidden', { autoplay: true, playsinline: true }),
      ]),
    ];
  }
}

class PreviewView {

  constructor(vnode) {
    this.app = vnode.attrs.app;
    this.recording = this.app.recording;
    this.canvas = undefined;
    this.playbar = undefined;
    this.content = undefined;

    this.viewportDisposable = undefined;
    this.viewport = {
      width: undefined,
      height: undefined,
      top: 0,
      left: 0,
      zoom: 1
    };

    this.playback = {
      head: 0,
      start: 0,
      end: this.recording.duration,
      disposable: undefined
    };

    this.trim = {
      start: 0,
      end: this.recording.duration
    };

    this.crop = {
      top: 0,
      left: 0,
      width: this.recording.width,
      height: this.recording.height
    };
  }

  get isPlaying() { return !!this.playback.disposable; }

  oncreate(vnode) {
    this.canvas = vnode.dom.getElementsByTagName('canvas')[0];
    this.playbar = vnode.dom.querySelector('.playbar');
    this.content = vnode.dom.querySelector('.content');

    const viewportListener = () => this.updateViewport();
    window.addEventListener('resize', viewportListener);
    this.viewportDisposable = () => window.removeEventListener('resize', viewportListener);
    this.updateViewport();
    this.zoomToFit();

    m.redraw(); // prevent flickering
    setTimeout(() => this.play());
  }

  zoomToFit() {
    this.viewport.zoom = Math.max(0.1, Math.min(1, this.viewport.width * .95 / this.recording.width, this.viewport.height * .95 / this.recording.height));
  }

  updateViewport() {
    this.viewport.width = Math.floor(this.content.clientWidth);
    this.viewport.height = Math.floor(this.content.clientHeight);
  }

  onbeforeremove() {
    this.pause();
    this.viewportDisposable();
  }

  view() {
    const isCropped = this.crop.top !== 0 || this.crop.left !== 0 || this.crop.width !== this.recording.width || this.crop.height !== this.recording.height;
    const actions = [
      m(Button, { title: this.isPlaying ? 'Pause' : 'Play', iconset: 'material', icon: this.isPlaying ? 'pause' : 'play', primary: true, onclick: () => this.togglePlayPause() }),
      m('.playbar', [
        m('input', { type: 'range', min: 0, max: `${this.recording.duration}`, value: `${this.playback.head}`, disabled: this.isPlaying, oninput: e => this.onPlaybarInput(e) }),
        m('.trim-bar', { style: { left: `${this.trim.start * 100 / this.recording.duration}%`, width: `${(this.trim.end - this.trim.start) * 100 / this.recording.duration}%` } }, [
          m('.trim-start', { onmousedown: e => this.onTrimMouseDown('start', e) }),
          m('.trim-end', { onmousedown: e => this.onTrimMouseDown('end', e) }),
        ])
      ]),
      m(Button, { label: 'Render', icon: 'gear', onclick: () => this.app.startRendering({ trim: this.trim, crop: this.crop }), primary: true }),
      m(Button, { title: 'Discard', icon: 'trashcan', onclick: () => this.app.discardGif() }),
    ];

    const scale = value => value * this.viewport.zoom;
    const width = scale(this.recording.width);
    const height = scale(this.recording.height);
    const top = Math.floor(scale(this.viewport.top) + (this.viewport.height / 2) - (height / 2));
    const left = Math.floor(scale(this.viewport.left) + (this.viewport.width / 2) - (width / 2));

    return [
      m(View, {
        actions,
        contentClass: 'crop',
        contentProps: {
          onwheel: e => this.onContentWheel(e),
          onmousedown: e => this.onContentMouseDown(e),
          oncontextmenu: e => e.preventDefault()
        }
      }, [
        m('.preview', { style: { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` } }, [
          m('canvas', { width: this.recording.width, height: this.recording.height }),
          isCropped && m('.crop-box', {
            style: {
              // here be dragons!
              clipPath: `polygon(evenodd, 0 0, 0 ${scale(this.recording.height)}px, ${scale(this.recording.width)}% ${scale(this.recording.height)}px, ${scale(this.recording.width)}% 0, 0 0, ${scale(this.crop.left)}px ${scale(this.crop.top)}px, ${scale(this.crop.left)}px ${scale(this.crop.top + this.crop.height)}px, ${scale(this.crop.left + this.crop.width)}px ${scale(this.crop.top + this.crop.height)}px, ${scale(this.crop.left + this.crop.width)}px ${scale(this.crop.top)}px, ${scale(this.crop.left)}px ${scale(this.crop.top)}px)`
            }
          })
        ]),
      ])
    ];
  }

  onTrimMouseDown(handle, event) {
    event.preventDefault();

    const ctx = this.canvas.getContext('2d');
    const start = {
      width: this.playbar.clientWidth,
      screenX: event.screenX,
      head: handle === 'start' ? this.trim.start : this.trim.end,
      min: handle === 'start' ? 0 : this.trim.start + FRAME_DELAY,
      max: handle === 'start' ? this.trim.end - FRAME_DELAY : this.recording.duration
    };

    const onMouseMove = e => {
      const diff = e.screenX - start.screenX;
      const head = start.head + Math.round(diff * this.recording.duration / start.width);
      this.trim[handle] = Math.max(start.min, Math.min(start.max, head));

      m.redraw();
    };

    const onMouseUp = () => {
      document.body.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseup', onMouseUp);

      this.playback.start = this.trim.start;
      this.playback.end = this.trim.end;

      if (this.isPlaying) {
        this.playback.head = Math.max(this.playback.start, Math.min(this.playback.end, this.playback.head));
        this.playback.offset = Date.now() - this.playback.head + this.playback.start;

        const index = getFrameIndex(this.recording.frames, this.playback.head);
        ctx.putImageData(this.recording.frames[index].imageData, 0, 0);
      }

      m.redraw();
    };

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp);
  }

  onContentWheel(event) {
    event.preventDefault();
    const zoom = this.viewport.zoom - event.deltaY / 180 * 0.1;
    this.viewport.zoom = Math.max(0.1, Math.min(2, zoom));
  }

  onContentMouseDown(event) {
    if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      this.onCrop(event);
    } else {
      this.onViewportMove(event);
    }
  }

  onCrop(event) {
    const width = this.recording.width * this.viewport.zoom;
    const height = this.recording.height * this.viewport.zoom;
    const top = Math.floor(this.viewport.top * this.viewport.zoom + (this.viewport.height / 2) - (height / 2));
    const left = Math.floor(this.viewport.left * this.viewport.zoom + (this.viewport.width / 2) - (width / 2));
    const offsetTop = event.currentTarget.offsetTop;
    const offsetLeft = event.currentTarget.offsetLeft;
    const mouseTop = event => Math.max(0, Math.min(this.recording.height, (event.clientY - offsetTop - top) / this.viewport.zoom));
    const mouseLeft = event => Math.max(0, Math.min(this.recording.width, (event.clientX - offsetLeft - left) / this.viewport.zoom));
    const point = event => ({ top: Math.round(mouseTop(event)), left: Math.round(mouseLeft(event)) });
    const from = point(event);

    let didMove = false;
    const onMouseMove = event => {
      const to = point(event);
      const top = Math.max(0, Math.min(from.top, to.top));
      const left = Math.max(0, Math.min(from.left, to.left));
      const width = Math.min(this.recording.width - left, Math.abs(from.left - to.left));
      const height = Math.min(this.recording.height - top, Math.abs(from.top - to.top));

      this.crop = { top, left, width, height };
      didMove = true;
      m.redraw();
    };

    const onMouseUp = event => {
      event.preventDefault();
      document.body.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseup', onMouseUp);

      if (!didMove || this.crop.width < 10 || this.crop.height < 10) {
        this.crop = {
          top: 0,
          left: 0,
          width: this.recording.width,
          height: this.recording.height
        };
      }

      m.redraw();
    };

    event.preventDefault();
    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp);
  }

  onViewportMove(event) {
    const start = {
      top: this.viewport.top,
      left: this.viewport.left,
      screenX: event.screenX,
      screenY: event.screenY
    };

    const onMouseMove = e => {
      this.viewport.top = start.top + (e.screenY - start.screenY) / this.viewport.zoom;
      this.viewport.left = start.left + (e.screenX - start.screenX) / this.viewport.zoom;
      m.redraw();
    };

    const onMouseUp = event => {
      event.preventDefault();
      document.body.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseup', onMouseUp);
      m.redraw();
    };

    event.preventDefault();
    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp);
  }

  onPlaybarInput(e) {
    this.playback.head = e.target.valueAsNumber;

    const ctx = this.canvas.getContext('2d');
    const index = getFrameIndex(this.recording.frames, this.playback.head);
    ctx.putImageData(this.recording.frames[index].imageData, 0, 0);
  }

  play() {
    if (this.playback.disposable) {
      this.playback.disposable();
    }

    const ctx = this.canvas.getContext('2d');

    let lastIndex = undefined;
    let animationFrame = undefined;

    this.playback.head = Math.max(this.playback.start, Math.min(this.playback.end, this.playback.head));
    this.playback.offset = Date.now() - this.playback.head + this.playback.start;

    const draw = () => {
      this.playback.head = this.playback.start + (Date.now() - this.playback.offset) % (this.playback.end - this.playback.start);

      const index = getFrameIndex(this.recording.frames, this.playback.head);

      if (lastIndex !== index) {
        ctx.putImageData(this.recording.frames[index].imageData, 0, 0);
      }

      lastIndex = index;
      m.redraw();
      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    this.playback.disposable = () => {
      cancelAnimationFrame(animationFrame);
    };
  }

  pause() {
    if (this.playback.disposable) {
      this.playback.disposable();
      this.playback.disposable = undefined;
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
}

class RenderView {

  constructor(vnode) {
    this.app = vnode.attrs.app;
    this.recording = this.app.recording;
    this.trim = this.app.renderOptions.trim;
    this.crop = this.app.renderOptions.crop;
    this.progress = 0;
  }

  async oncreate(vnode) {
    const gif = new GifEncoder({
      width: this.crop.width,
      height: this.crop.height,
    });

    gif.on('progress', progress => {
      this.progress = progress;
      m.redraw();
    });

    gif.once('finished', blob => {
      this.app.setRenderedRecording({
        duration: this.trim.end - this.trim.start,
        size: blob.size,
        blob,
        url: URL.createObjectURL(blob),
      });
      m.redraw();
    });

    const ctx = vnode.dom.getElementsByTagName('canvas')[0].getContext('2d');
    const start = getFrameIndex(this.recording.frames, this.trim.start);
    const end = getFrameIndex(this.recording.frames, this.trim.end);

    const processFrame = index => {
      if (index > end) {
        this.onbeforeremove = () => gif.abort();
        gif.render();
        return;
      }

      let { imageData, timestamp } = this.recording.frames[index];

      // we always copy the imagedata, because the user might want to
      // go back to edit, and we can't afford to lose frames which
      // were moved to web workers
      ctx.putImageData(imageData, 0, 0);
      imageData = ctx.getImageData(this.crop.left, this.crop.top, this.crop.width, this.crop.height);

      const delay = index < end ? this.recording.frames[index + 1].timestamp - timestamp : 100;
      gif.addFrame(imageData, delay);
      setTimeout(() => processFrame(index + 1), 0);
    };

    processFrame(start);
  }

  view() {
    const actions = [
      m(Button, { label: 'Cancel', icon: 'square-fill', onclick: () => this.app.cancelRendering() })
    ];

    return [
      m(View, { actions }, [
        m('progress', { max: '1', value: this.progress, title: 'Rendering...' }, `Rendering: ${Math.floor(this.progress * 100)}%`),
        m('canvas.hidden', { width: this.recording.width, height: this.recording.height }),
      ])
    ];
  }
}

class App {

  constructor() {
    this.state = 'idle';
    this.recording = undefined;
    window.onbeforeunload = () => this.recording ? '' : null;
  }

  view() {
    return m('section', { id: 'app', class: this.state === 'idle' && !this.recording ? 'home' : '' }, [
      m('section', { id: 'app-body' }, [
        m('h1', [
          m('span', { class: 'gif' }, 'gif'),
          m('span', { class: 'cap' }, 'cap'),
        ]),
        this.body()
      ]),
      m('footer', { id: 'app-footer' }, [
        m('span.left', [
          m('a', { href: 'https://github.com/joaomoreno/gifcap' }, [
            m('img', { alt: 'GitHub', src: 'https://icongr.am/octicons/mark-github.svg?size=18&color=9e9e9e' }),
            ' joaomoreno/gifcap'
          ]),
        ]),
        m('span', [
          m('a', { title: 'Feel free to buy me a cup of coffee with Bitcoin.', href: 'bitcoin:356S2FBHDwBUjki72KoForZ8YgYf4z3pFa?label=gifcap&message=Thanks%20for%20making%20gifcap!' }, [
            m('img', { alt: 'GitHub', src: 'https://icongr.am/material/coffee.svg?size=18&color=9e9e9e' }),
            ' 356S2FBHDwBUjki72KoForZ8YgYf4z3pFa'
          ]),
        ]),
        m('span.right', [
          'Made with ',
          m('img', { alt: 'love', src: 'https://icongr.am/octicons/heart.svg?size=18&color=9e9e9e' }),
          ' by ',
          m('a', { href: 'https://github.com/joaomoreno' }, ['João Moreno']),
        ])
      ])
    ]);
  }

  body() {
    switch (this.state) {
      case 'idle': return m(IdleView, { app: this });
      case 'recording': return m(RecordView, { app: this });
      case 'preview': return m(PreviewView, { app: this });
      case 'rendering': return m(RenderView, { app: this });
    }
  }

  async startRecording() {
    if (this.recording && !window.confirm('This will discard the current recording, are you sure you want to continue?')) {
      return;
    }

    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({ video: { width: 9999, height: 9999 } });

      this.state = 'recording';
      this.recording = {
        captureStream,
        width: undefined,
        height: undefined,
        frames: []
      };
      m.redraw.sync();
    } catch (err) {
      console.error(err);
      return;
    }
  }

  stopRecording() {
    this.state = 'preview';
  }

  startRendering(renderOptions) {
    this.state = 'rendering';
    this.renderOptions = renderOptions;
  }

  setRenderedRecording(recording) {
    this.state = 'idle';
    this.gif = recording;
    this.renderOptions = undefined;
  }

  cancelRendering() {
    this.state = 'preview';
    this.renderOptions = undefined;
  }

  editGif() {
    this.state = 'preview';
    this.gif = undefined;
  }

  discardGif() {
    this.state = 'idle';
    this.gif = undefined;
    this.recording = undefined;
  }
}

function main() {
  m.mount(document.getElementById('app-container'), App);
}

main();
