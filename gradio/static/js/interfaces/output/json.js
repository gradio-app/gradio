const json_output = {
  html: `
  `,
  init: function(opts) {
  },
  output: function(data) {
    this.clear();
    jsonTree.create(data, this.target[0]);
  },
  clear: function() {
    this.target.empty();
  },
  load_example_preview: function(data) {
    json_string = JSON.stringify(data);
    if (json_string.length > 20) {
      return json_string.substring(0, 20) + "...";
    } else {
      return json_string;
    }
  },
}
