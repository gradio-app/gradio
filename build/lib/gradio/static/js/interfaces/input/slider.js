const slider = {
  html: `
    <div class="slider_container">
      <div class="slider">
        <div class="ui-slider-handle"></div>
      </div>
    </div>`,
  init: function(opts) {
    let io = this;
    this.minimum = opts.minimum;
    this.target.css("height", "auto");
    let difference = opts.maximum - opts.minimum;
    if (difference <= 1) {
      step = 0.01;
    } else if (difference <= 10) {
      step = 0.1;
    } else {
      step = 1;
    }
    var handle = this.target.find(".ui-slider-handle");
    this.slider = this.target.find(".slider").slider({
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        handle.text( ui.value );
      },
      min: opts.minimum,
      max: opts.maximum,
      step: step
    });
  },
  submit: function() {
    let value = this.slider.slider("value");
    this.io_master.input(this.id, parseFloat(value));
  },
  clear: function() {
    this.target.find("input").val(this.default);
  },
  load_example: function(data) {
    this.target.find(".slider").slider("option", "value", data)
    this.target.find(".ui-slider-handle").text(data);
  }
}
