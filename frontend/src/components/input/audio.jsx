import React from "react";
import BaseComponent from "../base_component";
import { DataURLComponentExample } from "../component_example";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import { getSaliencyColor } from "../../utils";

class AudioInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      recordState: RecordState.STOP,
    };
    this.src = null;
    this.key = 0; // needed to prevent audio caching

    this.uploader = React.createRef();
  }
  start = () => {
    this.setState({
      recordState: RecordState.START,
    });
  };
  stop = () => {
    this.setState({
      recordState: RecordState.STOP,
    });
  };
  onStop = (audioData) => {
    let reader = new FileReader();
    reader.onload = function (e) {
      this.props.handleChange(e.target.result);
    }.bind(this);
    reader.readAsDataURL(audioData.blob);
  };
  openFileUpload = () => {
    this.uploader.current.click();
  };
  render() {
    if (this.props.value !== null) {
      if (this.props.value !== this.src) {
        this.key += 1;
        this.src = this.props.value;
      }
      return (
        <div className="input_audio">
          <audio controls key={this.key}>
            <source src={this.props.value}></source>
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
            <AudioReactRecorder
              state={this.state.recordState}
              onStop={this.onStop}
            />
            {this.state.recordState === RecordState.STOP ? (
              <button className="start" onClick={this.start}>
                Record
              </button>
            ) : (
              <button className="stop" onClick={this.stop}>
                Recording...
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
    ReaderObj.readAsDataURL(files[0]);
    ReaderObj.onloadend = function () {
      component.props.handleChange(this.result);
    };
  };
}

class AudioInputExample extends DataURLComponentExample {
  render() {
    return <div className="input_audio_example">{this.props.value}</div>;
  }
}

export { AudioInput, AudioInputExample };
