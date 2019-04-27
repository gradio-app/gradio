const microphone = {
  html: `
    <div class="upload_zone">
      <img class="not_recording" src="/static/img/mic.png" />
      <div class="recording volume_display">
        <div class="volume volume_left">
        </div>
        <img src="/static/img/mic_recording.png" />
        <div class="volume volume_right">
        </div>
      </div>
      <div class="not_recording input_caption">Click to Record from Microphone</div>
      <div class="recording input_caption">Recording... (Click to Stop)</div>
    </div>
    `,
  state: "NO_AUDIO",
  init: function() {
    var io = this;
    this.target.click(function() {
      if (io.state == "NO_AUDIO") {
        io.target.find(".recording").show();
        io.target.find(".not_recording").hide();
        io.state = "RECORDING"
      } else {
        io.target.find(".not_recording").show();
        io.target.find(".recording").hide();
        io.target.find(".upload_zone").hide();
        io.state = "RECORDED"
      }
    })
  },
  submit: function() {
  },
  clear: function() {
  }
}
