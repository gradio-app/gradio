const dropdown = {
  html: `
    <div class="select_holder"></div>
    <div class="interpretation"></div>
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
    this.target.find(".select_holder").hide();
    let html = ""
    for (let i = 0; i < this.choices.length; i++) {
      html += `
        <div title='${data[i]}' style='background-color: ${getSaliencyColor(data[i])}'>
          ${this.choices[i]}
        </div>      `
    }
    this.target.find(".interpretation").html(html);
  },
  submit: function() {
    checked_val = this.target.find("option:selected").val();
    if (checked_val) {
      this.io_master.input(this.id, this.choices[checked_val]);
    }
  },
  clear: function() {
    this.target.find("option").prop("selected", false);    
    this.target.find(".select_holder").show();
    this.target.find(".interpretation").empty();    
  },
  load_example: function(data) {
    let child = this.choices.indexOf(data) + 1;
    this.target.find("option:nth-child(" + child + ")").prop("selected", true);
    this.target.find(".dropdown").selectmenu("refresh");
  }
}
