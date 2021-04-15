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
        labels.push(<div className="label" title={label_confidence.label}>{label_confidence.label}</div>);
        confidences.push(<div className="confidence" style={{minWidth: "calc(" + confidence + " - 12px)", title: confidence}}>{confidence}</div>)
      }
    }
    return (<div>
      <div className="output_class">{this.props.value["label"]}</div>
      <div className="confidence_intervals">
        <div className="labels">{labels}</div>
        <div className="confidences">{confidences}</div>
      </div>
    </div>)
  }
  // load_example_preview(data) {
  //   if (typeof data == "string" && data.length > 20) {
  //     return data.substring(0,20) + "...";
  //   }
  //   return data;
  // }
}

export default LabelOutput;
