const json_output = {
  html: `
  `,
  init: function(opts) {
    this.target.css("height", "auto");
  },
  output: function(data) {
    this.clear();
    jsonTree.create(data, this.target[0]);
  },
  clear: function() {
    this.target.empty();
  }
}
