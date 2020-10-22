const number_input = {
  html: `
    <input type="text" class="input_text">
    <div class="interpret_range"></div>
    `,
  init: function(opts) {
    if (opts.default) {
      this.target.find(".input_text").val(opts.default)
    }
  },
  submit: function() {
    text = this.target.find(".input_text").val();
    if (!isNaN(parseFloat(text))) {
      this.io_master.input(this.id, parseFloat(text));
    } else {
      this.io_master.no_input();
    }
  },
  clear: function() {
    this.target.find(".interpret_range").empty();
    this.target.find(".input_text").val("");
    this.target.find(".input_text").show();
  },
  show_interpretation: function(data) {
    let html = ""
    for (let value_set of data) {
      [value, score] = value_set;
      if (score == null) {
        html += `
          <div class='interpret_select'>
            ${value}
          </div>`
      } else {
        html += `
          <div title="${score}"
            style='background-color: ${getSaliencyColor(score)}'>
            ${value}
          </div>`
      }
    }
    this.target.find(".interpret_range").html(html);

  },
  load_example: function(data) {
    this.target.find(".input_text").val(data);    
  }
}
