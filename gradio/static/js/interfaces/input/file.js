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
    this.file_count = opts.file_count;
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
    if (this.file_count == "multiple") {
      this.target.find(".hidden_upload").attr("multiple", "true");
    } else if (this.file_count == "directory") {
      this.target.find(".hidden_upload").attr("webkitdirectory", "true");
      this.target.find(".hidden_upload").attr("mozdirectory", "true");
    }
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
    if (io.file_count == "single") {
      io.target.find(".file_name").text(io.file_data[0].name);
      if (io.file_data[0].size !== null) {
        io.target.find(".file_size").text(prettyBytes(io.file_data[0].size));
      }
    } else {
      io.target.find(".file_name").text(io.file_data.length + " files");
      let total_bytes = 0;
      for (let file of io.file_data) {
        if (file.size == null) {
          total_bytes = null;
          break;
        } else {
          total_bytes += file.size;
        }
      }
      if (total_bytes != null) {
        io.target.find(".file_size").text(prettyBytes(total_bytes));
      }
    }
  },
  load_preview_from_files: function(files) {
    if (!files.length || !window.FileReader) {
      return
    }

    var io = this;
    io.file_data = [];
    for (let file of files) {
      let ReaderObj = new FileReader()
      ReaderObj.readAsDataURL(file)
      ReaderObj.onloadend = function() {
        io.file_data.push({
          "name": file.name,
          "size": file.size,
          "data": this.result,
          "is_local_example": false
        });
        if (io.file_data.length == files.length) {
          io.load_preview();
        }
      }
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
