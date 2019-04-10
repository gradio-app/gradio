const textbox_output = {
  html: `<textarea readonly class="output_text"></textarea>`,
  init: function() {},
  output: function(data) {
    this.target.find(".output_text").text(data);
  },
  submit: function() {
  },
  clear: function() {
    this.target.find(".output_text").empty();
  }
}
