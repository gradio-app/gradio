const video_input = {
  html: `
    <div class="interface_box">
      <div class="upload_zone drop_zone hide">
        <div class="input_caption">Drop Video Here<br>- or -<br>Click to Upload</div>
      </div>
      <div class="webcam upload_zone hide">
        <div class="webcam_box">
        </div>
        <span>Click to Record!</span>
      </div>
      <div class="image_display hide">
        <div class="view_holders">
          <div class="image_preview_holder">
            <video class="image_preview" controls /></video>
          </div>
        </div>
      </div>
      <input class="hidden_upload" type="file" accept="video/mp4,video/x-m4v,video/*" />
    </div>
    `
    ,
  init: function(opts) {
    var io = this;
    io.target.find(".drop_zone").removeClass("hide");
    this.target.find(".drop_zone").click(function (e) {
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
  },
  submit: function() {
    var io = this;
    if (this.state == "VIDEO_LOADED") {
      io.io_master.input(io.id, this.video_data);
    } else {
      io.io_master.no_input();
    }
  },
  clear: function() {
    this.target.find(".upload_zone").show();
    this.target.find(".image_preview").attr('src', '');
    this.target.find(".image_display").addClass("hide");
    this.target.find(".hidden_upload").prop("value", "")
    this.state = "NO_VIDEO";
    this.video_data = null;
  },
  state: "NO_VIDEO",
  video_data: null,
  set_video_data: function(video_data) {
    let io = this;
    io.video_data = video_data
    io.target.find(".image_preview").attr('src', video_data);
  },
  load_preview_from_files: function(files) {
    if (!files.length || !window.FileReader || !/^video/.test(files[0].type)) {
      return
    }
    var ReaderObj = new FileReader()
    ReaderObj.readAsDataURL(files[0])
    ReaderObj.io = this;
    this.state = "VIDEO_LOADING"
    ReaderObj.onloadend = function() {
      let io = this.io;
      io.target.find(".upload_zone").hide();
      io.target.find(".image_display").removeClass("hide");
      io.set_video_data(this.result);
      io.state = "VIDEO_LOADED"
    }
  },
  load_example: function(example_data) {
    example_data = this.io_master.example_file_path + example_data;
    let io = this;
    toDataURL(example_data, function(data) {
      io.target.find(".upload_zone").hide();
      io.target.find(".image_display").removeClass("hide");
      io.set_video_data(data, /*update_editor=*/true);
      io.state = "VIDEO_LOADED";
    })
  }
}
