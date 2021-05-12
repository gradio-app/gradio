import React from 'react';

class LabelOutput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.value == null) {
      return false;
    }
    let [labels, confidences] = [[], []];
    if ("confidences" in this.props.value) {
      for (let label_confidence of this.props.value["confidences"]) {
        let confidence = Math.round(label_confidence.confidence * 100) + "%";
        labels.push(<div className="label" title={label_confidence.label}>
          {label_confidence.label}
        </div>);
        confidences.push(<div className="confidence" title={confidence} style={{
          minWidth: "calc(" + confidence + " - 12px)"
        }}>{confidence}</div>)
      }
    }
    return (<div class="output_label">
      <div className="output_class">{this.props.value["label"]}</div>
      <div className="confidence_intervals">
        <div className="labels" style={{ maxWidth: "120px"}}>{labels}</div>
        <div className="confidences">{confidences}</div>
      </div>
    </div>)
  }
  static load_example(example_data) {
    this.output(this.convert_example_to_output(example_data));
  }
  load_example_preview(example_data) {
    let output = this.convert_example_to_output(example_data);
    if ("confidences" in output) {
      if (typeof example_data == "string") {
        try {
          example_data = JSON.parse(example_data);
        } catch (e) {
          return output["label"]
        }
      }
      return output["label"] + " (" + (100 * example_data[output["label"]]).toFixed(2) + "%)";
    }
    return output["label"]
  }
  static convert_example_to_output(example_data) {
    if (typeof example_data == "string") {
      try {
        example_data = JSON.parse(example_data);
      } catch (e) {
        return {"label": example_data};
      }
    }
    let [max_label, max_confidence] = ["", 0]
    let output = {"confidences": []}
    for (let [label, confidence] of Object.entries(example_data)) {
      output["confidences"].push({"label": label, "confidence": confidence});
      if (confidence > max_confidence) {
        max_confidence = confidence;
        max_label = label;
      }
    }
    output["label"] = max_label;
    return output;
  }  
  // load_example_preview(data) {
  //   if (typeof data == "string" && data.length > 20) {
  //     return data.substring(0,20) + "...";
  //   }
  //   return data;
  // }
}

export default LabelOutput;
