const sketchpad_input = {
  html: `
    <div class="sketch_tools">
      <div id="brush_1" size="8" class="brush"></div>
      <div id="brush_2" size="16" class="brush selected"></div>
      <div id="brush_3" size="24" class="brush"></div>
    </div>
    <div class="view_holders">
      <div class="canvas_holder">
        <canvas class="sketch"></canvas>
      </div>
    </div>`,
  init: function() {
    var io = this;
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
  },
  submit: function() {
    var dataURL = this.canvas.toDataURL("image/png");
    this.io_master.input(this.id, dataURL);
  },
  clear: function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.
        canvas.height);
  },
  load_example_preview: function(data) {
    return "<img src="+data+" height=100>"
  },
  load_example: function(data) {
    this.clear();
    let ctx = this.context;
    var img = new Image;
    let dimension = this.target.find(".canvas_holder canvas").width();
    img.onload = function(){
      ctx.clearRect(0,0,dimension,dimension);
      ctx.drawImage(img,0,0,dimension,dimension);
    };
    img.src = data;
  }
}
