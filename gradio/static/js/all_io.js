var io_master = {
  gather: function() {
    this.clear();
    for (let iface of this.input_interfaces) {
      iface.submit();
    }
  },
  clear: function() {
    this.last_input = new Array(this.input_interfaces.length);
    this.input_count = 0;
  },
  input: function(interface_id, data) {
    this.last_input[interface_id] = data;
    this.input_count += 1;
    if (this.input_count == this.input_interfaces.length) {
      this.submit();
    }
  },
  submit: function() {
    var post_data = {
      'data': this.last_input
    };
    if (!config.live) {
      $("#loading").removeClass("invisible");
      $("#loading_in_progress").show();
      $("#loading_failed").hide();
      $(".output_interface").addClass("invisible");
    }
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
    for (let i = 0; i < this.output_interfaces.length; i++) {
      this.output_interfaces[i].output(data["data"][i]);
    }
    // if (this.input_interface.output && data["saliency"]) {
    //   this.input_interface.output(data["saliency"]);
    // }
    if (config.live) {
      this.gather();
    } else {
      $("#loading").addClass("invisible");
      $(".output_interface").removeClass("invisible");  
    }
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
