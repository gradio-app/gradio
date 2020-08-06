const file_output = {
  html: `
    <div class="interface_mini_box">
      <div class="file_display hide">
        <div class="file_name"></div>
        <div class="file_size"></div>
      </div>
    </div>
  `,
  init: function(opts) {
  },
  output: function(data) {
    this.target.find(".output_text").text(data);
  },
  submit: function() {
  },
  clear: function() {
    this.target.find(".output_text").empty();
  }
}
