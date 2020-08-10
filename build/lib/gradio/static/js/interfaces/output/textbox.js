const textbox_output = {
  html: `<div class="output_text"></div>`,
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
