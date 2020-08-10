const audio_output = {
  html: `
    <div class="interface_box">
      <div class="player hidden">
        <div class="waveform"></div>
        <button class="playpause primary">Play / Pause</button>
      </div>
    </div
    `,
  state: "NO_AUDIO",
  init: function(opts) {
    var io = this;
    this.wavesurfer = WaveSurfer.create({
      container: io.target.find('.waveform')[0],
      waveColor: '#888888',
      progressColor: '#e67e22',
      barWidth: 3,
      hideScrollbar: true
    });
    this.target.find(".playpause").click(function () {
      io.wavesurfer.playPause();
    })
  },
  output: function(data) {
    io.target.find(".player").removeClass("hidden");
    this.wavesurfer.load(data);
  },
  clear: function() {
    this.target.find(".player").addClass("hidden");
    if (this.wavesurfer) {
      this.wavesurfer.stop();
    }
  }
}
