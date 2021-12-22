import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { isPlayable } from "../../utils";

class VideoOutput extends BaseComponent {
  render() {
    if (this.props.value) {
      if (isPlayable("video", this.props.value["name"])) {
        return (
          <div className="output_video">
            <video controls playsInline preload src={this.props.value["data"]}></video>
          </div>
        );
      } else {
        return (
          <div className="output_video">
            <a
              href={this.props.value["data"]}
              download={this.props.value["name"]}
              className="video_file_holder"
            >
              {this.props.value["name"]}
            </a>
          </div>
        );
      }
    } else {
      return false;
    }
  }
}

class VideoOutputExample extends ComponentExample {
  render() {
    return <div className="output_video_example">{this.props.value}</div>;
  }
}

export { VideoOutput, VideoOutputExample };
