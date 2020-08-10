const webcam = {
  html: `
    <div class="interface_box">
      <div class="webcam_box"></div>
    </div>
  `,
  init: function(opts) {
    var io = this;
    let w = this.target.find(".webcam_box").width();
    let h = this.target.find(".webcam_box").height();
    let RATIO = 4/3;
    let dim = Math.min(h, w / RATIO);
    Webcam.set({
      image_format: 'jpeg',
      width: dim * RATIO,
			height: dim,
      dest_width: dim * RATIO,
			dest_height: dim,
    })
    Webcam.attach(this.target.find(".webcam_box")[0]);
  },
  submit: function() {
    var io = this;
    Webcam.snap(function(image_data) {
      io.io_master.input(io.id, image_data);
    });
    Webcam.freeze();
    this.target.find("video").hide();    
    this.state = "SNAPPED";
  },
  clear: function() {
    if (this.state == "SNAPPED") {
      this.state = "CAMERA_ON";
      Webcam.unfreeze();
      this.target.find("video").show();    
    }
  },
  state: "NOT_STARTED",
  image_data: null,
  renderFeatured: function(data) {
    return `<img src=${data}>`;
  },
  loadFeatured: function(data) {
    return `<img src=${data}>`;
  }
}
