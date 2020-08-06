const audio_input = {
  html: `
    <div class="interface_box">
      <div class="file_zone">
        <div class="upload_zone drop_zone">
          <div class="input_caption">Drop Audio Here<br>- or -<br>Click to Upload</div>
        </div>
        <div class="file_display hide">
          <div class="file_name"></div>
          <div class="file_size"></div>
        </div>
        <input class="hidden_upload" type="file" />
      </div>
      <div class="upload_zone mic_zone">
        <img class="not_recording" src="/static/img/mic.png" />
        <div class="recording hidden volume_display">
          <div class="volume volume_left">
            <div class="volume_bar"></div>
          </div>
          <img src="/static/img/mic_recording.png" />
          <div class="volume volume_right">
            <div class="volume_bar"></div>
          </div>
        </div>
        <div class="not_recording input_caption">Click to Record from Microphone</div>
        <div class="recording hidden input_caption">Click to Stop Recording</div>
      </div>
      <div class="player hidden">
        <div class="waveform"></div>
        <button class="playpause primary">Play / Pause</button>
      </div>
    </div>
    `,
  state: "NO_AUDIO",
  init: function(opts) {
    var io = this;
    this.source = opts.source;
    this.wavesurfer = WaveSurfer.create({
      container: io.target.find('.waveform')[0],
      waveColor: '#888888',
      progressColor: '#e67e22',
      barWidth: 3,
      hideScrollbar: true
    });
    if (this.source == "microphone") {
      this.target.find(".file_zone").hide();
      this.target.find(".mic_zone").click(function() {
        if (io.state == "NO_AUDIO") {
          if (!has_audio_loaded) {
            loadAudio();
            io.mic = new p5.AudioIn();
          }
          io.recorder = new p5.SoundRecorder();
          io.soundFile = new p5.SoundFile();
          io.recorder.setInput(io.mic);
          io.target.find(".recording").removeClass("hidden");
          io.target.find(".not_recording").hide();
          io.state = "RECORDING";
          io.mic.start();
          io.recorder.record(io.soundFile);

          io.interval_id = window.setInterval(function () {
            var volume = Math.floor(100 * io.mic.getLevel());
            io.target.find(".volume_bar").width(`${(volume > 0 ? 10 : 0) + Math.round(2 * Math.sqrt(10 * volume))}px`)
          }, 100)
        }
      });

      this.target.find(".mic_zone").mousedown(function() {
        if (io.state == "RECORDING" || io.state == "STOP_RECORDING") {
          io.target.find(".upload_zone").hide();
          io.recorder.stop();
          var blob = io.soundFile.getBlob();
          var reader = new window.FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function() {
            console.log(reader.result)
            io.audio_data = reader.result;
            io.target.find(".player").removeClass("hidden");
            io.wavesurfer.load(io.audio_data);
            if (io.state == "STOP_RECORDING") {
              io.state = "RECORDED";
              io.submit();
            }
            io.state = "RECORDED";
          }
          if (io.interval_id) {
            window.clearInterval(io.interval_id);
          }
        }
      })
    } else if (self.type == "upload") {
      this.target.find(".mic_zone").hide();

    }
    this.target.find(".playpause").click(function () {
      io.wavesurfer.playPause();
    })
  },
  submit: function() {
    if (this.state == "RECORDED") {
      this.io_master.input(this.id, this.audio_data);
    } else if (this.state == "RECORDING") {
      this.state = "STOP_RECORDING";
      this.target.find(".upload_zone").mousedown();
    }
  },
  clear: function() {
    this.audio_data = null;
    this.state = "NO_AUDIO";
    this.target.find(".not_recording").show();
    this.target.find(".recording").addClass("hidden");
    this.target.find(".player").addClass("hidden");
    this.target.find(".upload_zone").show();
    if (this.wavesurfer) {
      this.wavesurfer.stop();
    }
  }
}
