var io_master = {
  input: function(interface_id, data) {
    this.last_input = data;
    this.last_output = null;
    var post_data = {
      'data': data
    };
    $.ajax({type: "POST",
        url: "/api/predict/",
        data: JSON.stringify(post_data),
        success: function(output){
            if (output['action'] == 'output') {
              io_master.output(output['data']);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
         console.log(XMLHttpRequest);
         console.log(textStatus);
         console.log(errorThrown);
        }
    });
  },
  output: function(data) {
    this.last_output = data;
    this.output_interface.output(data);
  },
  flag: function(message) {
    var post_data = {
      'data': {
        'input' : this.last_input,
        'output' : this.last_output,
        'message' : message
      }
    }
    $.ajax({type: "POST",
        url: "/api/flag/",
        data: JSON.stringify(post_data),
        success: function(output){
            console.log("Flagging successful")
        },
    });
  }
};
