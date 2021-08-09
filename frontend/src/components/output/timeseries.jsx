import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import Plot from "react-plotly.js";

class TimeseriesOutput extends BaseComponent {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.value !== null) {
      let y_indices = this.props.y.map((header) =>
        this.props.value.headers.indexOf(header)
      );
      let x_index = this.props.value.headers.indexOf(this.props.x);
      return (
        <div className="output_timeseries">
          <Plot
            data={y_indices.map((y_index, i) => {
              return {
                x: this.props.value["data"].map((row) => row[x_index]),
                y: this.props.value["data"].map((row) => row[y_index]),
                type: "line",
                name: this.props.y[i]
              };
            })}
            layout={{
              autosize: true
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      );
    } else {
      return false;
    }
  }
  static memo = (a, b) => {
    if (a.value instanceof Object && b.value instanceof Object) {
      return (
        a.value["data"] === b.value["data"] &&
        a.value["headers"] === b.value["headers"]
      );
    } else {
      return a === b;
    }
  };
}

class TimeseriesOutputExample extends ComponentExample {
  render() {
    return <div className="input_file_example">{this.props.value}</div>;
  }
}

export { TimeseriesOutput, TimeseriesOutputExample };
