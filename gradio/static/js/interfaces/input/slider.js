const slider = {
  html: `
    <div class="slider_container">
      <div class="slider">
        <div class="ui-slider-handle"></div>
      </div>
      <div class="interpret_range"></div>
    </div>
    `,
  init: function(opts) {
    let io = this;
    this.minimum = opts.minimum;
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
      step: opts.step,
      value: opts.default
    });
  },
  submit: function() {
    let value = this.slider.slider("value");
    this.io_master.input(this.id, parseFloat(value));
  },
  show_interpretation: function(data) {
    let html = ""
    for (let [i, value] of data.entries()) {
      html += `
        <div class='alternate'
          alternate_index=${i}
          style='background-color: ${getSaliencyColor(value)}'>
        </div>      `
    }
    this.target.find(".interpret_range").html(html);
  },
  interpretation_logic: "Highlights the result of the alternative values along slider. Hover to see alternative output.",
  clear: function() {
    this.load_example(this.minimum)
    this.target.find(".interpret_range").empty();
  },
  load_example: function(data) {
    this.target.find(".slider").slider("option", "value", data)
    this.target.find(".ui-slider-handle").text(data);
  }
}
