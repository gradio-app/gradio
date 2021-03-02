
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
      this.target.find(".loading").removeClass("hidden");
      this.target.find(".loading_in_progress").show();
      this.target.find(".loading_failed").hide();
      this.target.find(".output_interfaces").css("opacity", 0.5);
    }
    this.fn(this.last_input, "predict").then((output) => {
      io.output(output);
      this.target.find(".flag").removeClass("inactive");
      this.target.find(".interpret").removeClass("inactive");  
    }).catch((error) => {
      console.error(error);
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    });
  },
  score_similarity: function(callback) {
    this.target.find(".loading").removeClass("hidden");
    this.target.find(".loading_in_progress").show();
    this.target.find(".loading_failed").hide();
    this.target.find(".output_interfaces").css("opacity", 0.5);

    this.fn(this.last_input, "score_similarity").then((output) => {
      output = output["data"];
      this.target.find(".loading").addClass("hidden");
      this.target.find(".output_interfaces").css("opacity", 1);
      this.order_mapping = sortWithIndices(output).reverse();
      callback();
    })
  },
  view_embeddings: function(callback) {
    this.target.find(".loading").removeClass("hidden");
    this.target.find(".loading_in_progress").show();
    this.target.find(".loading_failed").hide();
    this.target.find(".output_interfaces").css("opacity", 0.5);

    this.fn(this.last_input, "view_embeddings").then((output) => {
      this.target.find(".loading").addClass("hidden");
      this.target.find(".output_interfaces").css("opacity", 1);
      callback(output)
    })
  },
  update_embeddings: function(callback) {
    this.target.find(".loading").removeClass("hidden");
    this.target.find(".loading_in_progress").show();
    this.target.find(".loading_failed").hide();
    this.target.find(".output_interfaces").css("opacity", 0.5);

    this.fn(this.last_input, "update_embeddings").then((output) => {
      this.target.find(".loading").addClass("hidden");
      this.target.find(".output_interfaces").css("opacity", 1);
      callback(output)
    })
  },
  submit_examples: function(callback) {
    this.target.find(".loading").removeClass("hidden");
    this.target.find(".loading_in_progress").show();
    this.target.find(".loading_failed").hide();
    this.target.find(".output_interfaces").css("opacity", 0.5);

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
      this.target.find(".loading").addClass("hidden");
      this.target.find(".output_interfaces").css("opacity", 1);

      output = output["data"];
      for (let [example_id, output_values] of Object.entries(output)) {
        this.loaded_examples[example_id] = output_values;
      }
      callback();
    }).catch((error) => {
      console.error(error);
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    });
  },
  output: function(data, do_not_cache) {
    if (!do_not_cache) {
      this.last_output = data["data"];
    }

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
      this.target.find(".loading").addClass("hidden");
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
  flag: function(flag_option) {
    var post_data = {
      'input_data' : this.last_input ,
      'output_data' : this.last_output,
      'flag_option': flag_option
    };
    this.fn(post_data, "flag")
  },
  interpret: function() {
    var io = this;
    this.target.find(".loading").removeClass("hidden");
    this.target.find(".loading_in_progress").show();
    var post_data = this.last_input;
    this.fn(post_data, "interpret").then((data) => {
      for (let [idx, interpretation] of data["interpretation_scores"].entries()) {
        io.input_interfaces[idx].show_interpretation(interpretation);
      }
      io.alternative_outputs = data["alternative_outputs"]
      io.target.find(".loading_in_progress").hide();
    }).catch((error) => {
      console.error(error);
      this.target.find(".loading_in_progress").hide();
      this.target.find(".loading_failed").show();
    })
  },
  alternative_interpret: function(interface_index, alternate_index) {
    if (interface_index === false) {
      this.output({"data": this.last_output});
    } else if (io.alternative_outputs) {
      this.output(
        {"data": io.alternative_outputs[interface_index][alternate_index]},
        /*do_not_cache=*/true
      )
    }
  }
};


