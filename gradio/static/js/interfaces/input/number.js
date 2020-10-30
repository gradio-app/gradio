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
    let alternate_index = 0;
    for (let value_set of data) {
      [value, score] = value_set;
      if (score == null) {
        html += `
          <div class='interpret_select'>
            ${value}
          </div>`
      } else {
        html += `
          <div class='alternate'
            alternate_index=${alternate_index}
            style='background-color: ${getSaliencyColor(score)}'>
            ${value}
          </div>`;
        alternate_index++;
      }
    }
    this.target.find(".interpret_range").html(html);
  },
  interpretation_logic: "Highlights the result of the alternative, neighboring values to input. Hover to see alternative output.",
  load_example: function(data) {
    this.target.find(".input_text").val(data);    
  }
}
