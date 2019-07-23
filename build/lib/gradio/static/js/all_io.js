var io_master = {
  input: function(interface_id, data) {
    this.last_input = data;
    this.last_output = null;
    var post_data = {
      'data': data
    };
    $("#loading").removeClass("invisible");
    $("#loading_in_progress").show();
    $("#loading_failed").hide();
    $("#output_interface").addClass("invisible");
    $.ajax({type: "POST",
        url: "/api/predict/",
        data: JSON.stringify(post_data),
        success: function(output){
            if (output['action'] == 'output') {
              io_master.output(output);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
         $("#loading_in_progress").hide();
         $("#loading_failed").show();
         console.log(XMLHttpRequest);
         console.log(textStatus);
         console.log(errorThrown);
        }
    });
  },
  output: function(data) {
    this.last_output = data["data"];
    this.output_interface.output(data["data"]);
    if (this.input_interface.output && data["saliency"]) {
      this.input_interface.output(data["saliency"]);
    }
    $("#loading").addClass("invisible");
    $("#output_interface").removeClass("invisible");
  },
  flag: function(message) {
    var post_data = {
      'data': {
        'input_data' : toStringIfObject(this.last_input) ,
        'output_data' : toStringIfObject(this.last_output),
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
