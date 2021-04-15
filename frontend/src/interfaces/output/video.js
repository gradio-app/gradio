const video_output = {
  html: `
    <div class="view_holder_parent">
    <div class="view_holders">
        <div class="output_image_holder hide">
          <video controls class="output_image">
        </div>
      </div>
    </div>      
    `,
  init: function(opts) {},
  output: function(data) {
    this.target.find(".view_holder_parent").addClass("interface_box");
    this.target.find(".output_image_holder").removeClass("hide");
    this.target.find(".output_image").attr('src', data);
    console.log(data);
  },
  clear: function() {
    this.target.find(".view_holder_parent").removeClass("interface_box");
    this.target.find(".output_image_holder").addClass("hide");
    this.target.find(".output_image").attr('src', "")
  },
  load_example: function(example_data) {
    example_data = this.io_master.example_file_path + example_data;
    let io = this;
    toDataURL(example_data, function(data) {
      io.target.find(".upload_zone").hide();
      io.target.find(".image_display").removeClass("hide");
      io.output(data);
    })
  }
}
