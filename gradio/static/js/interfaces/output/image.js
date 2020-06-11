const image_output = {
  html: `
      <img class="output_image" />
    `,
  init: function(opts) {},
  output: function(data) {
    this.target.find(".output_image").attr('src', data).show();
  },
  clear: function() {
    this.target.find(".output_image").attr('src', "").hide();
  }
}
