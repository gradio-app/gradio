const checkbox = {
  html: `
    <div class="checkbox_solo">
      <div class="interpretation"></div>
      <label class='holder'><input class="checkbox" type="checkbox">&nbsp;</label>
    </div>`,
  init: function(opts) {
    this.target.find("input").checkboxradio();    
  },
  show_interpretation: function(data) {
    this.target.find(".holder").hide();
    let html = ""
    for (let i = 0; i < data.length; i++) {
      html += `<div class='interpret_check' title='${data[i]}'
        style='background-color: ${getSaliencyColor(data[i])}'>
          ${["-", "+"][i]}
        </div>`
    }
    this.target.find(".interpretation").html(html);
  },
  submit: function() {
    let io = this;
    let is_checked = this.target.find("input").prop("checked")
    this.io_master.input(this.id, is_checked);
  },
  clear: function() {
    this.target.find(".holder").show();
    this.target.find(".interpretation").empty();    
    this.target.find("input").prop("checked", false);    
    this.target.find("input").button("refresh");  
  },
  load_example: function(data) {
    if (data) {
      this.target.find("input").prop("checked", true);
    } else {
      this.target.find("input").prop("checked", false);
    }
    this.target.find("input").button("refresh");  
  }
}
