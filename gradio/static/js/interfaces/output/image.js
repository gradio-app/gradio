const image_output = {
  html: `
      <img class="output_image" />
    `,
  init: function() {},
  output: function(data) {
    this.target.find(".output_image").attr('src', data).show();
  },
  submit: function() {
    this.target.find(".output_image").attr('src', 'static/img/logo_loading.gif').show();
  },
  clear: function() {
    this.target.find(".output_image").attr('src', "").hide();
  }
}
