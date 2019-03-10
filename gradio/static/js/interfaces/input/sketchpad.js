var dimension = Math.min($(".canvas_holder").width(),
    $(".canvas_holder").height()) - 2 // minimum dimension - border
var sketchpad = new Sketchpad({
  element: '.canvas_holder canvas',
  width: dimension,
  height: dimension
});
sketchpad.penSize = $(".brush.selected").attr("size");
canvas = $('.canvas_holder canvas')[0]
context = canvas.getContext("2d");
$(".brush").click(function (e) {
  $(".brush").removeClass("selected")
  $(this).addClass("selected")
  sketchpad.penSize = $(this).attr("size")
})

$('body').on('click', '.clear', function(e) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
})
$('body').on('click', '.submit', function(e) {
    loadStart();
    var dataURL = canvas.toDataURL("image/png");
    ws.send(dataURL, function(e){
      notifyError(e)
    });
})
