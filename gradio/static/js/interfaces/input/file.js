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
      <input class="hidden_upload" type="file" />
    </div>
    `
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
  load_preview_from_files: function(files) {
    if (!files.length || !window.FileReader) {
      return
    }
    var ReaderObj = new FileReader()
    ReaderObj.readAsDataURL(files[0])
    ReaderObj.io = this;
    ReaderObj.onloadend = function() {
      let io = this.io;
      io.target.find(".upload_zone").hide();
      io.target.find(".file_display").removeClass("hide");
      io.target.find(".file_name").text(files[0].name);
      let bytes = files[0].size;
      let units = ["B", "KB", "MB", "GB", "PB"];
      let i = 0;
      while (bytes > 1024) {
        bytes /= 1024;
        i++;
      }
      let unit = units[i];
      io.target.find(".file_size").text(bytes.toFixed(1) + " " + unit);
      io.file_data = this.result;
    }
  },
  clear: function() {
    this.target.find(".upload_zone").show();
    this.target.find(".file_display").addClass("hide");
    this.target.find(".hidden_upload").prop("value", "")
    this.file_data = null;
  },
  file_data: null,
}
