function gradio(config, fn, target) {
  target = $(target);
  target.html(`
    <div class="panels container">
      <div class="panel input_panel">
        <div class="input_interfaces">
        </div>          
        <div class="panel_buttons">
          <input class="submit" type="submit" value="submit"/>
          <input class="clear" type="reset" value="clear">
        </div>
      </div>
      <div class="panel output_panel">
        <div class="loading interface invisible">
          <img class="loading_in_progress" src="static/img/logo_loading.gif">
          <img class="loading_failed" src="static/img/logo_error.png">
        </div>
        <div class="output_interfaces">
        </div>          
      </div>
    </div>`);
    let io_master = Object.create(io_master_template);
    io_master.fn = fn
    io_master.target = target;
    io_master.config = config;

    let input_to_object_map = {
      "csv" : {},
      "image" : image_input,
      "sketchpad" : sketchpad_input,
      "textbox" : textbox_input,
      "webcam" : webcam,
      "microphone" : microphone,
      "radio" : radio,
      "checkbox" : checkbox,
      "checkboxgroup" : checkbox_group,
      "slider" : slider,
      "dropdown" : dropdown,
    }
    let output_to_object_map = {
      "csv" : {},
      "image" : image_output,
      "label" : label_output,
      "keyvalues" : key_values,
      "textbox" : textbox_output
    }
    let id_to_interface_map = {}
    
    function set_interface_id(interface, id) {
      interface.id = id;
      id_to_interface_map[id] = interface;
    }
  
    _id = 0;
    let input_interfaces = [];
    let output_interfaces = [];
    for (let i = 0; i < config["input_interfaces"].length; i++) {
      input_interface_data = config["input_interfaces"][i];
      input_interface = Object.create(input_to_object_map[input_interface_data[0]]);
      if (input_interface_data[1]["label"]) {
        target.find(".input_interfaces").append(`
          <div class="panel_header">${input_interface_data[1]["label"]}</strong>
        `);
      }
      target.find(".input_interfaces").append(`
        <div class="input_interface interface" interface_id=${_id}>
          ${input_interface.html}
        </div>
      `);
      input_interface.target = target.find(`.input_interface[interface_id=${_id}]`);
      set_interface_id(input_interface, _id);
      input_interface.io_master = io_master;
      input_interface.init(input_interface_data[1]);
      input_interfaces.push(input_interface);
      _id++;
    }
    for (let i = 0; i < config["output_interfaces"].length; i++) {
      if (i != 0 && i % (config["output_interfaces"].length / config.function_count) == 0) {
        target.find(".output_interfaces").append("<hr>");
      }
      output_interface_data = config["output_interfaces"][i];
      output_interface = Object.create(output_to_object_map[
        output_interface_data[0]]);
      if (output_interface_data[1]["label"]) {
        target.find(".output_interfaces").append(`
          <div class="panel_header">${output_interface_data[1]["label"]}</strong>
        `);
      }
      target.find(".output_interfaces").append(`
        <div class="output_interface interface" interface_id=${_id}>
          ${output_interface.html}
        </div>
      `);
      target.find(".output_interfaces").append(`
        <div class="loading_time" interface="${i}">  </div>
      `);
      output_interface.target = target.find(`.output_interface[interface_id=${_id}]`);
      set_interface_id(output_interface, _id);
      output_interface.io_master = io_master;
      output_interface.init(output_interface_data[1]);
      output_interfaces.push(output_interface);
      _id++;
    }
    io_master.input_interfaces = input_interfaces;
    io_master.output_interfaces = output_interfaces;
    target.find(".clear").click(function() {
      for (let input_interface of input_interfaces) {
        input_interface.clear();
      }
      for (let output_interface of output_interfaces) {
        output_interface.clear();
      }
      target.find(".flag").removeClass("flagged");
      target.find(".flag_message").empty();
      target.find(".loading").addClass("invisible");
      target.find(".loading_time").text("");
      target.find(".output_interface").removeClass("invisible");
      io_master.last_input = null;
      io_master.last_output = null;
    });
    if (config.live) {
      io_master.gather();
    } else {
      target.find(".submit").show();
      target.find(".submit").click(function() {
        io_master.gather();
        target.find(".flag").removeClass("flagged");
      })
    }
    if (!config.show_input) {
      target.find(".input_panel").hide();
    } 

    return io_master;
}