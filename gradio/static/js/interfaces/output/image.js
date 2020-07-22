const image_output = {
  html: `
      <div class="output_image_holder">
        <img class="output_image" />
      </div>
    `,
  init: function(opts) {},
  output: function(data) {
    this.target.find(".output_image").attr('src', data).show();
  },
  clear: function() {
    this.target.find(".output_image").attr('src', "").hide();
  }
}
