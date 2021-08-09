import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { CSVToArray } from "../../utils";
import Plot from "react-plotly.js";

class TimeseriesInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.uploader = React.createRef();
    this.openFileUpload = this.openFileUpload.bind(this);
    this.load_preview_from_files = this.load_preview_from_files.bind(this);
    this.load_preview_from_upload = this.load_preview_from_upload.bind(this);
    this.load_preview_from_drop = this.load_preview_from_drop.bind(this);
  }
  handleChange(data) {
    this.props.handleChange(data);
  }
  openFileUpload() {
    this.uploader.current.click();
  }
  render() {
    let no_action = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    if (this.props.value !== null) {
      let file = this.props.value[0];
      return (
        <div className="input_timeseries">
          <Plot
            data={this.state.y_indices.map((y_index, i) => {
              return {
                x: this.props.value["data"].map(
                  (row) => row[this.state.x_index]
                ),
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
            onRelayout={(figure) => {
              if ("xaxis.range[0]" in figure) {
                this.props.handleChange(
                  Object.assign({}, this.props.value, {
                    range: [figure["xaxis.range[0]"], figure["xaxis.range[1]"]]
                  })
                );
              } else {
                this.props.handleChange(
                  Object.assign({}, this.props.value, {
                    range: null
                  })
                );
              }
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
  }
  load_preview_from_drop(evt) {
    this.load_preview_from_files(evt.dataTransfer.files);
  }
  load_preview_from_upload(evt) {
    this.load_preview_from_files(evt.target.files);
  }
  load_file(reader) {
    let lines = reader.result;
    let headers = null;
    let data = null;
    if (lines && lines.length > 0) {
      let line_array = CSVToArray(lines);
      if (line_array.length === 0) {
        return;
      }
      if (this.props.x === null) {
        this.setState({ x_index: 0, y_indices: [1] });
        data = line_array;
      } else {
        let x_index = line_array[0].indexOf(this.props.x);
        let y_indices = this.props.y.map((y_col) =>
          line_array[0].indexOf(y_col)
        );
        if (x_index === -1) {
          alert("Missing x column: " + this.props.x);
          return;
        }
        if (y_indices.includes(-1)) {
          alert("Missing y column: " + this.props.y[y_indices.indexOf(-1)]);
          return;
        }
        this.setState({ x_index: x_index, y_indices: y_indices });
        headers = line_array[0];
        data = line_array.slice(1);
      }
      this.handleChange({ headers: headers, data: data, range: null });
    }
  }
  load_preview_from_files(files) {
    if (!files.length || !window.FileReader) {
      return;
    }
    this.file_data = [];
    for (let file of files) {
      let ReaderObj = new FileReader();
      ReaderObj.readAsBinaryString(file);
      ReaderObj.onloadend = this.load_file.bind(this, ReaderObj);
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

class TimeseriesInputExample extends ComponentExample {
  render() {
    return <div className="input_file_example">{this.props.value}</div>;
  }
}

export { TimeseriesInput, TimeseriesInputExample };
