const file_output = {
  html: `
    <a class="interface_mini_box">
      <div class="file_display file_download">
        <div class="file_name"></div>
        <div class="file_size"></div>
      </div>
    </div>
  `,
  init: function(opts) {
  },
  output: function(data) {
    this.target.find(".file_name").text(data.name);
    this.target.find(".file_size").text(prettyBytes(data.size));
    this.target.find(".interface_mini_box")
      .attr("href", "data:;base64," + data.data)
      .attr("download", data.name);
  },
  submit: function() {
  },
  clear: function() {
    this.target.find(".file_name").empty();
    this.target.find(".file_size").empty();
    this.target.find(".interface_mini_box")
      .removeAttr("href")
      .removeAttr("download");
  },
  load_example: function(example_data) {
    example_path = this.io_master.example_file_path + example_data;
    this.target.find(".file_name").text(example_data);
    this.target.find(".file_size").empty();
    this.target.find(".interface_mini_box")
      .attr("href", example_path)
      .attr("download", example_data);
  }
}
