input_to_object_map = {
  "csv" : {},
  "imageupload" : image_input,
  "sketchpad" : sketchpad_input,
  "textbox" : textbox_input
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

function get_interface(target) {
  return id_to_interface_map[$(target).closest(".interface, .interface_extension").
      attr("interface_id")];
}

$.getJSON("static/config.json", function(data) {
  input_interface = Object.create(input_to_object_map[
      data["input_interface_type"]]);
  output_interface = Object.create(output_to_object_map[
      data["output_interface_type"]]);
  $("#input_interface").html(input_interface.html);
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
  })
  $(".clear").click(function() {
    input_interface.clear();
     output_interface.clear();
  })
  input_interface.io_master = io_master;
  io_master.input_interface = input_interface;
  output_interface.io_master = io_master;
  io_master.output_interface = output_interface;
});

$('body').on('click', '.flag', function(e) {
  if ($(".flag").hasClass("flagged")) {
    $(".flag").removeClass("flagged").attr("value", "flag");
  } else {
    $(".flag").addClass("flagged").attr("value", "flagged");
  }
})
