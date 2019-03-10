var NGROK_URL = "{{ngrok_socket_url}}"
var SOCKET_PORT = "{{socket_port}}"

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
  var origin = window.location.origin;
  if (origin.includes("ngrok")){
      var ws = new WebSocket(NGROK_URL)
  } else {
      var ws = new WebSocket("ws://127.0.0.1:" + SOCKET_PORT + "/")
  }
  ws.onerror = function(evt) {
    notifyError(evt)
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
