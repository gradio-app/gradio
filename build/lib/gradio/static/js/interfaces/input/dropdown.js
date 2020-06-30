const dropdown = {
  html: ``,
  init: function(opts) {
    this.target.css("height", "auto");
    this.choices = opts.choices;
    html = "<select class='dropdown'>"
    for ([index, choice] of opts.choices.entries()) {
      html += `<option value="${index}">${choice}</option>`
    }
    html += "</select>"
    this.target.html(html);
  },
  submit: function() {
    checked_val = this.target.find("option:selected").val();
    if (checked_val) {
      this.io_master.input(this.id, this.choices[checked_val]);
    }
  },
  clear: function() {
    this.target.find("option").prop("selected", false);    
  },
  load_example: function(data) {
    let child = this.choices.indexOf(data) + 1;
    this.target.find("option:nth-child(" + child + ")").prop("selected", true);
  }
}
