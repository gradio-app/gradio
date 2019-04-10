var NGROK_URL = "{{ngrok_socket_url}}"
var SOCKET_PORT = "{{socket_port}}"

var origin = window.location.origin;
if (origin.includes("ngrok")) {
    var ws = new WebSocket(NGROK_URL)
} else {
    var ws = new WebSocket("ws://127.0.0.1:" + SOCKET_PORT + "/")
}
ws.onclose = function(event) {
  console.log("WebSocket is closed now.");
}

var io_master = {
  input: function(interface_id, data) {
    var ws_data = {
      'action': 'input',
      'data': data
    };
    console.log(ws_data)
    ws.send(JSON.stringify(ws_data), function(e) {
      console.log(e)
    })
  },
  output: function(data) {
    this.output_interface.output(data);
  }
}

ws.onmessage = function (event) {
  var output = JSON.parse(event.data)
  if (output['action'] == 'output') {
    all_io.output(output['data']);
  }
}
