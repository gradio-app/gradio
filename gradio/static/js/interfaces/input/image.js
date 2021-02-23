const image_input = {
  html: `
    <div class="interface_box">
      <div class="upload_zone drop_zone hide">
        <div class="input_caption">Drop Image Here<br>- or -<br>Click to Upload</div>
      </div>
      <div class="webcam upload_zone hide">
        <div class="webcam_box">
        </div>
        <span>Click to Snap!</span>
      </div>
      <div class="sketchpad hide">
        <div class="sketch_tools">
          <div id="brush_1" size="8" class="brush"></div>
          <div id="brush_2" size="16" class="brush selected"></div>
          <div id="brush_3" size="24" class="brush"></div>
        </div>
        <div class="view_holders">
          <div class="canvas_holder">
            <canvas class="sketch"></canvas>
          </div>
        </div>        
      </div>
      <div class="image_display hide">
        <div class="edit_holder">
          <button class="edit_image interface_button primary">Edit</button>
        </div>
        <div class="view_holders">
          <div class="image_preview_holder">
            <img class="image_preview" />
          </div>
          <div class="saliency_holder hide">
            <canvas class="saliency"></canvas>
          </div>          
        </div>
      </div>
      <input class="hidden_upload" type="file" accept="image/x-png,image/gif,image/jpeg" />
    </div>
    `
    ,
  overlay_html: `
    <div class="overlay interface_extension image_editor_overlay hide" interface_id="{0}">
      <div class="image_editor_holder">
        <div class="image_editor"></div>
      </div>
    </div>
  `,
  init: function(opts) {
    var io = this;
    this.shape = opts.shape;
    this.source = opts.source;
    this.tool = opts.tool;
    if (this.tool == "select") {
      this.target.find('.edit_holder').hide();      
    }
    $('body').append(this.overlay_html.format(this.id));
    this.overlay_target = $(`.overlay[interface_id=${this.id}]`);
    if (this.source == "upload") {
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
    } else if (this.source == "webcam") {
      io.target.find(".webcam").removeClass("hide");
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
      if (io.io_master.config.live) {
        io.target.find(".webcam span").hide();
      } else {
        io.target.find(".webcam").click(function() {
          Webcam.snap(function(image_data) {
            io.target.find(".webcam").hide();
            io.target.find(".image_display").removeClass("hide");
            io.set_image_data(image_data, /*update_editor=*/true);
            io.state = "IMAGE_LOADED";
          });    
        })  
      }
    } else if (this.source == "canvas") {
      io.target.find(".sketchpad").removeClass("hide");
      var dimension = Math.min(this.target.find(".canvas_holder").width(),
        this.target.find(".canvas_holder").height()) - 2 // dimension - border
      var id = this.id;
      this.sketchpad = new Sketchpad({
        element: '.interface[interface_id=' + id + '] .sketch',
        width: dimension,
        height: dimension
      });
      this.sketchpad.penSize = this.target.find(".brush.selected").attr("size");
      this.canvas = this.target.find('.canvas_holder canvas')[0];
      this.context = this.canvas.getContext("2d");
      this.target.find(".brush").click(function (e) {
        io.target.find(".brush").removeClass("selected");
        $(this).addClass("selected");
        io.sketchpad.penSize = $(this).attr("size");
      })    
      this.clear();
    }
    this.target.find('.edit_image').click(function (e) {
      io.overlay_target.removeClass("hide");
    })
    this.tui_editor = new tui.ImageEditor(this.overlay_target.
        find(".image_editor")[0], {
      includeUI: {
        menuBarPosition: 'left',
        menu: ['crop', 'flip', 'rotate', 'draw', 'filter', 'text']
     },
       cssMaxWidth: 700,
       cssMaxHeight: 500,
       selectionStyle: {
         cornerSize: 20,
         rotatingPointOffset: 70
       }
     })
     this.overlay_target.find(".tui-image-editor-header-buttons").html(`
       <button class="tui_save tui_close interface_button primary">Save</button>
       <button class="tui_cancel tui_close interface_button secondary">Cancel</button>
     `)
     this.overlay_target.find('.tui_close').click(function (e) {
       io.overlay_target.addClass("hide");
       if ($(e.target).hasClass('tui_save')) {
         io.set_image_data(io.tui_editor.toDataURL(), /*update_editor=*/false);
       }
     });
  },
  submit: function() {
    var io = this;
    if (this.source == "canvas") {
      var dataURL = this.canvas.toDataURL("image/png");
      this.io_master.input(this.id, dataURL);
    } else if (this.state == "IMAGE_LOADED") {
      if (io.tool == "select") {
        let canvas = io.cropper.getCroppedCanvas();
        var dataURL = canvas.toDataURL("image/png");
        this.io_master.input(this.id, dataURL);
      } else {
        io.io_master.input(io.id, this.image_data);
      }
    } else if (this.source == "webcam") {
      if (!Webcam.loaded) {
        io.io_master.no_input();
        return;
      }
      Webcam.snap(function(image_data) {
        if (io.io_master.config.live) {
          io.io_master.input(io.id, image_data);  
        } else {
          io.target.find(".webcam").hide();
          io.target.find(".image_display").removeClass("hide");
          io.set_image_data(image_data, /*update_editor=*/true);
          io.state = "IMAGE_LOADED";
          io.io_master.input(io.id, image_data);  
        }
      });    
    } else {
      io.io_master.no_input();
    }
  },
  clear: function() {
    if (this.source == "canvas") {
      this.context.fillStyle = "#FFFFFF";
      this.context.fillRect(0, 0, this.context.canvas.width, this.context.
        canvas.height);
    } else {
      this.target.find(".upload_zone").show();
      this.target.find(".image_preview").attr('src', '');
      this.target.find(".image_display").addClass("hide");
      this.target.find(".hidden_upload").prop("value", "")
      this.state = "NO_IMAGE";
      this.image_data = null;
      if (this.cropper) {
        this.cropper.destroy();
      }
    }    
    this.target.find(".saliency_holder").addClass("hide");
  },
  show_interpretation: function(data) {
    if (this.target.find(".image_preview").attr("src")) {
      var img = this.target.find(".image_preview")[0];
      var size = getObjectFitSize(true, img.width, img.height, img.naturalWidth, img.naturalHeight);
      if (this.shape) {
        size = getObjectFitSize(true, size.width, size.height, this.shape[0], this.shape[1])
      }
      var width = size.width;
      var height = size.height;
      this.target.find(".saliency_holder").removeClass("hide").html(`
        <canvas class="saliency" width=${width} height=${height}></canvas>`);
      var ctx = this.target.find(".saliency")[0].getContext('2d');
      paintSaliency(data, ctx, width, height);
    }
  },
  interpretation_logic: "Highlights the output contribution of subregions of image.",
  state: "NO_IMAGE",
  image_data: null,
  set_image_data: function(image_data, update_editor) {
    let io = this;
    io.image_data = image_data
    io.target.find(".image_preview").attr('src', image_data);
    if (update_editor) {
      io.tui_editor.loadImageFromURL(io.image_data, 'input').then(function (sizeValue) {
        io.tui_editor.clearUndoStack();
        io.tui_editor.ui.activeMenuEvent();
        io.tui_editor.ui.resizeEditor({ imageSize: sizeValue });
      });
    }
    if (io.tool == "select") {
      io.cropper = new Cropper(io.target.find(".image_preview")[0]);
    }
},
  load_preview_from_files: function(files) {
    if (!files.length || !window.FileReader || !/^image/.test(files[0].type)) {
      return
    }
    var ReaderObj = new FileReader()
    ReaderObj.readAsDataURL(files[0])
    ReaderObj.io = this;
    this.state = "IMAGE_LOADING"
    ReaderObj.onloadend = function() {
      let io = this.io;
      io.target.find(".upload_zone").hide();
      io.target.find(".image_display").removeClass("hide");
      io.set_image_data(this.result, /*update_editor=*/true);
      io.state = "IMAGE_LOADED"
    }
  },
  load_example_preview: function(data) {
    return "<img src='"+this.io_master.example_file_path+data+"' height=100>"
  },
  load_example: function(example_data) {
    example_data = this.io_master.example_file_path + example_data;
    let io = this;
    toDataURL(example_data, function(data) {
      if (io.source == "canvas") {
        io.clear();
        let ctx = io.context;
        var img = new Image;
        let dimension = io.target.find(".canvas_holder canvas").width();
        img.onload = function(){
          ctx.clearRect(0,0,dimension,dimension);
          ctx.drawImage(img,0,0,dimension,dimension);
        };
        img.src = data;
      } else {
        io.target.find(".upload_zone").hide();
        io.target.find(".image_display").removeClass("hide");
        io.set_image_data(data, /*update_editor=*/true);
        io.state = "IMAGE_LOADED";
      }
    })
  }
}
