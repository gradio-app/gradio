var canvas = document.getElementById('canvas');
context = canvas.getContext("2d");
context.fillStyle = "black";
context.fillRect(0, 0, 400, 400);


function notifyError(error) {
      $.notify({
          // options
          message: 'Not able to communicate with model (is python code still running?)'
      },{
          // settings
          type: 'danger',
          animate: {
              enter: 'animated fadeInDown',
              exit: 'animated fadeOutUp'
          },
          placement: {
              from: "bottom",
              align: "right"
          },
          delay: 5000

      });
 }


$('#canvas').mousedown(function(e){
  var mouseX = e.pageX - this.getBoundingClientRect().left + document.documentElement.scrollLeft;
  var mouseY = e.pageY - this.getBoundingClientRect().top + document.documentElement.scrollTop
;

  paint = true;
  addClick(mouseX, mouseY);
  redraw();
});
$('#canvas').mousemove(function(e){
  if(paint){
    addClick(e.pageX - this.getBoundingClientRect().left + document.documentElement.scrollLeft, e.pageY - this.getBoundingClientRect().top + document.documentElement.scrollTop, true);
    redraw();
  }
});
$('#canvas').mouseup(function(e){
  paint = false;
});
$('#canvas').mouseleave(function(e){
  paint = false;
});
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}
function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.fillStyle = "black";
  context.fillRect(0, 0, 400, 400);

  context.strokeStyle = "#FFF";
  context.lineJoin = "round";
  context.lineWidth = 25;

  for(var i=0; i < clickX.length; i++) {
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

$('#clear-button').click(function(e){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
    context.fillStyle = "black";
    context.fillRect(0, 0, 400, 400);
    ctx.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
})


$('#submit-button').click(function(e){
    var dataURL = canvas.toDataURL("image/png");
    ws.send(dataURL, function(e){
      notifyError(e)  
    });

})

