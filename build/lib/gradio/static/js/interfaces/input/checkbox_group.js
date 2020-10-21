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
        <div style='display: inline-block' class="interpretation"></div>
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
    for (let i = 0; i < data.length; i++) {
      let html = ""
      for (let j = 0; j < data[i].length; j++) {
        html += `<div class='interpret_check' title='${data[i][j]}'
          style='background-color: ${getSaliencyColor(data[i][j])}'>
            ${["-", "+"][j]}
          </div>`
      }
      this.target.find(".interpretation").eq(i).html(html);
    }
  },
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
