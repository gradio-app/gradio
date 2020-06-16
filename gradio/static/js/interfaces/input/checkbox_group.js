const checkbox_group = {
  html: ``,
  init: function(opts) {
    this.target.css("height", "auto");
    this.choices = opts.choices;
    html = "<div class='checkbox_group'>"
    for ([index, choice] of opts.choices.entries()) {
      html += `
        <input id="${this.id}_${index}" type="checkbox" name="${this.id}" value="${index}">
        <label for="${this.id}_${index}">${choice}</label>`;
    }
    html += "</div>"
    this.target.html(html);
  },
  submit: function() {
    let io = this;
    let val_names = [];
    this.target.find("input:checked").each(function(_, item) {
      val_names.push(io.choices[$(item).val()])
    })
    this.io_master.input(this.id, val_names);
  },
  clear: function() {
    this.target.find("input").prop("checked", false);    
  }
}
