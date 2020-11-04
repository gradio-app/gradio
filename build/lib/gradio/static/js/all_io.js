var io_master_template = {
  gather: function() {
    this.clear();
    this.gathering = true;
    for (let iface of this.input_interfaces) {
      iface.submit();
    }
  },
  clear: function() {
    this.last_input = new Array(this.input_interfaces.length);
    this.input_count = 0;
    if (this.gather_timeout) {
      window.clearTimeout(this.gather_timeout);
    }
  },
  input: function(interface_id, data) {
    this.last_input[interface_id] = data;
    this.input_count += 1;
    if (this.input_count == this.input_interfaces.length) {
      this.submit();
      this.gathering = false;
    }
  },
  submit: function() {
    let io = this;
    if (!this.config.live) {
      this.target.find(".loading").removeClass("invisible");
      this.target.find(".loading_in_progress").show();
      this.target.find(".loading_failed").hide();
      this.target.find(".output_interfaces").css("opacity", 0.5);
    }
    this.fn(this.last_input, "predict").then((output) => {
      io.output(output);
    }).catch((error) => {
      console.error(error);
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    });
  },
  submit_examples: function() {
    let example_ids = [];
    if (this.loaded_examples == null) {
      this.loaded_examples = {};
    }
    for (let i = 0; i < this.config.examples.length; i++) {
      if (!(i in this.loaded_examples)) {
        example_ids.push(i);
      }
    }
    this.fn(example_ids, "predict_examples").then((output) => {
      output = output["data"];
      if (!this.has_loaded_examples) {
        this.has_loaded_examples = true;
        let html = ""
        for (let i = 0; i < this.output_interfaces.length; i++) {
          html += "<th>" + this.config.output_interfaces[i][1]["label"] + "</th>";
        }
        this.target.find(".examples > table > thead > tr").append(html);
      }
      for (let [example_id, output_values] of Object.entries(output)) {
        this.loaded_examples[example_id] = output_values;
        let html = ""
        for (let j = 0; j < output_values.length; j++) {
          let output_interface = this.output_interfaces[j];
          let example_preview = output_values[j];
          if (output_interface.load_example_preview) {
            example_preview = output_interface.load_example_preview(example_preview)
          }
          html += "<td>" + example_preview + "</td>";
        }
        this.target.find(".examples_body tr[row='" + example_id + "']").append(html);
      }
      this.has_loaded_examples = true;
    }).catch((error) => {
      console.error(error);
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    });
  },
  output: function(data) {
    this.last_output = data["data"];

    for (let i = 0; i < this.output_interfaces.length; i++) {
      this.output_interfaces[i].output(data["data"][i]);
    }
    if (data["durations"]) {
      let ratio = this.output_interfaces.length / data["durations"].length;
      for (let i = 0; i < this.output_interfaces.length; i = i + ratio) {
        this.output_interfaces[i].target.parent().find(`.loading_time[interface="${i + ratio - 1}"]`).text("Latency: " + ((data["durations"][i / ratio])).toFixed(2) + "s");
      }
    }

    if (this.config.live) {
      var io = this;
      var refresh_lag = this.config.refresh_lag || 0;
      this.gather_timeout = window.setTimeout(function() {
        io.gather();
      }, refresh_lag);
    } else {
      this.target.find(".loading").addClass("invisible");
      this.target.find(".output_interfaces").css("opacity", 1);
    }
  },
  no_input: function() {
    if (this.gathering && this.config.live) {
      var io = this;
      this.gather_timeout = window.setTimeout(function() {
        io.gather();
      }, 200);
    }
    this.gathering = false;
  },
  flag: function() {
    var post_data = {
      'input_data' : this.last_input ,
      'output_data' : this.last_output
    }
    this.fn(post_data, "flag")
  },
  interpret: function() {
    var io = this;
    this.target.find(".loading").removeClass("invisible");
    this.target.find(".loading_in_progress").show();
    var post_data = this.last_input;
    this.fn(post_data, "interpret").then((data) => {
      for (let [idx, interpretation] of data.entries()) {
        io.input_interfaces[idx].show_interpretation(interpretation);
      }
      io.target.find(".loading_in_progress").hide();
    }).catch((error) => {
      console.error(error);
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    })
  }
};
