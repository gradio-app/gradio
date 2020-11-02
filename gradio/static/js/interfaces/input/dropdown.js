const dropdown = {
  html: `
    <div class="select_holder"></div>
    <div class="select_interpretation interpret_sub"></div>
  `,
  init: function(opts) {
    this.choices = opts.choices;
    html = "<select class='dropdown'>"
    for ([index, choice] of opts.choices.entries()) {
      html += `<option value="${index}">${choice}</option>`
    }
    html += "</select>"
    this.target.find(".select_holder").html(html);
    this.target.find(".dropdown").selectmenu();
  },
  show_interpretation: function(data) {
    let html = ""
    let alternate_index = 0;
    for (let i = 0; i < this.choices.length; i++) {
      if (data[i] == null) {
        html += `
          <div class='interpret_select'>
            ${this.choices[i]}
          </div>`
      } else {
        html += `
          <div class='alternate' 
          alternate_index=${alternate_index} 
          style='background-color: ${getSaliencyColor(data[i])}'>
            ${this.choices[i]}
          </div>`;
        alternate_index++;
      }
    }
    this.target.find(".select_interpretation").html(html);
  },
  interpretation_logic: "Highlights the result of the alternative selection to dropdown. Hover to see alternative output.",
  submit: function() {
    checked_val = this.target.find("option:selected").val();
    if (checked_val) {
      this.io_master.input(this.id, this.choices[checked_val]);
    }
  },
  clear: function() {
    this.target.find("option").prop("selected", false);    
    this.target.find(".dropdown").selectmenu("refresh");
    this.target.find(".select_interpretation").empty();    
  },
  load_example: function(data) {
    let child = this.choices.indexOf(data) + 1;
    this.target.find("option:nth-child(" + child + ")").prop("selected", true);
    this.target.find(".dropdown").selectmenu("refresh");
  }
}
