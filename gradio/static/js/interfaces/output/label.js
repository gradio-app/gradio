const label_output = {
  html: `
    <div class="output_class"></div>
    <div class="confidence_intervals"></div>
    `,
  init: function() {},
  output: function(data) {
    data = JSON.parse(data)
    this.target.find(".output_class").html(data["label"])
    this.target.find(".confidence_intervals").empty()
    if (data.confidences) {
      for (var i = 0; i < data.confidences.length; i++)
      {
        let c = data.confidences[i]
        let confidence = c["confidence"]
        this.target.find(".confidence_intervals").append(`<div class="confidence"><div class=
            "label">${c["label"]}</div><div class="level" style="flex-grow:
              ${confidence}">${Math.round(confidence * 100)}%</div></div>`)
      }
    }
  },
  submit: function() {
  },
  clear: function() {
    this.target.find(".output_class").empty();
    this.target.find(".confidence_intervals").empty();
  }
}
