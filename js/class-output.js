var predict_canvas = document.getElementById("predict_canvas");
var predict_ctx = predict_canvas.getContext("2d");


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

try {
  ws.onerror = function(evt) {
    notifyError(evt)
  };

  ws.onmessage = function (event) {
    console.log(event.data);
    predict_ctx.clearRect(0, 0, 400, 400); // Clears the canvas
    predict_ctx.font = String(400/(event.data.length*1.1)) + "px Arial";
    console.log(predict_ctx.font);
    predict_ctx.fillStyle = "white";
    sleep(300).then(() => {
		predict_ctx.textAlign = "center";
    	predict_ctx.fillText(event.data, 200, 200);
    })

  }
} catch (e) {
  notifyError(e)
}
