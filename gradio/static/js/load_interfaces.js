input_to_object_map = {
  "csv" : {},
  "imagein" : image_input,
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
output_to_object_map = {
  "csv" : {},
  "image" : image_output,
  "label" : label_output,
  "textbox" : textbox_output
}
id_to_interface_map = {}

function set_interface_id(interface, id) {
  interface.id = id;
  id_to_interface_map[id] = interface;
}

var config;
$.getJSON("static/config.json", function(data) {
  config = data;
  _id = 0;
  let input_interfaces = [];
  let output_interfaces = [];
  for (let i = 0; i < config["input_interfaces"].length; i++) {
    input_interface_data = config["input_interfaces"][i];
    input_interface = Object.create(input_to_object_map[input_interface_data[0]]);
    if (input_interface_data[1]["label"]) {
      $(".input_interfaces").append(`
        <div class="panel_header">${input_interface_data[1]["label"]}</strong>
      `);
    }
    $(".input_interfaces").append(`
      <div class="input_interface interface" interface_id=${_id}>
        ${input_interface.html}
      </div>
    `);
    input_interface.target = $(`.input_interface[interface_id=${_id}]`);
    set_interface_id(input_interface, _id);
    input_interface.init(input_interface_data[1]);
    input_interfaces.push(input_interface);
    input_interface.io_master = io_master;
    _id++;
  }
  for (let i = 0; i < config["output_interfaces"].length; i++) {
    if (i != 0 && i % (config["output_interfaces"].length / config.function_count) == 0) {
      $(".output_interfaces").append("<hr>");
    }
    output_interface_data = config["output_interfaces"][i];
    output_interface = Object.create(output_to_object_map[
      output_interface_data[0]]);
    if (output_interface_data[1]["label"]) {
      $(".output_interfaces").append(`
        <div class="panel_header">${output_interface_data[1]["label"]}</strong>
      `);
    }
    $(".output_interfaces").append(`
      <div class="output_interface interface" interface_id=${_id}>
        ${output_interface.html}
      </div>
    `);
    output_interface.target = $(`.output_interface[interface_id=${_id}]`);
    set_interface_id(output_interface, _id);
    output_interface.init(output_interface_data[1]);
    output_interfaces.push(output_interface);
    output_interface.io_master = io_master;
    _id++;
  }
  io_master.input_interfaces = input_interfaces;
  io_master.output_interfaces = output_interfaces;
  $(".clear").click(function() {
    for (let input_interface of input_interfaces) {
      input_interface.clear();
    }
    for (let output_interface of output_interfaces) {
      output_interface.clear();
    }
    $(".flag").removeClass("flagged");
    $(".flag_message").empty();
    $("#loading").addClass("invisible");
    $(".output_interface").removeClass("invisible");
    io_master.last_input = null;
    io_master.last_output = null;
  })
  if (config["share_url"] != "None") {
    $("#share_row").css('display', 'flex');
  }
  load_history(config["sample_inputs"] || []);
  if (!config["sample_inputs"]) {
    $("#featured_history").hide();
  }
  if (config.live) {
    io_master.gather();
  } else {
    $(".submit").show();
    $(".submit").click(function() {
      io_master.gather();
      $(".flag").removeClass("flagged");
    })
  }
  if (!config.show_input) {
    $(".input_panel").hide();
  }
});

$('body').on('click', '.flag', function(e) {
  if (io_master.last_output) {
    $(".flag").addClass("flagged");
    io_master.flag($(".flag_message").val());
  }
})
