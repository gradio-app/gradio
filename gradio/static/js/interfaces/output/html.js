const html_output = {
  html: ``,
  init: function(opts) {
  },
  output: function(data) {
    this.target.html(data);
  },
  clear: function() {
    this.target.empty();
  },
  load_example_preview: function(data) {
    return "[html]";
  },
}
