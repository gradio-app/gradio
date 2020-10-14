const slider = {
  html: `
    <div class="slider_container">
      <div class="slider">
        <div class="ui-slider-handle"></div>
      </div>
    </div>
    <div class="interpret_range"></div>
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
      step: opts.step
    });
  },
  submit: function() {
    let value = this.slider.slider("value");
    this.io_master.input(this.id, parseFloat(value));
  },
  show_interpretation: function(data) {
    this.target.find(".slider_container").hide();
    let html = ""
    for (let value of data) {
      html += `
        <div title="${value}"
          style='background-color: ${getSaliencyColor(value)}'>
        </div>      `
    }
    this.target.find(".interpret_range").html(html);
  },
  clear: function() {
    this.target.find("input").val(this.default);
    this.target.find(".slider_container").show();
    this.target.find(".interpret_range").empty();
  },
  load_example: function(data) {
    this.target.find(".slider").slider("option", "value", data)
    this.target.find(".ui-slider-handle").text(data);
  }
}
