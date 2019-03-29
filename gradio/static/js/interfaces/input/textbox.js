const textbox_input = {
  html: `
    <div class="gradio input text">
      <div class="role">Input</div>
      <textarea class="input_text" placeholder="Enter text here..."></textarea>
    </div>`,
  init: function() {},
  submit: function() {
    text = this.target.find(".input_text").val();
    this.io_master.input(this.id, text);
  },
  clear: function() {
    this.target.find(".input_text").val("");
  }
}
