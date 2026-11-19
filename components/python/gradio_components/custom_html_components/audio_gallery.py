import gradio as gr


class AudioGallery(gr.HTML):
    def __init__(
        self,
        audio_urls: list[str],
        *,
        value: str | None = None,
        labels: list[str] | None = None,
        columns: int = 3,
        label: str | None = None,
        **kwargs,
    ):
        self.audio_urls = audio_urls

        html_template = """
        <div class="audio-gallery-container">
            ${label ? `<label class="container-label">${label}</label>` : ''}
            <div class="audio-gallery-grid" style="grid-template-columns: repeat(${columns}, 1fr);">
                ${audio_urls.map((url, i) => `
                    <div class="audio-item" data-index="${i}">
                        <div class="audio-label">${labels && labels[i] ? labels[i] : 'Audio ' + (i + 1)}</div>
                        <canvas class="waveform-canvas" data-url="${url}" width="300" height="80"></canvas>
                        <audio src="${url}" preload="metadata" ${value === url ? 'data-selected="true"' : ''}></audio>
                        <div class="audio-controls">
                            <button class="play-btn">▶</button>
                            <div class="time-display">0:00</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        """

        css_template = """
        .audio-gallery-container { padding: var(--spacing-lg); }
        .container-label { display: block; margin-bottom: var(--spacing-md); font-weight: 600; }
        .audio-gallery-grid { display: grid; gap: var(--spacing-lg); }
        .audio-item { border: 2px solid var(--border-color-primary); border-radius: var(--radius-md); padding: var(--spacing-md); cursor: pointer; transition: all 0.2s; }
        .audio-item:hover { border-color: var(--color-accent); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .audio-item[data-selected="true"] { border-color: var(--color-accent); background-color: var(--background-fill-secondary); }
        .audio-label { margin-bottom: 8px; text-align: center; }
        .waveform-canvas { width: 100%; height: 80px; background: var(--background-fill-secondary); margin-bottom: 8px; }
        .audio-controls { display: flex; align-items: center; gap: 8px; }
        .play-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--color-accent); color: white; cursor: pointer; }
        .play-btn:hover { opacity: 0.8; }
        .time-display { font-size: 12px; }
        """

        js_on_load = """
        const audioItems = element.querySelectorAll('.audio-item');

        audioItems.forEach((item, index) => {
            const canvas = item.querySelector('.waveform-canvas');
            const audio = item.querySelector('audio');
            const playBtn = item.querySelector('.play-btn');
            const timeDisplay = item.querySelector('.time-display');
            const ctx = canvas.getContext('2d');

            drawWaveform(canvas, ctx);

            item.addEventListener('click', (e) => {
                if (e.target === playBtn) return;
                audioItems.forEach(i => i.removeAttribute('data-selected'));
                item.setAttribute('data-selected', 'true');
                props.value = audio.src;
            });

            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (audio.paused) {
                    document.querySelectorAll('.audio-item audio').forEach(a => a.pause());
                    document.querySelectorAll('.play-btn').forEach(b => b.textContent = '▶');
                    audio.play();
                    playBtn.textContent = '⏸';
                } else {
                    audio.pause();
                    playBtn.textContent = '▶';
                }
            });

            audio.addEventListener('timeupdate', () => {
                const currentTime = Math.floor(audio.currentTime);
                const minutes = Math.floor(currentTime / 60);
                const seconds = currentTime % 60;
                timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                const progress = audio.currentTime / audio.duration;
                drawWaveform(canvas, ctx, progress);
            });

            audio.addEventListener('ended', () => {
                playBtn.textContent = '▶';
                drawWaveform(canvas, ctx, 0);
            });
        });

        function drawWaveform(canvas, ctx, progress = 0) {
            const width = canvas.width;
            const height = canvas.height;
            const bars = 50;
            const barWidth = width / bars;

            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < bars; i++) {
                const barHeight = (Math.sin(i * 0.5) * 0.3 + Math.random() * 0.7) * height * 0.8;
                const x = i * barWidth;
                const y = (height - barHeight) / 2;

                ctx.fillStyle = i / bars < progress ? '#FF7C00' : '#ccc';
                ctx.fillRect(x, y, barWidth - 2, barHeight);
            }
        }
        """

        super().__init__(
            value=value or (audio_urls[0] if audio_urls else None),
            html_template=html_template,
            css_template=css_template,
            js_on_load=js_on_load,
            audio_urls=audio_urls,
            labels=labels,
            columns=columns,
            label=label,
            apply_default_css=False,
            **kwargs,
        )

    def api_info(self):
        return {
            "type": "string",
            "title": "Audio URL",
        }


if __name__ == "__main__":
    with gr.Blocks() as demo:
        gr.Markdown("# Audio Gallery Demo")

        gallery = AudioGallery(
            audio_urls=[
                "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav",
                "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample-1-4.wav",
                "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/audio/cantina.wav",
                "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/audio/recording1.wav",
                "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/audio/heath_ledger.mp3",
                "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/audio/cate_blanch.mp3",
            ],
            labels=[
                "Sample 1",
                "Sample 2",
                "Cantina",
                "Recording",
                "Heath Ledger",
                "Cate Blanchett",
            ],
            columns=3,
            label="Select an audio file",
        )

        output = gr.Textbox(label="Selected Audio URL")

        gr.Interface(
            fn=lambda x: x,
            inputs=gallery,
            outputs=output,
        )

    demo.launch()
