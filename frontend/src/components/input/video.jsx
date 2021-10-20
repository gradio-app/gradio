import React from "react";
import BaseComponent from "../base_component";
import { FileComponentExample } from "../component_example";
import { isPlayable } from "../../utils";
import edit_icon from "../../static/img/edit.svg";
import clear_icon from "../../static/img/clear.svg";

class VideoInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.uploader = React.createRef();
    this.openFileUpload = this.openFileUpload.bind(this);
    this.load_preview_from_files = this.load_preview_from_files.bind(this);
    this.load_preview_from_upload = this.load_preview_from_upload.bind(this);
    this.load_preview_from_drop = this.load_preview_from_drop.bind(this);
  }
  handleChange(evt) {
    this.props.handleChange(evt.target.value);
  }
  openFileUpload() {
    this.uploader.current.click();
  }
  render() {
    let no_action = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    if (this.props.value != null) {
      return <div className="input_video">
        <div className="edit_buttons">
          <button className="edit_button">
            <img src={edit_icon} />
          </button>
          <button className="clear_button" onClick={this.props.handleChange.bind(this, null)}>
            <img src={clear_icon} />
          </button>
        </div>
        {isPlayable("video", this.props.value["name"]) ? <div className="video_preview_holder">
          <video
            className="video_preview"
            controls
            src={this.props.value["data"]}
          ></video>
        </div> : <div className="video_file_holder">{this.props.value["name"]}</div>}
      </div>
    } else {
      return (
        <div
          className="input_video"
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
            Drop Video Here
            <br />- or -<br />
            Click to Upload
          </div>
          <input
            className="hidden_upload"
            type="file"
            ref={this.uploader}
            onChange={this.load_preview_from_upload}
            accept="video/mp4,video/x-m4v,video/*"
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
  load_preview_from_files(files) {
    if (!files.length || !window.FileReader || !/^video/.test(files[0].type)) {
      return;
    }
    var component = this;
    var ReaderObj = new FileReader();
    let file = files[0];
    ReaderObj.readAsDataURL(file);
    ReaderObj.onloadend = function () {
      component.props.handleChange({
        name: file.name,
        data: this.result,
        is_example: false
      });
    };
  }
}

class VideoInputExample extends FileComponentExample {
  constructor(props) {
    super(props);
    this.video = React.createRef();
  }
  render() {
    if (isPlayable("video", this.props.value)) {
      return (
        <div className="input_video_example">
          <div className="video_holder">
            <video
              ref={this.video}
              className="video_preview"
              onMouseOver={() => {
                this.video.current.play();
              }}
              onMouseOut={() => {
                this.video.current.pause();
              }}
              preload="metadata"
            >
              <source
                src={this.props.examples_dir + "/" + this.props.value}
              ></source>
            </video>
          </div>
        </div>
      );
    } else {
      return <div className="input_video_example">{this.props.value}</div>;
    }
  }
}

export { VideoInput, VideoInputExample };
