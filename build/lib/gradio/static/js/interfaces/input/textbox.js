const textbox_input = {
  html: `<textarea class="input_text"></textarea>
  <div class='input_text_saliency'></div>`,
  disabled_html: `<textarea class="input_text" disabled></textarea>
  <div class='input_text_saliency'></div>`,
  init: function(opts) {
    if (opts.lines) {
      this.target.find(".input_text").attr("rows", opts.lines).css("height", "auto");
      this.target.css("height", "auto");
    }
    if (opts.placeholder) {
      this.target.find(".input_text").attr("placeholder", opts.placeholder)
    }
  },
  submit: function() {
    text = this.target.find(".input_text").val();
    this.io_master.input(this.id, text);
  },
  output: function(data) {
    this.target.find(".input_text").hide();
    this.target.find(".input_text_saliency").show();
    this.target.find(".input_text_saliency").empty();
    let html = '';
    let text = this.target.find(".input_text").val();
    let index = 0;
    data.forEach(function(value, index) {
      html += `<span style='background-color:rgba(75,150,255,${value})'>${text.charAt(index)}</span>`;
    })
    $(".input_text_saliency").html(html);
  },
  clear: function() {
    this.target.find(".input_text").val("");
    this.target.find(".input_text_saliency").hide();
    this.target.find(".input_text").show();
  },
  load_example: function(data) {
    this.target.find(".input_text").val(data);    
  }
}
