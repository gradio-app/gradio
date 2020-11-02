const checkbox_group = {
  html: ``,
  init: function(opts) {
    this.choices = opts.choices;
    html = "<div class='checkbox_group'>"
    for ([index, choice] of opts.choices.entries()) {
      html += `
      <label for="${this.id}_${index}">
          <input id="${this.id}_${index}" type="checkbox" name="${this.id}" value="${index}">
          <span>${choice}<span>          
        </label>
        `;
    }
    html += "</div>"
    this.target.html(html);
    this.target.find("input").checkboxradio();
  },
  submit: function() {
    let io = this;
    let val_names = [];
    this.target.find("input:checked").each(function(_, item) {
      val_names.push(io.choices[$(item).val()])
    })
    this.io_master.input(this.id, val_names);
  },
  show_interpretation: function(data) {
    this.target.find(".interpret_check").remove();
    let alternate_index = 0;
    for (let i = 0; i < data.length; i++) {
      let html = "<div class='interpret_sub'>"
      for (let j = 0; j < data[i].length; j++) {
        let score = data[i][j];
        let mark = ["&#x2717;", "&#x2713;"][j];
        if (score == null) {
          html += `<div class='interpret_check interpret_select'>
              ${mark}
          </div>`
        } else {
          html += `<div class='interpret_check alternate'
            alternate_index='${alternate_index}'
            style='background-color: ${getSaliencyColor(score)}'>
              ${mark}
            </div>`
            alternate_index++;
        }
      }
      html += "</div>"
      this.target.find("label").eq(i).append(html);
    }
  },
  interpretation_logic: "Highlights the result of alternative selections to the checkboxes. Hover to see alternative output.",
  clear: function() {
    this.target.find(".interpretation").empty();    
    this.target.find("input").prop("checked", false);    
    this.target.find("input").button("refresh");  
  },
  load_example: function(data) {
    for (let [i, choice] of this.choices.entries()) {
      let child = i + 1;
      let checkbox = this.target.find("label:nth-child("+child+") input");
      console.log(data, choice, child)
      if (data.includes(choice)) {
        checkbox.prop("checked", true);
      } else {
        checkbox.prop("checked", false);
      }
    }
    this.target.find("input").button("refresh");  
  }
}
