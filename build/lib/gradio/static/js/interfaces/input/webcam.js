const webcam = {
  html: `
    <div class="webcam_box"></div>
    <button class="take_photo">
      <span class="camera_on">Click here to take a photo!</span>
      <span class="snapped">Snapped!</span>
    </button>
  `,
  init: function(opts) {
    var io = this;
//    this.target.find(".webcam_box").width(this.target.find(".webcam_box").width);
    let w = this.target.find(".webcam_box").width();
    let h = this.target.find(".webcam_box").height();
    if (config.live) {
      this.target.find(".take_photo").hide();
    }
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
    window.setTimeout(function() {
      io.state = "CAMERA_ON";
    }, 1000);
    this.target.find(".webcam_box, .take_photo").click(function() {
      if (io.state != "CAMERA_ON" || config.live) {
        return;
      }
      Webcam.snap(function(image_data) {
        io.image_data = image_data;
      });

      io.state = "SNAPPED";
      Webcam.freeze();
      io.target.find(".webcam_box video").hide();
      io.target.find(".camera_on").hide();
      io.target.find(".snapped").show();

    })
  },
  submit: function() {
    var io = this;
    if (config.live) {
      if (this.state == "CAMERA_ON") {
        Webcam.snap(function(image_data) {
          this.io_master.input(io.id, image_data);
        });
      } else {
        window.setTimeout(function() {
          io.submit();
        }, 500);
      }
    } else if (this.state == "SNAPPED") {
      this.io_master.input(this.id, this.image_data);
    }
  },
  clear: function() {
    if (this.state == "SNAPPED") {
      this.state = "CAMERA_ON";
      this.target.find(".camera_on").show();
      this.target.find(".snapped").hide();
      Webcam.unfreeze();
      this.target.find(".webcam_box video").show();
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
