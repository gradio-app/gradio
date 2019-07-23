const image_input = {
  html: `
    <div class="upload_zone drop_zone">
      <div class="input_caption">Drop Image Here<br>- or -<br>Click to Upload</div>
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
    <input class="hidden_upload" type="file" accept="image/x-png,image/gif,image/jpeg" />`
    ,
  overlay_html: `
    <div class="overlay interface_extension image_editor_overlay hide" interface_id="{0}">
      <div class="image_editor_holder">
        <div class="image_editor"></div>
      </div>
    </div>
  `,
  init: function() {
    var io = this;
    $('body').append(this.overlay_html.format(this.id));
    this.overlay_target = $(`.overlay[interface_id=${this.id}]`);
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
    this.target.find('.edit_image').click(function (e) {
      io.overlay_target.removeClass("hide");
      io.target.find(".saliency_holder").addClass("hide");
    })
    this.tui_editor = new tui.ImageEditor(this.overlay_target.
        find(".image_editor")[0], {
      includeUI: {
        menuBarPosition: 'left',
        menu: ['crop', 'flip', 'rotate', 'draw', 'filter']
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
         // if (io.tui_editor.ui.submenu == "crop") {
         //   io.tui_editor._cropAction().crop());
         // }
         io.set_image_data(io.tui_editor.toDataURL(), /*update_editor=*/false);
       }
     });
     $(".tests").html(this.test_html);
     $(".rotate_test").click(function () {
       if (io.image_data) {
         io.io_master.test("rotation", io.image_data);
       }
     })
     $(".light_test").click(function () {
       if (io.image_data) {
         io.io_master.test("lighting", io.image_data);
       }
     })
  },
  submit: function() {
    if (this.state == "IMAGE_LOADED") {
      resizeImage.call(this, this.image_data, 300, 300, function(image_data) {
        this.io_master.input(this.id, image_data);
      })
    }
  },
  clear: function() {
    this.target.find(".upload_zone").show();
    this.target.find(".image_preview").attr('src', '');
    this.target.find(".image_display").addClass("hide");
    this.target.find(".hidden_upload").prop("value", "")
    this.state = "NO_IMAGE";
    this.image_data = null;
    this.target.find(".saliency_holder").addClass("hide");
  },
  output: function(data) {
    if (this.target.find(".image_preview").attr("src")) {
      var image = this.target.find(".image_preview");
      var width = image.width();
      var height = image.height();
      this.target.find(".saliency_holder").removeClass("hide").html(`
        <canvas class="saliency" width=${width} height=${height}></canvas>`);
      var ctx = this.target.find(".saliency")[0].getContext('2d');
      paintSaliency(ctx, width, height);
    }
  },
  state: "NO_IMAGE",
  image_data: null,
  set_image_data: function(data, update_editor) {
    let io = this;
    resizeImage.call(this, data, 600, 600, function(image_data) {
      io.image_data = image_data
      io.target.find(".image_preview").attr('src', image_data);
      if (update_editor) {
        io.tui_editor.loadImageFromURL(io.image_data, 'input').then(function (sizeValue) {
          io.tui_editor.clearUndoStack();
          io.tui_editor.ui.activeMenuEvent();
          io.tui_editor.ui.resizeEditor({ imageSize: sizeValue });
        });
      }
    })
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
  }
}
