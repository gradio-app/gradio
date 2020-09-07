const textbox_input = {
  html: `<textarea class="input_text"></textarea>`,
  one_line_html: `<input type="text" class="input_text">`,
  init: function(opts) {
    if (opts.lines > 1) {
      this.target.find(".input_text").attr("rows", opts.lines).css("height", "auto");
    } else {
      this.target.html(this.one_line_html);
    }
    if (opts.placeholder) {
      this.target.find(".input_text").attr("placeholder", opts.placeholder)
    }
    if (opts.default) {
      this.target.find(".input_text").val(opts.default)
    }
  },
  submit: function() {
    text = this.target.find(".input_text").val();
    this.io_master.input(this.id, text);
  },
  clear: function() {
    this.target.find(".input_text").val("");
  },
  load_example: function(data) {
    this.target.find(".input_text").val(data);    
  }
}
