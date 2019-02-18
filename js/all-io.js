try {
  var ws = new WebSocket("ws://127.0.0.1:5680/")
  ws.onerror = function(evt) {
    notifyError(evt)
  };
  ws.onclose = function(event) {
    console.log("WebSocket is closed now.");
    $('#model-status').html('Model: closed');
    $('#model-status').css('color', '#e23e44');
    $('#overlay').css('visibility','visible')
};

} catch (e) {
  notifyError(e)
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}