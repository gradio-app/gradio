input_to_object_map = {
  "csv" : {},
  "imageupload" : image_input,
  "sketchpad" : sketchpad_input,
  "textbox" : textbox_input,
  "microphone" : microphone
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
  interface.target.attr("interface_id", id);
}

var config;
$.getJSON("static/config.json", function(data) {
  config = data;
  input_interface = Object.create(input_to_object_map[
      config["input_interface_type"]]);
  output_interface = Object.create(output_to_object_map[
      config["output_interface_type"]]);
  $("#input_interface").html(config.disabled ?
    input_interface.disabled_html : input_interface.html);
  input_interface.target = $("#input_interface");
  set_interface_id(input_interface, 1)
  input_interface.init();
  $("#output_interface").html(output_interface.html);
  output_interface.target = $("#output_interface");
  set_interface_id(output_interface, 2)
 output_interface.init();
  $(".submit").click(function() {
    input_interface.submit();
    output_interface.submit();
    $(".flag").removeClass("flagged");
  })
  $(".clear").click(function() {
    input_interface.clear();
    output_interface.clear();
    $(".flag").removeClass("flagged");
    $(".flag_message").empty
    $("#loading").addClass("invisible");
    $("#output_interface").removeClass("invisible");
    io_master.last_input = null;
    io_master.last_output = null;
  })
  input_interface.io_master = io_master;
  io_master.input_interface = input_interface;
  output_interface.io_master = io_master;
  io_master.output_interface = output_interface;
  if (config["share_url"] != "None") {
    $("#share_row").css('display', 'flex');
  }
  load_history(config["sample_inputs"] || []);
  if (!config["sample_inputs"]) {
    $("#featured_history").hide();
  }
});

$('body').on('click', '.flag', function(e) {
  if (io_master.last_output) {
    $(".flag").addClass("flagged");
    io_master.flag($(".flag_message").val());
  }
})
