import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { Scatter } from "react-chartjs-2";
import { getNextColor } from "../../utils";

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
          <Scatter
            data={{
              datasets: y_indices.map((y_index, i) => {
                return {
                  label: this.props.value.headers[y_index],
                  borderColor: getNextColor(i),
                  showLine: true,
                  fill: true,
                  backgroundColor: getNextColor(i, 0.25),
                  data: this.props.value["data"].map((row) => {
                    return {
                      x: row[x_index],
                      y: row[y_index]
                    };
                  })
                };
              })
            }}
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
