const textbox_input = {
  html: `<textarea class="input_text" placeholder="Enter text here..."></textarea>`,
  init: function() {},
  submit: function() {
    text = this.target.find(".input_text").val();
    this.io_master.input(this.id, text);
  },
  clear: function() {
    this.target.find(".input_text").val("");
  }
}
