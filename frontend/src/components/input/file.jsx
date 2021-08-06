import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { prettyBytes } from "../../utils";

class FileInput extends BaseComponent {
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
    let file_name, file_size;
    if (this.props.value !== null) {
      if (this.props.file_count === "single") {
        let file = this.props.value[0];
        file_name = file.name;
        file_size = file.size;
      } else {
        file_name = this.props.value.length + " files.";
        file_size = 0;
        for (let file of this.props.value) {
          if (file.size === null) {
            file_size = null;
            break;
          } else {
            file_size += file.size;
          }
        }
      }
      return (
        <div className="input_file">
          <div className="file_preview_holder">
            <div className="file_name">{file_name}</div>
            <div className="file_size">
              {file_size === null ? "" : prettyBytes(file_size)}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="input_file"
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
            Drop File Here
            <br />- or -<br />
            Click to Upload
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
  add_file_to_list(reader, file, file_count) {
    this.file_data.push({
      name: file.name,
      size: file.size,
      data: reader.result,
      is_local_example: false,
    });
    if (this.file_data.length === file_count) {
      this.handleChange(this.file_data);
    }
  }
  load_preview_from_files(files) {
    if (!files.length || !window.FileReader) {
      return;
    }
    this.file_data = [];
    for (let file of files) {
      let ReaderObj = new FileReader();
      ReaderObj.readAsDataURL(file);
      ReaderObj.onloadend = this.add_file_to_list.bind(
        this,
        ReaderObj,
        file,
        files.length
      );
    }
  }
}

class FileInputExample extends ComponentExample {
  render() {
    return <div className="input_file_example">{this.props.value}</div>;
  }
}

export { FileInput, FileInputExample };
