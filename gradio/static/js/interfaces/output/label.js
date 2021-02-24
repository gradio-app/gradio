const label_output = {
  html: `
    <div class="output_class"></div>
    <div class="confidence_intervals">
      <div class="labels"></div>
      <div class="confidences"></div>
    </div>
    `,
  init: function(opts) {},
  output: function(data) {
    this.target.find(".output_class").html(data["label"])
    this.target.find(".confidence_intervals > div").empty()
    if ("confidences" in data) {
      for (var i = 0; i < data.confidences.length; i++)
      {
        let c = data.confidences[i]
        let label = c["label"]
        let confidence = Math.round(c["confidence"] * 100) + "%";
        this.target.find(".labels").append(`<div class="label" title="${label}">${label}</div>`);
        this.target.find(".confidences").append(`
          <div class="confidence" style="min-width: calc(${confidence} - 12px);" title="${confidence}">${confidence}</div>`);
      }
    }
  },
  load_example: function(data) {
    this.output(this.convert_example_to_output(data));
  },
  load_example_preview: function(data) {
    let output = this.convert_example_to_output(data);
    if ("confidences" in output) {
      if (typeof data == "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return output["label"]
        }
      }
      return output["label"] + " (" + (100 * data[output["label"]]).toFixed(2) + "%)";
    }
    return output["label"]
  },
  convert_example_to_output: function(data) {
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return {"label": data};
      }
    }
    let [max_label, max_confidence] = ["", 0]
    let output = {"confidences": []}
    for (let [label, confidence] of Object.entries(data)) {
      output["confidences"].push({"label": label, "confidence": confidence});
      if (confidence > max_confidence) {
        max_confidence = confidence;
        max_label = label;
      }
    }
    output["label"] = max_label;
    return output;
  },
  clear: function() {
    this.target.find(".output_class").empty();
    this.target.find(".confidence_intervals > div").empty();
  }
}
