import React from "react";
import BaseComponent from "../base_component";
import { FileComponentExample } from "../component_example";
import Recorder from "recorder-js";
import { getSaliencyColor } from "../../utils";
import classNames from "classnames";
import edit_icon from "../../static/img/edit.svg";
import clear_icon from "../../static/img/clear.svg";
import MultiRangeSlider from "./../../vendor/MultiRangeSlider/MultiRangeSlider";

class AudioInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      editorMode: false
    };
    this.src = {};
    this.key = 0; // needed to prevent audio caching

    this.uploader = React.createRef();
    this.audioRef = React.createRef();
    this.started = false;
  }
  static memo = (a, b) => {
    if (a.value instanceof Object && b.value instanceof Object) {
      return (
        a.value["name"] === b.value["name"] &&
        a.value["data"] === b.value["data"] &&
        a.value["crop_min"] === b.value["crop_min"] &&
        a.value["crop_max"] === b.value["crop_max"]
      );
    } else {
      return a === b;
    }
  };
  start = () => {
    if (!this.started) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.recorder = new Recorder(audioContext);
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
          name: "sample.wav",
          data: e.target.result,
          is_example: false
        });
      }.bind(this);
      reader.readAsDataURL(blob);
    });
    this.setState({
      recording: false
    });
  };
  openFileUpload = () => {
    this.uploader.current.click();
  };
  toggleEditor = () => {
    let [crop_min, crop_max] = [0, 100];
    this.props.handleChange({
      name: this.props.value["name"],
      data: this.props.value["data"],
      is_example: this.props.value["is_example"],
      crop_min: crop_min,
      crop_max: crop_max,
    });
    this.setState({ editorMode: !this.state.editorMode })
  }
  crop = (min, max, lastChange) => {
    if (this.state.duration) {
      if (lastChange === "min") {
        this.audioRef.current.currentTime = (min / 100.) * this.state.duration;
      } else {
        this.audioRef.current.currentTime = (max / 100.) * this.state.duration;
      }
    }
    this.props.handleChange({
      name: this.props.value["name"],
      data: this.props.value["data"],
      is_example: this.props.value["is_example"],
      crop_min: min,
      crop_max: max,
    })
  }
  reset_playback_within_crop = () => {
    let position_ratio = this.audioRef.current.currentTime / this.state.duration;
    let min_ratio = this.props.value.crop_min / 100;
    let max_ratio = this.props.value.crop_max / 100;
    if ((position_ratio > max_ratio - 0.00001) || (position_ratio < min_ratio - 0.00001)) {
      this.audioRef.current.currentTime = this.state.duration * min_ratio;
      return true;
    } else {
      return false;
    }
  }
  render() {
    if (this.props.value !== null) {
      if (
        this.props.value["name"] != this.src["name"] ||
        this.props.value["data"] !== this.src["data"]
      ) {
        this.key += 1;
        this.src = {
          name: this.props.value["name"],
          data: this.props.value["data"]
        };
      }
      return (
        <div className="input_audio">
          <div className="edit_buttons">
            <button
              className={classNames("edit_button", { "active": this.state.editorMode })}
              onClick={this.toggleEditor}
            >
              <img src={edit_icon} />
            </button>
            <button className="clear_button" onClick={this.props.handleChange.bind(this, null)}>
              <img src={clear_icon} />
            </button>
          </div>
          <audio controls key={this.key} ref={this.audioRef}
            onLoadedMetadata={e => this.setState({ duration: e.nativeEvent.target.duration })}
            onPlay={() => {
              this.reset_playback_within_crop();
              this.audioRef.current.play();
            }}
            onTimeUpdate={() => {
              if (this.audioRef.current.paused) {
                return;
              }
              let out_of_crop = this.reset_playback_within_crop();
              if (out_of_crop) {
                this.audioRef.current.pause();
              }
            }}
          >
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
          {this.state.editorMode ?
            <MultiRangeSlider min={0} max={100} onChange={({ min, max, lastChange }) => this.crop(min, max, lastChange)} />
            : false}
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
      component.props.handleChange({
        name: file.name,
        data: this.result,
        is_example: false
      });
    };
  };
}

class AudioInputExample extends FileComponentExample {
  render() {
    return <div className="input_audio_example">{this.props.value}</div>;
  }
}

export { AudioInput, AudioInputExample };
