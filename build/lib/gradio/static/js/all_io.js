var io_master_template = {
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
    let io = this;
    if (!this.config.live) {
      this.target.find(".loading").removeClass("invisible");
      this.target.find(".loading_in_progress").show();
      this.target.find(".loading_failed").hide();
      this.target.find(".output_interface").addClass("invisible");
      this.target.find(".output_interfaces .panel_header").addClass("invisible");
    }
    this.fn(this.last_input).then((output) => {
      io.output(output);
    }).catch(() => {
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    })
  },
    output: function(data) {
    this.last_output = data["data"];

    for (let i = 0; i < this.output_interfaces.length; i++) {
      this.output_interfaces[i].output(data["data"][i]);
      this.output_interfaces[i].target.parent().find(`.loading_time[interface="${i}"]`).text("Latency: " + ((data["durations"][i])).toFixed(2) + "s");
    }
    if (this.config.live) {
      this.gather();
    } else {
      this.target.find(".loading").addClass("invisible");
      this.target.find(".output_interface").removeClass("invisible");
      this.target.find(".output_interfaces .panel_header").removeClass("invisible");
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
