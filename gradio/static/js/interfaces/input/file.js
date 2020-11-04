const file_input = {
  html: `
    <div class="interface_mini_box">
      <div class="upload_zone drop_zone">
        <div class="input_caption">Drop File Here<br>- or -<br>Click to Upload</div>
      </div>
      <div class="file_display hide">
        <div class="file_name"></div>
        <div class="file_size"></div>
      </div>
      <input class="hidden_upload" type="file">
    </div>`
    ,
  init: function(opts) {
    var io = this;
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
  },
  submit: function() {
    if (this.file_data) {
      this.io_master.input(this.id, this.file_data);
    }
  },
  load_preview: function() {
    var io = this;
    io.target.find(".upload_zone").hide();
    io.target.find(".file_display").removeClass("hide");
    io.target.find(".file_name").text(io.file_data.name);
    if (io.file_data.size !== null) {
      io.target.find(".file_size").text(prettyBytes(io.file_data.size));
    }
  },
  load_preview_from_files: function(files) {
    if (!files.length || !window.FileReader) {
      return
    }
    var ReaderObj = new FileReader()
    ReaderObj.readAsDataURL(files[0])
    var io = this;
    ReaderObj.onloadend = function() {
      io.file_data = {
        "name": files[0].name,
        "size": files[0].size,
        "data": this.result,
        "is_local_example": false
      }
      io.load_preview()
    };
  },
  load_example: function(example_data) {
    var io = this;
    io.file_data = {
      "name": example_data,
      "data": null, 
      "size": null,
      "is_local_example": true
    };
    io.load_preview();
  },
  clear: function() {
    this.target.find(".upload_zone").show();
    this.target.find(".file_display").addClass("hide");
    this.target.find(".hidden_upload").prop("value", "")
    this.file_data = null;
  },
  file_data: null,
}
