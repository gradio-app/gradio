const webcam = {
  html: `
    <div class="webcam_box"></div>
  `,
  init: function(opts) {
    var io = this;
//    this.target.find(".webcam_box").width(this.target.find(".webcam_box").width);
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
<<<<<<< HEAD
    Webcam.snap(function(image_data) {
      io.io_master.input(io.id, image_data);
    });
    // Webcam.freeze();
=======
    Webcam.freeze();
    Webcam.snap(function(image_data) {
      io.io_master.input(io.id, image_data);
    });
>>>>>>> 2bd16c2f9c360c98583b94e2f6a6ea7259a98217
    this.state = "SNAPPED";
  },
  clear: function() {
    if (this.state == "SNAPPED") {
      this.state = "CAMERA_ON";
<<<<<<< HEAD
      // Webcam.unfreeze();
=======
      Webcam.unfreeze();
>>>>>>> 2bd16c2f9c360c98583b94e2f6a6ea7259a98217
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
