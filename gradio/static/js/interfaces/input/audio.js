const audio_input = {
  html: `
    <div class="interface_box">
      <div class="file_zone hidden">
        <div class="upload_zone drop_zone">
          <div class="input_caption">Drop Audio Here<br>- or -<br>Click to Upload</div>
        </div>
        <div class="file_display hide">
          <div class="file_name"></div>
          <div class="file_size"></div>
        </div>
        <input class="hidden_upload" type="file" accept="audio/*" />
      </div>
      <div class="upload_zone mic_zone hidden">
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
        <div class="interpret_range"></div>
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
      this.target.find(".mic_zone").removeClass("hidden");
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
          io.recorder.stop();
          var blob = io.soundFile.getBlob();
          var reader = new window.FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function() {
            io.load_preview_from_audio(reader.result);
          }
          if (io.interval_id) {
            window.clearInterval(io.interval_id);
          }
        }
      })
    } else if (this.source == "upload") {
      this.target.find(".file_zone").removeClass("hidden");
      this.target.find(".upload_zone").click(function (e) {
        io.target.find(".hidden_upload").click();
      });
      this.target.on('drag dragstart dragend dragover dragenter dragleave drop',
          ".drop_zone", function(e) {
        e.preventDefault();
        e.stopPropagation();
      })
      this.target.on('drop', '.drop_zone', function(e) {
        files = e.originalEvent.dataTransfer.files;
        io.load_preview_from_files(files)
      });
      this.target.find('.hidden_upload').on('change', function (e) {
        if (this.files) {
          io.load_preview_from_files(this.files);
        }
      })
    }
    this.target.find(".playpause").click(function () {
      io.wavesurfer.playPause();
    })
  },
  load_preview_from_audio: function(audio) {
    var io = this;
    io.audio_data = audio;
    io.target.find(".upload_zone").hide();
    io.target.find(".player").removeClass("hidden");
    io.wavesurfer.load(io.audio_data);
    if (io.state == "STOP_RECORDING") {
      io.state = "RECORDED";
      io.submit();
    }
    io.state = "RECORDED";
  },
  load_preview_from_files: function(files) {
    if (!files.length || !window.FileReader) {
      return
    }
    var ReaderObj = new FileReader()
    ReaderObj.readAsDataURL(files[0])
    io = this;
    this.state = "AUDIO_LOADING"
    ReaderObj.onloadend = function() {
      io.load_preview_from_audio(this.result);
    }
  },
  submit: function() {
    if (this.state == "RECORDED") {
      this.io_master.input(this.id, this.audio_data);
    } else if (this.state == "RECORDING") {
      this.state = "STOP_RECORDING";
      this.target.find(".upload_zone").mousedown();
    }
  },
  load_example: function(example_data) {
    example_data = this.io_master.example_file_path + example_data;
    let io = this;
    if (io.state == "NO_AUDIO" || io.state == "RECORDED") {
      io.clear();
      toDataURL(example_data, function(data) {
        io.load_preview_from_audio(data);
      })  
    }
  },
  show_interpretation: function(data) {
    let html = ""
    for (let [i, value] of data.entries()) {
      html += `
        <div class='alternate' alternate_index='${i}'
          style='background-color: ${getSaliencyColor(value)}'>
        </div>      `
    }
    this.target.find(".interpret_range").html(html);
  },
  interpretation_logic: "Highlights the output contribution of subsections of the audio input split by time.",
  clear: function() {
    this.audio_data = null;
    this.state = "NO_AUDIO";
    this.target.find(".interpret_range").empty();
    this.target.find(".not_recording").show();
    this.target.find(".recording").addClass("hidden");
    this.target.find(".player").addClass("hidden");
    this.target.find(".upload_zone").show();
    this.target.find(".hidden_upload").prop("value", "")
    if (this.wavesurfer) {
      this.wavesurfer.stop();
    }
  }
}
