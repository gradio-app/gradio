history_count = 0;
entry_history = [];

function add_history(entry) {
  $("#featured_table").append(`
      <div entry=${history_count}>${io_master.input_interface.renderFeatured(entry)}</div>
  `);
  entry_history.push(entry);
  history_count++;
}

function load_history(data) {
  data.forEach(add_history)
}

$('body').on('click', "#featured_table div", function() {
  let entry = entry_history[$(this).attr("entry")];
  io_master.input_interface.loadFeatured(entry);
  io_master.output_interface.clear();
})
