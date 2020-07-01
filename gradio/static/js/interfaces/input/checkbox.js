const checkbox = {
  html: `<input class="checkbox" type="checkbox">`,
  init: function(opts) {
    this.target.css("height", "auto");
  },
  submit: function() {
    let io = this;
    let is_checked = this.target.find("input").prop("checked")
    this.io_master.input(this.id, is_checked);
  },
  clear: function() {
    this.target.find("input").prop("checked", false);    
  },
  load_example: function(data) {
    if (data) {
      this.target.find("input").prop("checked", true);
    } else {
      this.target.find("input").prop("checked", false);
    }
  }
}
