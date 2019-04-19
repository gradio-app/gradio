var NGROK_URL = "{{ngrok_socket_url}}"
var SOCKET_PORT = "{{socket_port}}"

var origin = window.location.origin;
if (origin.includes("ngrok") || origin.includes("gradio.app")){ //TODO(abidlabs): better way to distinguish localhost?
    var ws = new WebSocket(NGROK_URL)
} else {
    var ws = new WebSocket("ws://127.0.0.1:" + SOCKET_PORT + "/")
}
ws.onclose = function(event) {
  console.log("WebSocket is closed now.");
}

var io_master = {
  input: function(interface_id, data) {
    this.last_input = data;
    this.last_output = null;
    var ws_data = {
      'action': 'input',
      'data': data
    }
    ws.send(JSON.stringify(ws_data))
  },
  output: function(data) {
    this.last_output = data;
    this.output_interface.output(data);
  },
  flag: function(message) {
    var ws_data = {
      'action': 'flag',
      'data': {
        'input' : this.last_input,
        'output' : this.last_output,
        'message' : message
      }
    }
    ws.send(JSON.stringify(ws_data))
  }
}

ws.onmessage = function (event) {
  var output = JSON.parse(event.data)
  if (output['action'] == 'output') {
    io_master.output(output['data']);
  }
}
