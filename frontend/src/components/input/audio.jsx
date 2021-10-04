import React from "react";
import BaseComponent from "../base_component";
import { DataURLComponentExample } from "../component_example";
import Recorder from "recorder-js";
import { getSaliencyColor } from "../../utils";

class AudioInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      recording: false
    };
    this.src = {};
    this.key = 0; // needed to prevent audio caching

    this.uploader = React.createRef();
    this.started = false;
  }
  start = () => {
    if (!this.started) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.recorder = new Recorder(audioContext);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.recorder.init(stream);
          this.recorder.start();
        });
      this.started = true;
    } else {
      this.recorder.start();
    }
    this.setState({
      recording: true
    });
  };
  stop = () => {
    this.recorder.stop().then(({ blob, buffer }) => {
      let reader = new FileReader();
      reader.onload = function (e) {
        this.props.handleChange({
          "name": "sample.wav",
          "data": e.target.result
        });
      }.bind(this);
      reader.readAsDataURL(blob);
    })
    this.setState({
      recording: false
    });
  };
  openFileUpload = () => {
    this.uploader.current.click();
  };
  render() {
    if (this.props.value !== null) {
      if (this.props.value["name"] != this.src["name"] ||
        this.props.value["data"] !== this.src["data"]) {
        this.key += 1;
        this.src = {
          "name": this.props.value["name"],
          "data": this.props.value["data"]
        };
      }
      return (
        <div className="input_audio">
          <audio controls key={this.key}>
            <source src={this.props.value["data"]}></source>
          </audio>
          {this.props.interpretation === null ? (
            false
          ) : (
            <div class="interpret_range">
              {this.props.interpretation.map((value) => (
                <div
                  style={{ "background-color": getSaliencyColor(value) }}
                ></div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      if (this.props.source === "microphone") {
        return (
          <div className="input_audio">
            {this.state.recording ? (
              <button className="stop" onClick={this.stop}>
                Recording...
              </button>
            ) : (
              <button className="start" onClick={this.start}>
                Record
              </button>
            )}
          </div>
        );
      } else if (this.props.source === "upload") {
        let no_action = (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
        };
        return (
          <div
            className="input_image"
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
              Drop Audio Here
              <br />- or -<br />
              Click to Upload
            </div>
            <input
              className="hidden_upload"
              type="file"
              ref={this.uploader}
              onChange={this.load_preview_from_upload}
              accept="audio/*"
              style={{ display: "none" }}
            />
          </div>
        );
      }
    }
  }
  load_preview_from_drop = (evt) => {
    this.load_preview_from_files(evt.dataTransfer.files);
  };
  load_preview_from_upload = (evt) => {
    this.load_preview_from_files(evt.target.files);
  };
  load_preview_from_files = (files) => {
    if (!files.length || !window.FileReader) {
      return;
    }
    var component = this;
    var ReaderObj = new FileReader();
    let file = files[0];
    ReaderObj.readAsDataURL(file);
    ReaderObj.onloadend = function () {
      component.props.handleChange({ "name": file.name, "data": this.result });
    };
  };
}

class AudioInputExample extends DataURLComponentExample {
  render() {
    return <div className="input_audio_example">{this.props.value}</div>;
  }
}

export { AudioInput, AudioInputExample };
