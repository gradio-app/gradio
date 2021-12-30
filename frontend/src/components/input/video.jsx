import React from "react";
import BaseComponent from "../base_component";
import { FileComponentExample } from "../component_example";
import { isPlayable } from "../../utils";
import clear_icon from "../../static/img/clear.svg";

class VideoInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.uploader = React.createRef();
    this.videoRecorder = React.createRef();
    this.openFileUpload = this.openFileUpload.bind(this);
    this.load_preview_from_files = this.load_preview_from_files.bind(this);
    this.load_preview_from_upload = this.load_preview_from_upload.bind(this);
    this.load_preview_from_drop = this.load_preview_from_drop.bind(this);
    this.camera_stream = null;
    this.state = {
      recording: false
    };
  }
  handleChange(evt) {
    this.props.handleChange(evt.target.value);
  }
  openFileUpload() {
    this.uploader.current.click();
  }
  record = async () => {
    if (this.state.recording) {
      this.media_recorder.stop();
      let video_blob = new Blob(this.blobs_recorded, { type: this.mimeType });
      var ReaderObj = new FileReader();
      ReaderObj.onload = function (e) {
        let file_name = "sample." + this.mimeType.substring(6);
        this.props.handleChange({
          name: file_name,
          data: e.target.result,
          is_example: false
        });
      }.bind(this);

      ReaderObj.readAsDataURL(video_blob);
      this.setState({ recording: false });
    } else {
      this.blobs_recorded = [];
      this.camera_stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.videoRecorder.current.srcObject = this.camera_stream;
      this.videoRecorder.current.volume = 0;
      let selectedMimeType = null;
      let validMimeTypes = ["video/webm", "video/mp4"];
      for (let mimeType of validMimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      if (selectedMimeType === null) {
        console.error("No supported MediaRecorder mimeType");
        return;
      }
      this.media_recorder = new MediaRecorder(this.camera_stream, {
        mimeType: selectedMimeType
      });
      this.mimeType = selectedMimeType;
      this.media_recorder.addEventListener(
        "dataavailable",
        function (e) {
          this.blobs_recorded.push(e.data);
        }.bind(this)
      );
      this.media_recorder.start(200);
      this.videoRecorder.current.play();
      this.setState({ recording: true });
    }
  };
  render() {
    let no_action = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    if (this.props.value != null) {
      return (
        <div className="input_video">
          <div className="edit_buttons">
            <button
              className="clear_button"
              onClick={this.props.handleChange.bind(this, null)}
            >
              <img src={clear_icon} />
            </button>
          </div>
          {isPlayable("video", this.props.value["name"]) ? (
            <div className="video_preview_holder">
              <video
                className="video_preview"
                controls
                playsInline
                preload
                src={this.props.value["data"]}
              ></video>
            </div>
          ) : (
            <div className="video_file_holder">{this.props.value["name"]}</div>
          )}
        </div>
      );
    } else if (this.props.source == "upload") {
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
    } else if (this.props.source == "webcam") {
      return (
        <div className="input_video">
          <video
            ref={this.videoRecorder}
            class="video_recorder"
            autoPlay
            playsInline
            muted
          ></video>
          <div class="record_holder">
            <div class="record_message">
              {this.state.recording ? (
                <>Stop Recording</>
              ) : (
                <>Click to Record</>
              )}
            </div>
            <button class="record" onClick={this.record}></button>
          </div>
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
