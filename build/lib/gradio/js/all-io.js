var NGROK_URL = "ws://b2208ab1.ngrok.io"
var SOCKET_PORT = 9201

try {
  var origin = window.location.origin;
  if (origin.includes("ngrok")){
      var ws = new WebSocket(NGROK_URL)
  } else {
      var ws = new WebSocket("ws://127.0.0.1:" + SOCKET_PORT + "/")
  }
  ws.onerror = function(evt) {
    console.log(evt)
  };
  ws.onclose = function(event) {
    console.log("WebSocket is closed now.");
    var model_status = $('#model-status')
    model_status.html('Model: closed');
    model_status.css('color', '#e23e44');
    $('#overlay').css('visibility','visible')
};

} catch (e) {
  console.log(e)
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}