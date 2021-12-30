import React from "react";
import BaseComponent from "../base_component";
import FileComponentExample from "../component_example";
import { CSVToArray } from "../../utils";
import { Scatter } from "react-chartjs-2";
import { getNextColor } from "../../utils";

class TimeseriesInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.uploader = React.createRef();
  }
  handleChange = (data) => {
    this.props.handleChange(data);
  };
  openFileUpload = () => {
    this.uploader.current.click();
  };
  render = () => {
    let no_action = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    if (this.props.value !== null) {
      return (
        <div className="input_timeseries">
          <Scatter
            data={{
              datasets: this.props.y.map((header, i) => {
                return {
                  label: header,
                  borderColor: getNextColor(i),
                  showLine: true,
                  fill: true,
                  backgroundColor: getNextColor(i, 0.25),
                  data: this.props.value["data"].map((row) => {
                    return {
                      x: row[0],
                      y: row[i + 1]
                    };
                  })
                };
              })
            }}
          />
        </div>
      );
    } else {
      return (
        <div
          className="input_timeseries"
          onDrag={no_action}
          onDragStart={no_action}
          onDragEnd={no_action}
          onDragOver={no_action}
          onDragEnter={no_action}
          onDragLeave={no_action}
          onDrop={no_action}
        >
          <div
            className="upload_zone"
            onClick={this.openFileUpload}
            onDrop={this.load_preview_from_drop}
          >
            Upload Timeseries CSV
            {this.props.x !== null ? (
              <>
                <br />X Column: {this.props.x}
                <br />Y Column: {this.props.y.join(", ")}
              </>
            ) : (
              false
            )}
          </div>
          <input
            className="hidden_upload"
            type="file"
            multiple={this.props.file_count === "multiple"}
            webkitdirectory={this.props.file_count === "directory"}
            mozdirectory={this.props.file_count === "directory"}
            ref={this.uploader}
            onChange={this.load_preview_from_upload}
            style={{ display: "none" }}
          />
        </div>
      );
    }
  };
  load_preview_from_drop = (evt) => {
    this.load_preview_from_files(evt.dataTransfer.files);
  };
  load_preview_from_upload = (evt) => {
    this.load_preview_from_files(evt.target.files);
  };
  load_file = (reader) => {
    let lines = reader.result;
    this.handleChange(load_data(lines, this.props.x, this.props.y));
  };
  load_preview_from_files = (files) => {
    if (!files.length || !window.FileReader) {
      return;
    }
    this.file_data = [];
    for (let file of files) {
      let ReaderObj = new FileReader();
      ReaderObj.readAsBinaryString(file);
      ReaderObj.onloadend = this.load_file.bind(this, ReaderObj);
    }
  };
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

class TimeseriesInputExample extends FileComponentExample {
  static async preprocess(x, examples_dir, component_config) {
    let file_url = examples_dir + "/" + x;
    let response = await fetch(file_url);
    response = await response.text();
    return load_data(response, component_config.x, component_config.y);
  }
  render() {
    return <div className="input_file_example">{this.props.value}</div>;
  }
}

var load_data = (lines, x, y) => {
  let headers = null;
  let data = null;
  let line_array = CSVToArray(lines);
  if (line_array.length === 0) {
    return;
  }
  if (x === null) {
    data = line_array;
  } else {
    let x_index = line_array[0].indexOf(x);
    let y_indices = y.map((y_col) => line_array[0].indexOf(y_col));
    if (x_index === -1) {
      alert("Missing x column: " + x);
      return;
    }
    if (y_indices.includes(-1)) {
      alert("Missing y column: " + y[y_indices.indexOf(-1)]);
      return;
    }
    line_array = line_array.map((line) =>
      [line[x_index]].concat(y_indices.map((y_index) => line[y_index]))
    );
    headers = line_array[0];
    data = line_array.slice(1);
  }
  return { headers: headers, data: data, range: null };
};

export { TimeseriesInput, TimeseriesInputExample };
