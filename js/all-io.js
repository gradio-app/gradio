try {
  var ws = new WebSocket("ws://127.0.0.1:5680/")
  ws.onerror = function(evt) {
    notifyError(evt)
  };

} catch (e) {
  notifyError(e)
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}