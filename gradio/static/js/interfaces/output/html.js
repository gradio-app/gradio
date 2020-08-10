const html_output = {
  html: ``,
  init: function(opts) {
  },
  output: function(data) {
    this.target.html(data);
  },
  clear: function() {
    this.target.empty();
  }
}
