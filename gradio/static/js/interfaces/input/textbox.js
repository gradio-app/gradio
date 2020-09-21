const textbox_input = {
  html: `
    <textarea class="input_text"></textarea>
    <div class="output_text"></div>
    `,
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
    this.target.find(".output_text").hide();
  },
  submit: function() {
    text = this.target.find(".input_text").val();
    this.io_master.input(this.id, text);
  },
  clear: function() {
    this.target.find(".input_text").val("");
    this.target.find(".output_text").empty();
    this.target.find(".input_text").show();
    this.target.find(".output_text").hide();
  },
  show_interpretation: function(data) {
    this.target.find(".input_text").hide();
    this.target.find(".output_text").show();
    let html = "";
    for (let char_set of data) {
      [char, value] = char_set;
      if (value < 0) {
        color = "8,241,255," + (-value * 2);
      } else {
        color = "230,126,34," + value * 2;
      }
      html += `<span title="${value}" style="background-color: rgba(${color})">${char}</span>`
    }
    this.target.find(".output_text").html(html);
  },
  load_example: function(data) {
    this.target.find(".input_text").val(data);    
  }
}
