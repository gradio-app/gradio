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
    this.last_input = data;
    this.last_output = null;
    var ws_data = {
      'action': 'input',
      'data': data
    }
    ws.send(JSON.stringify(ws_data), function(e) {
      console.log(e)
    })
  },
  output: function(data) {
    this.last_output = data;
    this.output_interface.output(data);
  },
  flag: function(input, output, message) {
    var ws_data = {
      'action': 'flag',
      'data': {
        'input' : this.last_input,
        'output' : this.last_output,
        'message' : message
      }
    }
    ws.send(JSON.stringify(ws_data), function(e) {
      console.log(e)
    })
  }
}

ws.onmessage = function (event) {
  var output = JSON.parse(event.data)
  if (output['action'] == 'output') {
    io_master.output(output['data']);
  }
}
