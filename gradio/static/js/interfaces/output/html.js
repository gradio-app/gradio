const html_output = {
  html: ``,
  init: function(opts) {
    this.target.css("height", "auto");
  },
  output: function(data) {
    this.target.html(data);
  },
  clear: function() {
    this.target.empty();
  }
}
