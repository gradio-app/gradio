const radio = {
  html: ``,
  init: function(opts) {
    this.target.css("height", "auto");
    this.choices = opts.choices;
    html = "<div class='radio_group'>"
    for ([index, choice] of opts.choices.entries()) {
      html += `
        <input id="${this.id}_${index}" type="radio" name="${this.id}" value="${index}">
        <label for="${this.id}_${index}">${choice}</label>`;
    }
    html += "</div>"
    this.target.html(html);
  },
  submit: function() {
    checked_val = this.target.find("input:checked").val();
    if (checked_val) {
      this.io_master.input(this.id, this.choices[checked_val]);
    }
  },
  clear: function() {
    this.target.find("input").prop("checked", false);    
  },
  load_example: function(data) {
    let child = this.choices.indexOf(data) + 1;
    this.target.find("input:nth-child("+child+")").prop("checked", true);
  }
}
