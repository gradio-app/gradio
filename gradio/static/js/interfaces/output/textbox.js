const textbox_output = {
  html: `<textarea readonly class="output_text"></textarea>`,
  init: function(opts) {
    if (opts.lines) {
      this.target.find(".output_text").attr("rows", opts.lines).css("height", "auto");
      this.target.css("height", "auto");
    }
    if (opts.placeholder) {
      this.target.find(".output_text").attr("placeholder", opts.placeholder)
    }
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
