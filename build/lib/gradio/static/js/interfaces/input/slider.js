const slider = {
  html: `
    <div class="slider_container">
      <span class="min"></span>
      <input type="range" class="slider">
      <span class="max"></span>:
      <div class="value"></div>
    </div>`,
  init: function(opts) {
    let io = this;
    this.minimum = opts.minimum;
    this.target.css("height", "auto");
    this.target.find(".min").text(opts.minimum);
    this.target.find(".max").text(opts.maximum);
    this.target.find(".value").text(opts.default);
    let difference = opts.maximum - opts.minimum;
    if (difference <= 1) {
      step = 0.01;
    } else if (difference <= 10) {
      step = 0.1;
    } else {
      step = 1;
    }
    this.target.find(".slider")
      .attr("min", opts.minimum)
      .attr("max", opts.maximum)
      .attr("value", opts.default)
      .attr("step", step)
      .on("change", function() {
        io.target.find(".value").text($(this).val());
      }).change()
  },
  submit: function() {
    let value = this.target.find("input").val();
    this.io_master.input(this.id, parseFloat(value));
  },
  clear: function() {
    this.target.find("input").val(this.default);
  },
  load_example: function(data) {
    this.target.find("input").val(data);   
    this.target.find(".value").text(data);
  }
}
